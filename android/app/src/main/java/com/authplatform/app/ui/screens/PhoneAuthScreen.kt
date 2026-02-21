package com.authplatform.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowDropDown
import androidx.compose.material.icons.outlined.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.authplatform.app.ui.components.*
import com.authplatform.app.ui.theme.*
import com.authplatform.app.ui.viewmodel.AuthViewModel
import com.google.firebase.FirebaseException
import com.google.firebase.auth.*
import java.util.concurrent.TimeUnit

@Composable
fun PhoneAuthScreen(
    onAuthSuccess: () -> Unit,
    onSkip: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    var phoneNumber by remember { mutableStateOf("") }
    var countryCode by remember { mutableStateOf("+1") }
    var showCountryPicker by remember { mutableStateOf(false) }
    var verificationIdState by remember { mutableStateOf<String?>(null) }
    var otpCode by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Box(modifier = Modifier.fillMaxSize()) {
        AnimatedGradientBackground()
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = Icons.Outlined.Phone,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = Primary
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "Phone Verification",
                style = MaterialTheme.typography.headlineLarge,
                color = Foreground
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Enter your phone number to continue",
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
                    if (verificationIdState == null) {
                        Text(
                            "Phone Number",
                            style = MaterialTheme.typography.labelMedium,
                            color = Foreground
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Country Code
                            OutlinedButton(
                                onClick = { showCountryPicker = true },
                                modifier = Modifier.width(90.dp).height(56.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = Background,
                                    contentColor = Foreground
                                ),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Input),
                                shape = RoundedCornerShape(12.dp),
                                contentPadding = PaddingValues(8.dp)
                            ) {
                                Text(countryCode, style = MaterialTheme.typography.bodyMedium)
                                Icon(
                                    Icons.Outlined.ArrowDropDown,
                                    null,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            
                            // Phone Number
                            OutlinedTextField(
                                value = phoneNumber,
                                onValueChange = { phoneNumber = it },
                                placeholder = { Text("1234567890", color = MutedForeground) },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                modifier = Modifier.weight(1f),
                                enabled = !isLoading,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedContainerColor = Background,
                                    unfocusedContainerColor = Background,
                                    focusedBorderColor = Input,
                                    unfocusedBorderColor = Input,
                                    focusedTextColor = Foreground,
                                    unfocusedTextColor = Foreground
                                ),
                                shape = RoundedCornerShape(12.dp),
                                singleLine = true
                            )
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        PrimaryButton(
                            text = if (isLoading) "Sending..." else "Send OTP",
                            onClick = {
                                errorMessage = "Firebase Phone Auth not configured. Please complete Firebase setup."
                            },
                            enabled = !isLoading && phoneNumber.isNotBlank()
                        )
                    } else {
                        Text(
                            "Verification Code",
                            style = MaterialTheme.typography.labelMedium,
                            color = Foreground
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        OutlinedTextField(
                            value = otpCode,
                            onValueChange = { otpCode = it },
                            placeholder = { Text("Enter 6-digit code", color = MutedForeground) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !isLoading,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = Background,
                                unfocusedContainerColor = Background,
                                focusedBorderColor = Input,
                                unfocusedBorderColor = Input,
                                focusedTextColor = Foreground,
                                unfocusedTextColor = Foreground
                            ),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        PrimaryButton(
                            text = if (isLoading) "Verifying..." else "Verify OTP",
                            onClick = {
                                errorMessage = "Firebase Phone Auth not configured. Please complete Firebase setup."
                            },
                            enabled = !isLoading && otpCode.isNotBlank()
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        TextButton(
                            onClick = { verificationIdState = null; otpCode = "" },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Change Number", color = Primary)
                        }
                    }

                    errorMessage?.let {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = it,
                            color = Destructive,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            TextButton(onClick = onSkip) {
                Text("Skip for now", color = MutedForeground)
            }
        }
        
        // Country Picker Dialog
        if (showCountryPicker) {
            AlertDialog(
                onDismissRequest = { showCountryPicker = false },
                title = { Text("Select Country Code") },
                text = {
                    Column {
                        listOf("+1 USA", "+44 UK", "+91 India", "+86 China", "+81 Japan").forEach { country ->
                            TextButton(
                                onClick = {
                                    countryCode = country.split(" ")[0]
                                    showCountryPicker = false
                                },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(country, modifier = Modifier.fillMaxWidth())
                            }
                        }
                    }
                },
                confirmButton = {
                    TextButton(onClick = { showCountryPicker = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}
