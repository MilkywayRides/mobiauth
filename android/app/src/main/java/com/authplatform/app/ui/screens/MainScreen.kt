package com.authplatform.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
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
    var selectedTab by remember { mutableIntStateOf(3) }
    var previousTab by remember { mutableIntStateOf(3) }

    Scaffold(
        bottomBar = {
            BottomNavBar(
                selectedTab = selectedTab,
                onTabSelected = { 
                    previousTab = selectedTab
                    selectedTab = it 
                },
                onQrClick = onScanQr
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            AnimatedContent(
                targetState = selectedTab,
                transitionSpec = {
                    if (targetState > initialState) {
                        slideInHorizontally(animationSpec = tween(300)) { it } + fadeIn(tween(300)) togetherWith
                        slideOutHorizontally(animationSpec = tween(300)) { -it } + fadeOut(tween(300))
                    } else {
                        slideInHorizontally(animationSpec = tween(300)) { -it } + fadeIn(tween(300)) togetherWith
                        slideOutHorizontally(animationSpec = tween(300)) { it } + fadeOut(tween(300))
                    }
                },
                label = "tab_animation"
            ) { tab ->
                when (tab) {
                    0 -> HomeTab()
                    1 -> SearchScreen()
                    2 -> ExploreTab()
                    3 -> DashboardScreen(onSignOut = onSignOut, onScanQr = onScanQr)
                }
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
private fun ExploreTab() {
    Box(modifier = Modifier.fillMaxSize()) {
        // TODO: Explore content
    }
}
