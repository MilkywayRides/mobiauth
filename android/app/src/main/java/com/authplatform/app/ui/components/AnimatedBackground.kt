package com.authplatform.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import kotlin.math.sin
import kotlin.math.cos

@Composable
fun AnimatedGradientBackground() {
    val infiniteTransition = rememberInfiniteTransition(label = "gradient")
    
    val offset1 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(20000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "offset1"
    )
    
    val offset2 by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(15000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "offset2"
    )
    
    val offset3 by infiniteTransition.animateFloat(
        initialValue = 360f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(25000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "offset3"
    )

    Canvas(modifier = Modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height
        
        // Bubble 1 - Purple
        val x1 = width * 0.2f + (width * 0.3f * sin(Math.toRadians(offset1.toDouble()))).toFloat()
        val y1 = height * 0.3f + (height * 0.2f * cos(Math.toRadians(offset1.toDouble()))).toFloat()
        
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(
                    Color(0xFF8B5CF6).copy(alpha = 0.3f),
                    Color(0xFF8B5CF6).copy(alpha = 0f)
                ),
                center = Offset(x1, y1),
                radius = 300f
            ),
            radius = 300f,
            center = Offset(x1, y1)
        )
        
        // Bubble 2 - Blue
        val x2 = width * 0.7f + (width * 0.2f * sin(Math.toRadians(offset2.toDouble()))).toFloat()
        val y2 = height * 0.6f + (height * 0.3f * cos(Math.toRadians(offset2.toDouble()))).toFloat()
        
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(
                    Color(0xFF3B82F6).copy(alpha = 0.3f),
                    Color(0xFF3B82F6).copy(alpha = 0f)
                ),
                center = Offset(x2, y2),
                radius = 350f
            ),
            radius = 350f,
            center = Offset(x2, y2)
        )
        
        // Bubble 3 - Pink
        val x3 = width * 0.5f + (width * 0.25f * sin(Math.toRadians(offset3.toDouble()))).toFloat()
        val y3 = height * 0.8f + (height * 0.15f * cos(Math.toRadians(offset3.toDouble()))).toFloat()
        
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(
                    Color(0xFFEC4899).copy(alpha = 0.25f),
                    Color(0xFFEC4899).copy(alpha = 0f)
                ),
                center = Offset(x3, y3),
                radius = 280f
            ),
            radius = 280f,
            center = Offset(x3, y3)
        )
    }
}
