package com.authplatform.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = Primary,
    onPrimary = PrimaryForeground,
    primaryContainer = Secondary,
    onPrimaryContainer = SecondaryForeground,
    secondary = Secondary,
    onSecondary = SecondaryForeground,
    secondaryContainer = Muted,
    onSecondaryContainer = MutedForeground,
    tertiary = Accent,
    onTertiary = AccentForeground,
    background = Background,
    onBackground = Foreground,
    surface = Background,
    onSurface = Foreground,
    surfaceVariant = Card,
    onSurfaceVariant = CardForeground,
    surfaceContainerLowest = Background,
    surfaceContainerLow = ZincColors.Zinc950,
    surfaceContainer = Card,
    surfaceContainerHigh = ZincColors.Zinc800,
    surfaceContainerHighest = ZincColors.Zinc700,
    error = Destructive,
    onError = DestructiveForeground,
    outline = Border,
    outlineVariant = Input,
    inverseSurface = ZincColors.Zinc50,
    inverseOnSurface = ZincColors.Zinc900,
    scrim = Color.Black
)

@Composable
fun AuthPlatformTheme(content: @Composable () -> Unit) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? android.app.Activity)?.window ?: return@SideEffect
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = false
                isAppearanceLightNavigationBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = AppTypography,
        content = content
    )
}
