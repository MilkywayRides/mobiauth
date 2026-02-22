package com.authplatform.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
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

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF18181B),
    onPrimary = Color(0xFFFAFAFA),
    primaryContainer = Color(0xFFF4F4F5),
    onPrimaryContainer = Color(0xFF18181B),
    secondary = Color(0xFFF4F4F5),
    onSecondary = Color(0xFF18181B),
    secondaryContainer = Color(0xFFF4F4F5),
    onSecondaryContainer = Color(0xFF71717A),
    tertiary = Color(0xFF18181B),
    onTertiary = Color(0xFFFAFAFA),
    background = Color(0xFFFFFFFF),
    onBackground = Color(0xFF09090B),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF09090B),
    surfaceVariant = Color(0xFFFFFFFF),
    onSurfaceVariant = Color(0xFF09090B),
    surfaceContainerLowest = Color(0xFFFFFFFF),
    surfaceContainerLow = Color(0xFFFAFAFA),
    surfaceContainer = Color(0xFFFFFFFF),
    surfaceContainerHigh = Color(0xFFF4F4F5),
    surfaceContainerHighest = Color(0xFFE4E4E7),
    error = Color(0xFFEF4444),
    onError = Color(0xFFFEF2F2),
    outline = Color(0xFFE4E4E7),
    outlineVariant = Color(0xFFE4E4E7),
    inverseSurface = Color(0xFF18181B),
    inverseOnSurface = Color(0xFFFAFAFA),
    scrim = Color.Black
)

@Composable
fun AuthPlatformTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? android.app.Activity)?.window ?: return@SideEffect
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !darkTheme
                isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content
    )
}
