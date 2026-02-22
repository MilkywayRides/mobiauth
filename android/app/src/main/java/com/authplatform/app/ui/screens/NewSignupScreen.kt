package com.authplatform.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.input.*
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.authplatform.app.R
import com.authplatform.app.ui.components.*
import com.authplatform.app.ui.theme.*
import com.authplatform.app.ui.viewmodel.AuthViewModel

@Composable
fun NewSignupScreen(onNavigateToLogin: () -> Unit, onSignupSuccess: () -> Unit, viewModel: AuthViewModel = hiltViewModel()) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.isAuthenticated) { if (uiState.isAuthenticated) onSignupSuccess() }

    Box(Modifier.fillMaxSize()) {
        AnimatedGradientBackground()
        
        Column(Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding()) {
            Column(Modifier.fillMaxWidth().fillMaxHeight(0.25f).padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                Text("Create account", style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.onBackground)
                Spacer(Modifier.height(8.dp))
                Text("Sign up to get started", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f))
            }
            
            Surface(Modifier.fillMaxWidth().fillMaxHeight(), RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp), MaterialTheme.colorScheme.surface, shadowElevation = 16.dp) {
                Column(Modifier.fillMaxSize()) {
                    Box(Modifier.fillMaxWidth().padding(top = 12.dp), Alignment.Center) {
                        Box(Modifier.width(40.dp).height(4.dp).background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f), RoundedCornerShape(2.dp)))
                    }
                    
                    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Spacer(Modifier.height(8.dp))
                        
                        OutlinedTextField(name, { name = it }, Modifier.fillMaxWidth(), placeholder = { Text("Full name", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)) },
                            leadingIcon = { Icon(Icons.Outlined.Person, null, tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), modifier = Modifier.size(20.dp)) },
                            colors = OutlinedTextFieldDefaults.colors(focusedContainerColor = MaterialTheme.colorScheme.surface, unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                                focusedBorderColor = MaterialTheme.colorScheme.outline, unfocusedBorderColor = MaterialTheme.colorScheme.outline, focusedTextColor = MaterialTheme.colorScheme.onSurface, unfocusedTextColor = MaterialTheme.colorScheme.onSurface),
                            shape = RoundedCornerShape(12.dp), singleLine = true)
                        Spacer(Modifier.height(16.dp))
                        
                        OutlinedTextField(email, { email = it }, Modifier.fillMaxWidth(), placeholder = { Text("Email", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)) },
                            leadingIcon = { Icon(Icons.Outlined.Email, null, tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), modifier = Modifier.size(20.dp)) },
                            colors = OutlinedTextFieldDefaults.colors(focusedContainerColor = MaterialTheme.colorScheme.surface, unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                                focusedBorderColor = MaterialTheme.colorScheme.outline, unfocusedBorderColor = MaterialTheme.colorScheme.outline, focusedTextColor = MaterialTheme.colorScheme.onSurface, unfocusedTextColor = MaterialTheme.colorScheme.onSurface),
                            shape = RoundedCornerShape(12.dp), singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email))
                        Spacer(Modifier.height(16.dp))
                        
                        OutlinedTextField(password, { password = it }, Modifier.fillMaxWidth(), placeholder = { Text("Password", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)) },
                            leadingIcon = { Icon(Icons.Outlined.Lock, null, tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), modifier = Modifier.size(20.dp)) },
                            trailingIcon = { IconButton({ passwordVisible = !passwordVisible }) {
                                Icon(if (passwordVisible) Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff, null, tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), modifier = Modifier.size(20.dp)) }},
                            visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            colors = OutlinedTextFieldDefaults.colors(focusedContainerColor = MaterialTheme.colorScheme.surface, unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                                focusedBorderColor = MaterialTheme.colorScheme.outline, unfocusedBorderColor = MaterialTheme.colorScheme.outline, focusedTextColor = MaterialTheme.colorScheme.onSurface, unfocusedTextColor = MaterialTheme.colorScheme.onSurface),
                            shape = RoundedCornerShape(12.dp), singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password))
                        
                        uiState.error?.let { Spacer(Modifier.height(16.dp)); Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall) }
                        Spacer(Modifier.height(24.dp))
                        
                        PrimaryButton(if (uiState.isLoading) "Creating..." else "Sign up", { viewModel.signUpEmail(name, email, password) },
                            enabled = !uiState.isLoading && name.isNotEmpty() && email.isNotEmpty() && password.isNotEmpty())
                        
                        Spacer(Modifier.height(12.dp))
                        Text(buildAnnotatedString {
                            append("By continuing, you agree to our ")
                            withStyle(SpanStyle(color = MaterialTheme.colorScheme.primary)) { append("Terms") }
                            append(" and ")
                            withStyle(SpanStyle(color = MaterialTheme.colorScheme.primary)) { append("Privacy Policy") }
                        }, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f), textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                        
                        Spacer(Modifier.height(24.dp))
                        
                        Row(Modifier.fillMaxWidth(), Arrangement.Center, Alignment.CenterVertically) {
                            HorizontalDivider(Modifier.weight(1f), color = MaterialTheme.colorScheme.outline)
                            Text("OR", Modifier.padding(horizontal = 16.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f), style = MaterialTheme.typography.bodySmall)
                            HorizontalDivider(Modifier.weight(1f), color = MaterialTheme.colorScheme.outline)
                        }
                        Spacer(Modifier.height(24.dp))
                        
                        Button({}, Modifier.fillMaxWidth().height(56.dp), colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface, contentColor = MaterialTheme.colorScheme.onSurface),
                            shape = RoundedCornerShape(28.dp), border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)) {
                            Icon(painterResource(R.drawable.ic_google), null, modifier = Modifier.size(20.dp), tint = Color.Unspecified)
                            Spacer(Modifier.width(12.dp))
                            Text("Continue with Google", style = MaterialTheme.typography.bodyMedium)
                        }
                        Spacer(Modifier.height(12.dp))
                        
                        Button({}, Modifier.fillMaxWidth().height(56.dp), colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface, contentColor = MaterialTheme.colorScheme.onSurface),
                            shape = RoundedCornerShape(28.dp), border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline)) {
                            Icon(painterResource(if (androidx.compose.foundation.isSystemInDarkTheme()) R.drawable.ic_github_light else R.drawable.ic_github), null, modifier = Modifier.size(20.dp), tint = Color.Unspecified)
                            Spacer(Modifier.width(12.dp))
                            Text("Continue with GitHub", style = MaterialTheme.typography.bodyMedium)
                        }
                        Spacer(Modifier.height(24.dp))
                        
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("Already have an account? ", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                            TextButton(onNavigateToLogin) { Text("Sign in", color = MaterialTheme.colorScheme.primary) }
                        }
                    }
                }
            }
        }
    }
}
