package com.authplatform.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.authplatform.app.ui.components.*
import com.authplatform.app.ui.theme.*

@Composable
fun EmailVerificationScreen(
    email: String,
    onVerified: () -> Unit,
    onResend: () -> Unit
) {
    var otp by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.weight(1f))

            Icon(
                imageVector = Icons.Outlined.Email,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = Primary
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Verify Your Email",
                style = MaterialTheme.typography.headlineMedium,
                color = Foreground
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "We sent a verification code to",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedForeground,
                textAlign = TextAlign.Center
            )

            Text(
                text = email,
                style = MaterialTheme.typography.bodyMedium,
                color = Foreground,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = otp,
                onValueChange = { if (it.length <= 6) otp = it },
                label = { Text("Verification Code") },
                placeholder = { Text("123456") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading
            )

            Spacer(modifier = Modifier.height(16.dp))

            PrimaryButton(
                text = if (isLoading) "Verifying..." else "Verify Email",
                onClick = {
                    if (otp.length == 6) {
                        isLoading = true
                        // TODO: Call API to verify OTP
                        errorMessage = "Email verification not configured yet"
                        isLoading = false
                    }
                },
                loading = isLoading,
                enabled = otp.length == 6
            )

            errorMessage?.let {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = it,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            TextButton(onClick = onResend) {
                Text("Resend Code")
            }

            Spacer(modifier = Modifier.weight(1f))

            TextButton(onClick = onVerified) {
                Text("Skip for now")
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
