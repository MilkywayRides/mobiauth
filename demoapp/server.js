import crypto from "node:crypto";
import express from "express";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:3000";
const CONTROL_SERVICE_TOKEN = process.env.CONTROL_SERVICE_TOKEN || "";
const PORT = Number(process.env.PORT || 4100);

const decodeKey = (input, expectedBytes, keyName) => {
  if (!input) throw new Error(`${keyName} missing`);
  const trimmed = input.trim();
  const hex = /^[0-9a-fA-F]+$/.test(trimmed) ? Buffer.from(trimmed, "hex") : null;
  if (hex && hex.length === expectedBytes) return hex;
  const b64 = Buffer.from(trimmed, "base64");
  if (b64.length === expectedBytes) return b64;
  throw new Error(`${keyName} must be ${expectedBytes} bytes in hex/base64`);
};

const ENC_KEY = decodeKey(process.env.CONTROL_ENCRYPTION_KEY, 32, "CONTROL_ENCRYPTION_KEY");
const HMAC_KEY = decodeKey(process.env.CONTROL_HMAC_KEY, 32, "CONTROL_HMAC_KEY");

const sign = (s) => crypto.createHmac("sha256", HMAC_KEY).update(s).digest("hex");
const canonical = ({ timestamp, nonce, iv, tag, ciphertext }) => `${timestamp}.${nonce}.${iv}.${tag}.${ciphertext}`;

function encryptEnvelope(payload) {
  const nonce = crypto.randomBytes(18).toString("base64url");
  const timestamp = Date.now();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  const unsigned = {
    timestamp,
    nonce,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };

  return { ...unsigned, signature: sign(canonical(unsigned)) };
}

function decryptEnvelope(envelope) {
  const expected = sign(canonical(envelope));
  if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(envelope.signature, "hex"))) {
    throw new Error("invalid response signature");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    ENC_KEY,
    Buffer.from(envelope.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plain.toString("utf8"));
}

async function controlAction(actionPayload) {
  const envelope = encryptEnvelope(actionPayload);
  const res = await fetch(`${AUTH_SERVICE_URL}/api/secure/control`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-control-token": CONTROL_SERVICE_TOKEN,
    },
    body: JSON.stringify(envelope),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || `control request failed (${res.status})`);
  }
  return decryptEnvelope(body);
}

const page = (title, body) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body{font-family:Inter,Arial,sans-serif;max-width:1100px;margin:20px auto;padding:0 16px;background:#0b1020;color:#e5e7eb}
    .card{border:1px solid #334155;border-radius:12px;padding:16px;margin-bottom:16px;background:#111827}
    input,textarea,select,button{width:100%;padding:10px;margin-top:8px;border-radius:8px;border:1px solid #334155;background:#0f172a;color:#e5e7eb}
    button{cursor:pointer;background:#2563eb;border:0}
    pre{white-space:pre-wrap;word-break:break-word;background:#020617;padding:12px;border-radius:8px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  </style>
</head>
<body>
  <h1>MobiAuth Demo App (External Controller)</h1>
  <p>Uses <code>/api/secure/control</code> to manage users, API keys, and OAuth clients from another app.</p>
  ${body}
</body>
</html>`;

app.get("/", async (_req, res) => {
  try {
    const [users, keys, clients] = await Promise.all([
      controlAction({ action: "list_users", limit: 20 }),
      controlAction({ action: "list_api_keys", limit: 20 }),
      controlAction({ action: "list_oauth_clients", limit: 20 }),
    ]);

    res.send(page("Demo App", `
      <div class="grid">
        <div class="card">
          <h3>Create API key</h3>
          <form method="post" action="/create-api-key">
            <label>User ID</label><input name="userId" required />
            <label>Name</label><input name="name" required />
            <label>Scopes (comma separated)</label><input name="scopes" value="read:user" />
            <label>Rate limit/hour</label><input name="rateLimit" type="number" value="1000" />
            <button type="submit">Create API Key</button>
          </form>
        </div>

        <div class="card">
          <h3>Create OAuth client</h3>
          <form method="post" action="/create-oauth-client">
            <label>User ID</label><input name="userId" required />
            <label>Client Name</label><input name="name" required />
            <label>Redirect URIs (one per line)</label><textarea name="redirectUris" rows="4" required></textarea>
            <label>Scopes (comma separated)</label><input name="scopes" value="profile,email" />
            <button type="submit">Create OAuth Client</button>
          </form>
        </div>
      </div>

      <div class="card">
        <h3>Set user role</h3>
        <form method="post" action="/set-role">
          <label>User ID</label><input name="userId" required />
          <label>Role</label>
          <select name="role"><option>user</option><option>admin</option><option>super_admin</option></select>
          <button type="submit">Update role</button>
        </form>
      </div>

      <div class="card"><h3>Users</h3><pre>${JSON.stringify(users, null, 2)}</pre></div>
      <div class="card"><h3>API Keys</h3><pre>${JSON.stringify(keys, null, 2)}</pre></div>
      <div class="card"><h3>OAuth Clients</h3><pre>${JSON.stringify(clients, null, 2)}</pre></div>
    `));
  } catch (error) {
    res.status(500).send(page("Demo App Error", `<div class="card"><pre>${String(error)}</pre></div>`));
  }
});

app.post("/set-role", async (req, res) => {
  await controlAction({ action: "set_user_role", userId: req.body.userId, role: req.body.role });
  res.redirect("/");
});

app.post("/create-api-key", async (req, res) => {
  const scopes = (req.body.scopes || "").split(",").map((s) => s.trim()).filter(Boolean);
  const rateLimit = Number(req.body.rateLimit || 1000);
  await controlAction({
    action: "create_api_key",
    userId: req.body.userId,
    name: req.body.name,
    scopes: scopes.length ? scopes : ["read:user"],
    rateLimit,
  });
  res.redirect("/");
});

app.post("/create-oauth-client", async (req, res) => {
  const scopes = (req.body.scopes || "").split(",").map((s) => s.trim()).filter(Boolean);
  const redirectUris = String(req.body.redirectUris || "").split("\n").map((s) => s.trim()).filter(Boolean);
  await controlAction({
    action: "create_oauth_client",
    userId: req.body.userId,
    name: req.body.name,
    redirectUris,
    scopes: scopes.length ? scopes : ["profile", "email"],
  });
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Demo app running on http://localhost:${PORT}`);
});
