import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: Request) {
    try {
        const res = await handler.GET(req);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            res.headers.set(key, value);
        });
        return res;
    } catch (error) {
        console.error("Auth GET error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}

export async function POST(req: Request) {
    try {
        const res = await handler.POST(req);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            res.headers.set(key, value);
        });
        return res;
    } catch (error) {
        console.error("Auth POST error:", error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
}
