package com.authplatform.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material.icons.outlined.QrCodeScanner
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.authplatform.app.ui.components.*
import com.authplatform.app.ui.theme.*
import com.authplatform.app.ui.viewmodel.AuthViewModel

@Composable
fun LoginScreen(
    onNavigateToSignup: () -> Unit,
    onNavigateToQrScanner: () -> Unit,
    onLoginSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.isAuthenticated) {
        if (uiState.isAuthenticated) {
            onLoginSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(48.dp))

        // Brand
        Surface(
            shape = MaterialTheme.shapes.small,
            color = Primary,
            modifier = Modifier.size(32.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("A", color = PrimaryForeground, style = MaterialTheme.typography.titleMedium)
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text("AuthPlatform", style = MaterialTheme.typography.titleMedium, color = Foreground)

        Spacer(modifier = Modifier.height(24.dp))

        AuthCard {
            Text(
                "Welcome back",
                style = MaterialTheme.typography.headlineMedium,
                color = Foreground,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "Sign in to your account to continue",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedForeground,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(20.dp))

            // Email Login Form
            EmailLoginTab(viewModel, uiState)

            // Error
            if (uiState.error != null) {
                Spacer(modifier = Modifier.height(12.dp))
                Surface(
                    shape = MaterialTheme.shapes.small,
                    color = Destructive.copy(alpha = 0.1f)
                ) {
                    Text(
                        text = uiState.error!!,
                        color = Destructive,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(12.dp).fillMaxWidth()
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                Text("Don't have an account? ", style = MaterialTheme.typography.bodyMedium, color = MutedForeground)
                TextButton(onClick = onNavigateToSignup, contentPadding = PaddingValues(0.dp)) {
                    Text("Sign up", color = Foreground, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "By clicking continue, you agree to our Terms of Service and Privacy Policy.",
            style = MaterialTheme.typography.bodySmall,
            color = MutedForeground,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun EmailLoginTab(viewModel: AuthViewModel, uiState: AuthUiState) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        OAuthButtons(onSuccess = {})

        SeparatorWithText("Or continue with")

        AuthTextField(
            value = email,
            onValueChange = { email = it },
            label = "Email",
            placeholder = "m@example.com",
            enabled = !uiState.isLoading
        )

        AuthTextField(
            value = password,
            onValueChange = { password = it },
            label = "Password",
            isPassword = true,
            showPassword = showPassword,
            enabled = !uiState.isLoading,
            trailingIcon = {
                IconButton(onClick = { showPassword = !showPassword }) {
                    Icon(
                        if (showPassword) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                        contentDescription = "Toggle password",
                        tint = MutedForeground
                    )
                }
            }
        )

        PrimaryButton(
            text = if (uiState.isLoading) "Signing in..." else "Login",
            onClick = { viewModel.signInEmail(email, password) },
            loading = uiState.isLoading,
            enabled = email.isNotBlank() && password.isNotBlank()
        )
    }
}

@Composable
private fun PhoneLoginTab(viewModel: AuthViewModel, uiState: AuthUiState) {
    var phone by remember { mutableStateOf("") }
    var otp by remember { mutableStateOf("") }
    var otpSent by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        if (!otpSent) {
            AuthTextField(
                value = phone,
                onValueChange = { phone = it },
                label = "Phone Number",
                placeholder = "+91 98765 43210",
                enabled = !uiState.isLoading
            )
            PrimaryButton(
                text = if (uiState.isLoading) "Sending..." else "Send OTP",
                onClick = {
                    viewModel.sendPhoneOtp(phone)
                    otpSent = true
                },
                loading = uiState.isLoading,
                enabled = phone.length >= 10
            )
        } else {
            Text(
                "Enter the OTP sent to $phone",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedForeground
            )
            AuthTextField(
                value = otp,
                onValueChange = { otp = it },
                label = "OTP Code",
                placeholder = "123456",
                enabled = !uiState.isLoading
            )
            PrimaryButton(
                text = if (uiState.isLoading) "Verifying..." else "Verify OTP",
                onClick = { viewModel.verifyPhoneOtp(otp) },
                loading = uiState.isLoading,
                enabled = otp.length == 6
            )
            TextButton(onClick = { otpSent = false }) {
                Text("Change number", color = MutedForeground)
            }
        }
    }
}

@Composable
private fun QrLoginTab(onNavigateToQrScanner: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Icon(
            Icons.Outlined.QrCodeScanner,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MutedForeground
        )
        Text(
            "Scan the QR code shown on the web login page to sign in instantly.",
            style = MaterialTheme.typography.bodyMedium,
            color = MutedForeground,
            textAlign = TextAlign.Center
        )
        PrimaryButton(
            text = "Open QR Scanner",
            onClick = onNavigateToQrScanner
        )
    }
}

// Re-export for use in LoginScreen file
typealias AuthUiState = com.authplatform.app.ui.viewmodel.AuthUiState
