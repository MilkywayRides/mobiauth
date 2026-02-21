package com.authplatform.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.authplatform.app.ui.components.AnimatedGradientBackground
import com.authplatform.app.ui.components.PrimaryButton
import com.authplatform.app.ui.theme.*
import com.authplatform.app.ui.viewmodel.AuthViewModel

@Composable
fun NewLoginScreen(
    onNavigateToSignup: () -> Unit,
    onLoginSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.isAuthenticated) {
        if (uiState.isAuthenticated) {
            onLoginSuccess()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AnimatedGradientBackground()
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                "Welcome back",
                style = MaterialTheme.typography.headlineLarge,
                color = Foreground
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "Enter your credentials to continue",
                style = MaterialTheme.typography.bodyMedium,
                color = MutedForeground
            )

            Spacer(modifier = Modifier.height(48.dp))

            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                color = Card.copy(alpha = 0.95f),
                shadowElevation = 8.dp
            ) {
                Column(
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(
                        "Email",
                        style = MaterialTheme.typography.labelMedium,
                        color = Foreground
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("you@example.com", color = MutedForeground) },
                        leadingIcon = {
                            Icon(Icons.Outlined.Email, null, tint = MutedForeground, modifier = Modifier.size(20.dp))
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Background,
                            unfocusedContainerColor = Background,
                            focusedBorderColor = Input,
                            unfocusedBorderColor = Input,
                            focusedTextColor = Foreground,
                            unfocusedTextColor = Foreground
                        ),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        "Password",
                        style = MaterialTheme.typography.labelMedium,
                        color = Foreground
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("••••••••", color = MutedForeground) },
                        leadingIcon = {
                            Icon(Icons.Outlined.Lock, null, tint = MutedForeground, modifier = Modifier.size(20.dp))
                        },
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    if (passwordVisible) Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                                    null,
                                    tint = MutedForeground,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        },
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Background,
                            unfocusedContainerColor = Background,
                            focusedBorderColor = Input,
                            unfocusedBorderColor = Input,
                            focusedTextColor = Foreground,
                            unfocusedTextColor = Foreground
                        ),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )

                    if (uiState.error != null) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            uiState.error!!,
                            color = Destructive,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    PrimaryButton(
                        text = if (uiState.isLoading) "Signing in..." else "Sign in",
                        onClick = {
                            viewModel.signInEmail(email, password)
                        },
                        enabled = !uiState.isLoading && email.isNotEmpty() && password.isNotEmpty()
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Don't have an account? ",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MutedForeground
                )
                TextButton(onClick = onNavigateToSignup) {
                    Text("Sign up", color = Primary)
                }
            }
        }
    }
}
