package com.authplatform.app.ui.navigation

import androidx.compose.runtime.*
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.authplatform.app.ui.screens.*
import com.authplatform.app.ui.viewmodel.AuthViewModel

object Routes {
    const val PHONE_AUTH = "phone_auth"
    const val LOGIN = "login"
    const val SIGNUP = "signup"
    const val EMAIL_VERIFICATION = "email_verification"
    const val DASHBOARD = "dashboard"
    const val QR_SCANNER = "qr_scanner"
}

@Composable
fun NavGraph() {
    val navController = rememberNavController()
    val viewModel: AuthViewModel = hiltViewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    // Check if user is already logged in
    LaunchedEffect(Unit) {
        viewModel.loadUserData()
    }
    
    val startDestination = if (uiState.isAuthenticated) Routes.DASHBOARD else Routes.PHONE_AUTH

    NavHost(navController = navController, startDestination = startDestination) {
        composable(Routes.PHONE_AUTH) {
            PhoneAuthScreen(
                onAuthSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.PHONE_AUTH) { inclusive = true }
                    }
                },
                onSkip = {
                    navController.navigate(Routes.LOGIN) {
                        launchSingleTop = true
                    }
                }
            )
        }

        composable(Routes.LOGIN) {
            LoginScreen(
                onNavigateToSignup = {
                    navController.navigate(Routes.SIGNUP) {
                        launchSingleTop = true
                    }
                },
                onNavigateToQrScanner = {
                    navController.navigate(Routes.QR_SCANNER) {
                        launchSingleTop = true
                    }
                },
                onLoginSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.SIGNUP) {
            SignupScreen(
                onNavigateToLogin = {
                    navController.popBackStack()
                },
                onSignupSuccess = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.EMAIL_VERIFICATION) {
            EmailVerificationScreen(
                email = "user@example.com", // TODO: Pass actual email
                onVerified = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onResend = {
                    // TODO: Resend verification email
                }
            )
        }

        composable(Routes.DASHBOARD) {
            MainScreen(
                onSignOut = {
                    navController.navigate(Routes.PHONE_AUTH) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onScanQr = {
                    navController.navigate(Routes.QR_SCANNER)
                }
            )
        }

        composable(Routes.QR_SCANNER) {
            QrScannerScreen(
                onBack = { navController.popBackStack() },
                onScanSuccess = { navController.popBackStack() }
            )
        }
    }
}
