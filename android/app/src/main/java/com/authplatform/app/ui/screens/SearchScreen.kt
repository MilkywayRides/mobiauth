package com.authplatform.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.authplatform.app.ui.theme.*

@Composable
fun SearchScreen() {
    var searchQuery by remember { mutableStateOf("") }
    val searchResults = remember(searchQuery) {
        if (searchQuery.isEmpty()) emptyList()
        else mockSearchResults.filter { 
            it.title.contains(searchQuery, ignoreCase = true) ||
            it.description.contains(searchQuery, ignoreCase = true)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .statusBarsPadding()
            .navigationBarsPadding()
            .padding(24.dp)
    ) {
        Text(
            "Search",
            style = MaterialTheme.typography.headlineLarge,
            color = Foreground
        )
        
        Spacer(modifier = Modifier.height(24.dp))

        // Search Input
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { 
                Text(
                    "Search...", 
                    color = MutedForeground,
                    style = MaterialTheme.typography.bodyLarge
                ) 
            },
            leadingIcon = {
                Icon(
                    Icons.Outlined.Search,
                    contentDescription = null,
                    tint = MutedForeground,
                    modifier = Modifier.size(20.dp)
                )
            },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(
                            Icons.Outlined.Close,
                            contentDescription = "Clear",
                            tint = MutedForeground,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            },
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Background,
                unfocusedContainerColor = Background,
                focusedBorderColor = Input,
                unfocusedBorderColor = Input,
                focusedTextColor = Foreground,
                unfocusedTextColor = Foreground,
                cursorColor = Foreground
            ),
            shape = RoundedCornerShape(12.dp),
            singleLine = true,
            textStyle = MaterialTheme.typography.bodyLarge
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Results
        if (searchQuery.isEmpty()) {
            EmptyState(
                title = "Start searching",
                description = "Enter a search term to find what you're looking for"
            )
        } else if (searchResults.isEmpty()) {
            EmptyState(
                title = "No results found",
                description = "Try adjusting your search terms"
            )
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(searchResults) { result ->
                    SearchResultItem(result)
                }
            }
        }
    }
}

@Composable
private fun SearchResultItem(result: SearchResult) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        color = Card,
        border = androidx.compose.foundation.BorderStroke(1.dp, Border)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                result.title,
                style = MaterialTheme.typography.titleMedium,
                color = Foreground
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                result.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MutedForeground,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun EmptyState(title: String, description: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 48.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Outlined.Search,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = Muted
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            title,
            style = MaterialTheme.typography.titleLarge,
            color = Foreground
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            description,
            style = MaterialTheme.typography.bodyMedium,
            color = MutedForeground
        )
    }
}

data class SearchResult(
    val title: String,
    val description: String
)

private val mockSearchResults = listOf(
    SearchResult("Account Settings", "Manage your account preferences and security settings"),
    SearchResult("Privacy Policy", "Learn about how we protect your data and privacy"),
    SearchResult("Two-Factor Authentication", "Add an extra layer of security to your account"),
    SearchResult("Active Sessions", "View and manage your active login sessions"),
    SearchResult("Email Notifications", "Configure your email notification preferences"),
    SearchResult("Password Reset", "Change or reset your account password"),
    SearchResult("Profile Information", "Update your personal information and profile details"),
    SearchResult("Connected Devices", "Manage devices connected to your account"),
    SearchResult("API Access", "Generate and manage API keys for developers"),
    SearchResult("Help & Support", "Get help with common issues and contact support")
)
