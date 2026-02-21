package com.authplatform.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.authplatform.app.ui.components.BottomNavBar

@Composable
fun MainScreen(
    onSignOut: () -> Unit,
    onScanQr: () -> Unit
) {
    var selectedTab by remember { mutableIntStateOf(3) } // Start on Settings

    Scaffold(
        bottomBar = {
            BottomNavBar(
                selectedTab = selectedTab,
                onTabSelected = { selectedTab = it },
                onQrClick = onScanQr
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when (selectedTab) {
                0 -> HomeTab()
                1 -> SearchTab()
                2 -> ExploreTab()
                3 -> DashboardScreen(onSignOut = onSignOut, onScanQr = onScanQr)
            }
        }
    }
}

@Composable
private fun HomeTab() {
    Box(modifier = Modifier.fillMaxSize()) {
        // TODO: Home content
    }
}

@Composable
private fun SearchTab() {
    Box(modifier = Modifier.fillMaxSize()) {
        // TODO: Search content
    }
}

@Composable
private fun ExploreTab() {
    Box(modifier = Modifier.fillMaxSize()) {
        // TODO: Explore content
    }
}
