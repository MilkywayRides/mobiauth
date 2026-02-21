package com.authplatform.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.authplatform.app.ui.theme.*

// ShadCN-style Card
@Composable
fun AuthCard(
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Card),
        border = BorderStroke(1.dp, Border)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            content = content
        )
    }
}

// ShadCN-style outlined text field
@Composable
fun AuthTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    isPassword: Boolean = false,
    showPassword: Boolean = false,
    trailingIcon: @Composable (() -> Unit)? = null,
    enabled: Boolean = true
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelLarge,
            color = Foreground
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = {
                Text(placeholder, color = MutedForeground)
            },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            shape = RoundedCornerShape(8.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Ring,
                unfocusedBorderColor = Border,
                focusedContainerColor = Background,
                unfocusedContainerColor = Background,
                cursorColor = Foreground,
                focusedTextColor = Foreground,
                unfocusedTextColor = Foreground
            ),
            visualTransformation = if (isPassword && !showPassword) {
                PasswordVisualTransformation()
            } else {
                VisualTransformation.None
            },
            trailingIcon = trailingIcon,
            singleLine = true,
            enabled = enabled
        )
    }
}

// ShadCN-style primary button
@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false
) {
    Button(
        onClick = onClick,
        modifier = modifier.fillMaxWidth().height(44.dp),
        enabled = enabled && !loading,
        shape = RoundedCornerShape(8.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Primary,
            contentColor = PrimaryForeground,
            disabledContainerColor = Primary.copy(alpha = 0.5f),
            disabledContentColor = PrimaryForeground.copy(alpha = 0.5f)
        )
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(18.dp),
                color = PrimaryForeground,
                strokeWidth = 2.dp
            )
            Spacer(modifier = Modifier.width(8.dp))
        }
        Text(text, style = MaterialTheme.typography.labelLarge)
    }
}

// ShadCN-style outline button
@Composable
fun OutlineButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: @Composable (() -> Unit)? = null,
    enabled: Boolean = true
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.fillMaxWidth().height(44.dp),
        enabled = enabled,
        shape = RoundedCornerShape(8.dp),
        border = BorderStroke(1.dp, Border),
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = Foreground,
            containerColor = Background
        )
    ) {
        icon?.invoke()
        if (icon != null) Spacer(modifier = Modifier.width(8.dp))
        Text(text, style = MaterialTheme.typography.labelLarge)
    }
}

// Separator with text (like "Or continue with")
@Composable
fun SeparatorWithText(text: String, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        HorizontalDivider(modifier = Modifier.weight(1f), color = Border)
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 16.dp),
            style = MaterialTheme.typography.bodySmall,
            color = MutedForeground
        )
        HorizontalDivider(modifier = Modifier.weight(1f), color = Border)
    }
}

// Password strength indicator
@Composable
fun PasswordStrengthIndicator(password: String) {
    if (password.isEmpty()) return

    val strength = calculateStrength(password)
    val labels = listOf("Very Weak", "Weak", "Fair", "Strong", "Very Strong")
    val colors = listOf(
        Destructive,
        androidx.compose.ui.graphics.Color(0xFFF97316),
        androidx.compose.ui.graphics.Color(0xFFF59E0B),
        androidx.compose.ui.graphics.Color(0xFF10B981),
        Success
    )

    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.fillMaxWidth()) {
            repeat(5) { i ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(4.dp)
                        .then(
                            Modifier.let {
                                val bgColor = if (i < strength) colors[strength - 1] else Muted
                                it
                            }
                        )
                ) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        shape = RoundedCornerShape(2.dp),
                        color = if (i < strength) colors[strength - 1] else Muted
                    ) {}
                }
            }
        }
        Text(
            text = if (strength > 0) labels[strength - 1] else "Too short",
            style = MaterialTheme.typography.bodySmall,
            color = MutedForeground
        )

        // Requirements
        val reqs = listOf(
            "8+ characters" to (password.length >= 8),
            "Uppercase" to password.any { it.isUpperCase() },
            "Number" to password.any { it.isDigit() },
            "Special char" to password.any { !it.isLetterOrDigit() }
        )
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                reqs.take(2).forEach { (label, met) ->
                    RequirementItem(label, met)
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                reqs.drop(2).forEach { (label, met) ->
                    RequirementItem(label, met)
                }
            }
        }
    }
}

@Composable
private fun RequirementItem(label: String, met: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = if (met) "✓" else "✗",
            style = MaterialTheme.typography.bodySmall,
            color = if (met) Success else MutedForeground
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = if (met) Success else MutedForeground
        )
    }
}

private fun calculateStrength(password: String): Int {
    var score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (password.any { it.isUpperCase() }) score++
    if (password.any { it.isDigit() }) score++
    if (password.any { !it.isLetterOrDigit() }) score++
    return score
}
