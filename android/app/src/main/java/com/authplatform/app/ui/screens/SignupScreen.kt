package com.authplatform.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
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
fun SignupScreen(
    onNavigateToLogin: () -> Unit,
    onSignupSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.isAuthenticated) {
        if (uiState.isAuthenticated) {
            onSignupSuccess()
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
                "Create an account",
                style = MaterialTheme.typography.headlineMedium,
                color = Foreground,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                "Get started with your free account",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedForeground,
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(24.dp))

            // OAuth
            OutlineButton(text = "Sign up with Google", onClick = { /* TODO */ })
            Spacer(modifier = Modifier.height(12.dp))
            OutlineButton(text = "Sign up with GitHub", onClick = { /* TODO */ })

            Spacer(modifier = Modifier.height(20.dp))
            SeparatorWithText("Or continue with")
            Spacer(modifier = Modifier.height(20.dp))

            // Form
            AuthTextField(
                value = name,
                onValueChange = { name = it },
                label = "Full Name",
                placeholder = "John Doe",
                enabled = !uiState.isLoading
            )
            Spacer(modifier = Modifier.height(16.dp))

            AuthTextField(
                value = email,
                onValueChange = { email = it },
                label = "Email",
                placeholder = "m@example.com",
                enabled = !uiState.isLoading
            )
            Spacer(modifier = Modifier.height(16.dp))

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
                            contentDescription = "Toggle",
                            tint = MutedForeground
                        )
                    }
                }
            )
            Spacer(modifier = Modifier.height(8.dp))
            PasswordStrengthIndicator(password)

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

            Spacer(modifier = Modifier.height(20.dp))
            PrimaryButton(
                text = if (uiState.isLoading) "Creating account..." else "Create account",
                onClick = { viewModel.signUpEmail(name, email, password) },
                loading = uiState.isLoading,
                enabled = name.isNotBlank() && email.isNotBlank() && password.length >= 8
            )

            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                Text("Already have an account? ", style = MaterialTheme.typography.bodyMedium, color = MutedForeground)
                TextButton(onClick = onNavigateToLogin, contentPadding = PaddingValues(0.dp)) {
                    Text("Sign in", color = Foreground, style = MaterialTheme.typography.bodyMedium)
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
