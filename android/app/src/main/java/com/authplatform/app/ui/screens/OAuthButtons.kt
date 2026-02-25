package com.authplatform.app.ui.screens

import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.authplatform.app.BuildConfig
import com.authplatform.app.ui.utils.extractHost
import com.authplatform.app.ui.utils.isTrustedAuthDomain

@Composable
fun OAuthButtons(
    onSuccess: () -> Unit,
) {
    val context = LocalContext.current
    val baseUrl = BuildConfig.BASE_URL

    var pendingExternalUrl by remember { mutableStateOf<String?>(null) }

    fun launchAuthUrl(url: String) {
        val intent = CustomTabsIntent.Builder().setShowTitle(true).build()
        intent.launchUrl(context, Uri.parse(url))
    }

    fun openWithConfirmation(url: String) {
        if (isTrustedAuthDomain(url)) {
            launchAuthUrl(url)
        } else {
            pendingExternalUrl = url
        }
    }

    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        OutlinedButton(
            onClick = {
                val url = "$baseUrl/api/auth/sign-in/social/google"
                openWithConfirmation(url)
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Icon(
                imageVector = Icons.Default.Email,
                contentDescription = "Google",
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Continue with Google")
        }

        OutlinedButton(
            onClick = {
                val url = "$baseUrl/api/auth/sign-in/social/github"
                openWithConfirmation(url)
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Icon(
                imageVector = Icons.Default.Email,
                contentDescription = "GitHub",
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Continue with GitHub")
        }
    }

    pendingExternalUrl?.let { externalUrl ->
        AlertDialog(
            onDismissRequest = { pendingExternalUrl = null },
            title = { Text("Share data with external app?") },
            text = {
                Text(
                    "You are about to continue sign-in on ${extractHost(externalUrl)}. " +
                        "Your profile data may be shared with that app. Do you want to continue?"
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    pendingExternalUrl = null
                    launchAuthUrl(externalUrl)
                }) {
                    Text("Continue")
                }
            },
            dismissButton = {
                TextButton(onClick = { pendingExternalUrl = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}
