package com.authplatform.app.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.ErrorOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.authplatform.app.data.model.QrData
import com.authplatform.app.ui.components.PrimaryButton
import com.authplatform.app.ui.theme.*
import com.authplatform.app.ui.viewmodel.AuthViewModel
import com.google.gson.Gson
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

@Composable
fun QrScannerScreen(
    onBack: () -> Unit,
    onScanSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val uiState by viewModel.uiState.collectAsState()
    var scanResult by remember { mutableStateOf<ScanState>(ScanState.Scanning) }
    var hasScanned by remember { mutableStateOf(false) }
    var hasCameraPermission by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    LaunchedEffect(Unit) {
        val permission = Manifest.permission.CAMERA
        if (ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED) {
            hasCameraPermission = true
        } else {
            permissionLauncher.launch(permission)
        }
    }

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess && scanResult is ScanState.Processing) {
            scanResult = ScanState.Success
        }
    }

    LaunchedEffect(uiState.error) {
        if (uiState.error != null && scanResult is ScanState.Processing) {
            scanResult = ScanState.Error(uiState.error!!)
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        when {
            !hasCameraPermission -> {
                // Permission denied
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.ErrorOutline,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.error
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Camera Permission Required",
                        style = MaterialTheme.typography.headlineSmall,
                        color = Foreground
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Please grant camera permission to scan QR codes",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MutedForeground,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    PrimaryButton(
                        text = "Grant Permission",
                        onClick = { permissionLauncher.launch(Manifest.permission.CAMERA) }
                    )
                }
            }
            scanResult is ScanState.Scanning || scanResult is ScanState.Processing -> {
                // Camera preview
                AndroidView(
                    factory = { ctx ->
                        val previewView = PreviewView(ctx)
                        val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)

                        cameraProviderFuture.addListener({
                            val cameraProvider = cameraProviderFuture.get()
                            val preview = Preview.Builder().build().also {
                                it.surfaceProvider = previewView.surfaceProvider
                            }

                            val options = BarcodeScannerOptions.Builder()
                                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                                .build()
                            val scanner = BarcodeScanning.getClient(options)
                            val executor = Executors.newSingleThreadExecutor()

                            val analysis = ImageAnalysis.Builder()
                                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                                .build()

                            analysis.setAnalyzer(executor) { imageProxy ->
                                @androidx.camera.core.ExperimentalGetImage
                                val mediaImage = imageProxy.image
                                if (mediaImage != null && !hasScanned) {
                                    val inputImage = InputImage.fromMediaImage(
                                        mediaImage, imageProxy.imageInfo.rotationDegrees
                                    )
                                    scanner.process(inputImage)
                                        .addOnSuccessListener { barcodes ->
                                            for (barcode in barcodes) {
                                                val rawValue = barcode.rawValue ?: continue
                                                try {
                                                    val qrData = Gson().fromJson(rawValue, QrData::class.java)
                                                    if (qrData.token.isNotEmpty() && qrData.signature.isNotEmpty()) {
                                                        hasScanned = true
                                                        scanResult = ScanState.Processing
                                                        viewModel.confirmQr(qrData.token, qrData.signature)
                                                    }
                                                } catch (e: Exception) {
                                                    Log.w("QrScanner", "Invalid QR data: $rawValue")
                                                }
                                            }
                                        }
                                        .addOnCompleteListener { imageProxy.close() }
                                } else {
                                    imageProxy.close()
                                }
                            }

                            try {
                                cameraProvider.unbindAll()
                                cameraProvider.bindToLifecycle(
                                    lifecycleOwner,
                                    CameraSelector.DEFAULT_BACK_CAMERA,
                                    preview,
                                    analysis
                                )
                            } catch (e: Exception) {
                                Log.e("QrScanner", "Camera bind failed", e)
                            }
                        }, ContextCompat.getMainExecutor(ctx))

                        previewView
                    },
                    modifier = Modifier.fillMaxSize()
                )

                // Viewfinder overlay
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val overlayColor = Color.Black.copy(alpha = 0.6f)
                    val cutoutSize = size.minDimension * 0.65f
                    val cutoutOffset = Offset(
                        (size.width - cutoutSize) / 2,
                        (size.height - cutoutSize) / 2
                    )

                    // Dark overlay
                    drawRect(overlayColor)
                    // Clear cutout
                    drawRoundRect(
                        color = Color.Transparent,
                        topLeft = cutoutOffset,
                        size = Size(cutoutSize, cutoutSize),
                        cornerRadius = CornerRadius(16f, 16f),
                        blendMode = BlendMode.Clear
                    )
                    // Border
                    drawRoundRect(
                        color = Color.White,
                        topLeft = cutoutOffset,
                        size = Size(cutoutSize, cutoutSize),
                        cornerRadius = CornerRadius(16f, 16f),
                        style = Stroke(width = 3f)
                    )
                }

                if (scanResult is ScanState.Processing) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Primary)
                    }
                }
            }
            scanResult is ScanState.Success -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        Icons.Outlined.CheckCircle,
                        null,
                        modifier = Modifier.size(80.dp),
                        tint = Success
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(
                        "QR Login Confirmed!",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Foreground,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "The web browser will be signed in automatically.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MutedForeground,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(32.dp))
                    PrimaryButton("Done", onClick = onBack)
                }
            }
            scanResult is ScanState.Error -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        Icons.Outlined.ErrorOutline,
                        null,
                        modifier = Modifier.size(80.dp),
                        tint = Destructive
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(
                        "Scan Failed",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Foreground
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        (scanResult as ScanState.Error).message,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MutedForeground,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(32.dp))
                    PrimaryButton("Try Again", onClick = {
                        hasScanned = false
                        scanResult = ScanState.Scanning
                        viewModel.clearError()
                    })
                }
            }
        }

        // Back button
        IconButton(
            onClick = onBack,
            modifier = Modifier
                .statusBarsPadding()
                .padding(8.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = Color.White)
        }

        // Instructions at bottom
        if (scanResult is ScanState.Scanning) {
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(24.dp)
                    .navigationBarsPadding(),
                shape = RoundedCornerShape(12.dp),
                color = Card.copy(alpha = 0.9f)
            ) {
                Text(
                    "Point your camera at the QR code on the web login page",
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyMedium,
                    color = Foreground,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}

private sealed class ScanState {
    data object Scanning : ScanState()
    data object Processing : ScanState()
    data object Success : ScanState()
    data class Error(val message: String) : ScanState()
}
