package com.authplatform.app.ui.utils

import android.net.Uri

private const val TRUSTED_ROOT_DOMAIN = "blazeneuro.com"

fun isTrustedAuthDomain(url: String): Boolean {
    val host = runCatching { Uri.parse(url).host?.lowercase() }.getOrNull() ?: return false
    return host == TRUSTED_ROOT_DOMAIN || host.endsWith(".$TRUSTED_ROOT_DOMAIN")
}

fun extractHost(url: String): String {
    return runCatching { Uri.parse(url).host ?: "unknown host" }.getOrDefault("unknown host")
}
