package com.authplatform.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Logout
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Computer
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.PhoneAndroid
import androidx.compose.material.icons.outlined.QrCodeScanner
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.authplatform.app.ui.components.AuthCard
import com.authplatform.app.ui.components.PrimaryButton
import com.authplatform.app.ui.theme.*
import com.authplatform.app.ui.viewmodel.AuthViewModel
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onSignOut: () -> Unit,
    onScanQr: () -> Unit = {},
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var isRefreshing by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        viewModel.loadUserData()
    }

    LaunchedEffect(uiState.isLoadingSessions) {
        if (!uiState.isLoadingSessions && isRefreshing) {
            delay(300)
            isRefreshing = false
        }
    }

    PullToRefreshBox(
        isRefreshing = isRefreshing,
        onRefresh = {
            isRefreshing = true
            viewModel.loadUserData()
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
        Spacer(modifier = Modifier.height(32.dp))

        // Avatar
        Surface(
            shape = CircleShape,
            color = Muted,
            modifier = Modifier.size(80.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                val initials = uiState.userName?.split(" ")
                    ?.mapNotNull { it.firstOrNull()?.uppercase() }
                    ?.take(2)
                    ?.joinToString("") ?: "?"
                Text(
                    initials,
                    style = MaterialTheme.typography.headlineMedium,
                    color = Foreground
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text(
            uiState.userName ?: "User",
            style = MaterialTheme.typography.headlineMedium,
            color = Foreground
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            uiState.userEmail ?: "",
            style = MaterialTheme.typography.bodyMedium,
            color = MutedForeground
        )

        // Role badge
        if (uiState.userRole != null) {
            Spacer(modifier = Modifier.height(12.dp))
            Surface(
                shape = MaterialTheme.shapes.small,
                color = if (uiState.userRole == "admin") Primary.copy(alpha = 0.15f) else Muted
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Outlined.Shield,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = if (uiState.userRole == "admin") Primary else MutedForeground
                    )
                    Text(
                        uiState.userRole!!.replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.labelMedium,
                        color = if (uiState.userRole == "admin") Primary else MutedForeground
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        AuthCard {
            Text(
                "Account Information",
                style = MaterialTheme.typography.titleMedium,
                color = Foreground
            )
            Spacer(modifier = Modifier.height(16.dp))

            InfoRow(Icons.Outlined.Person, "Name", uiState.userName ?: "Not set")
            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = Border)
            Spacer(modifier = Modifier.height(12.dp))
            InfoRow(Icons.Outlined.Email, "Email", uiState.userEmail ?: "Not set")
            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = Border)
            Spacer(modifier = Modifier.height(12.dp))
            InfoRow(Icons.Outlined.Shield, "Role", uiState.userRole?.replaceFirstChar { it.uppercase() } ?: "User")
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Active Sessions
        AuthCard {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Active Sessions",
                    style = MaterialTheme.typography.titleMedium,
                    color = Foreground
                )
                if (uiState.sessions.isNotEmpty()) {
                    Text(
                        "${uiState.sessions.size}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MutedForeground
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            if (uiState.isLoadingSessions) {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp))
                }
            } else if (uiState.sessions.isEmpty()) {
                Text(
                    "No active sessions",
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedForeground
                )
            } else {
                uiState.sessions.forEachIndexed { index, session ->
                    SessionItem(
                        session = session,
                        onTerminate = { viewModel.terminateSession(session.id) }
                    )
                    if (index < uiState.sessions.size - 1) {
                        Spacer(modifier = Modifier.height(12.dp))
                        HorizontalDivider(color = Border)
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedButton(
            onClick = onScanQr,
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(
                imageVector = Icons.Outlined.QrCodeScanner,
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Scan QR to Login on Web")
        }

        Spacer(modifier = Modifier.weight(1f))

        PrimaryButton(
            text = "Sign out",
            onClick = {
                viewModel.signOut()
                onSignOut()
            },
            modifier = Modifier.padding(bottom = 16.dp)
        )
    }
    }
}

@Composable
private fun InfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, modifier = Modifier.size(18.dp), tint = MutedForeground)
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(label, style = MaterialTheme.typography.bodySmall, color = MutedForeground)
            Text(value, style = MaterialTheme.typography.bodyMedium, color = Foreground)
        }
    }
}

@Composable
private fun SessionItem(
    session: com.authplatform.app.data.model.Session,
    onTerminate: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (session.userAgent?.contains("Mobile", ignoreCase = true) == true)
                    Icons.Outlined.PhoneAndroid
                else
                    Icons.Outlined.Computer,
                contentDescription = null,
                modifier = Modifier.size(20.dp),
                tint = MutedForeground
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    session.userAgent?.take(30) ?: "Unknown Device",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Foreground,
                    maxLines = 1
                )
                Text(
                    session.ipAddress ?: "Unknown IP",
                    style = MaterialTheme.typography.bodySmall,
                    color = MutedForeground
                )
            }
        }
        IconButton(onClick = onTerminate) {
            Icon(
                imageVector = Icons.Outlined.Close,
                contentDescription = "Terminate",
                tint = MaterialTheme.colorScheme.error,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
