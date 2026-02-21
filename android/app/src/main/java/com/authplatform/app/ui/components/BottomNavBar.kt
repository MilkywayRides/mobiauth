package com.authplatform.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.authplatform.app.ui.theme.*

@Composable
fun BottomNavBar(
    selectedTab: Int,
    onTabSelected: (Int) -> Unit,
    onQrClick: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxWidth()
    ) {
        // Blurred background layer
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp)
                .background(Background.copy(alpha = 0.7f))
                .blur(15.dp)
        )
        
        // Clear buttons layer on top
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp, horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NavItem(
                icon = Icons.Outlined.Home,
                selected = selectedTab == 0,
                onClick = { onTabSelected(0) }
            )
            
            NavItem(
                icon = Icons.Outlined.Search,
                selected = selectedTab == 1,
                onClick = { onTabSelected(1) }
            )
            
            // QR Button
            FloatingActionButton(
                onClick = onQrClick,
                containerColor = Primary,
                modifier = Modifier.size(56.dp)
            ) {
                Icon(
                    Icons.Outlined.QrCodeScanner,
                    contentDescription = "Scan QR",
                    tint = PrimaryForeground
                )
            }
            
            NavItem(
                icon = Icons.Outlined.Explore,
                selected = selectedTab == 2,
                onClick = { onTabSelected(2) }
            )
            
            NavItem(
                icon = Icons.Outlined.Settings,
                selected = selectedTab == 3,
                onClick = { onTabSelected(3) }
            )
        }
    }
}

@Composable
private fun NavItem(
    icon: ImageVector,
    selected: Boolean,
    onClick: () -> Unit
) {
    IconButton(onClick = onClick) {
        Icon(
            icon,
            contentDescription = null,
            tint = if (selected) Primary else MutedForeground,
            modifier = Modifier.size(24.dp)
        )
    }
}
