package com.authplatform.app.data.model

import com.google.gson.annotations.SerializedName

data class User(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val image: String? = null,
    val role: String = "user",
    val emailVerified: Boolean = false,
    val createdAt: String = "",
    val updatedAt: String = ""
)

data class Session(
    val id: String = "",
    val userId: String = "",
    val token: String = "",
    val expiresAt: String = "",
    val ipAddress: String? = null,
    val userAgent: String? = null
)

data class SessionsResponse(
    val sessions: List<Session> = emptyList()
)

data class AuthSession(
    val session: Session? = null,
    val user: User? = null
)

data class AuthResponse(
    val token: String? = null,
    val user: User? = null,
    val session: Session? = null,
    val error: AuthError? = null
)

data class AuthError(
    val message: String? = null,
    val code: String? = null
)

data class QrData(
    val token: String,
    val signature: String,
    val expiresAt: String
)

data class QrConfirmResponse(
    val success: Boolean = false,
    val message: String? = null,
    val error: String? = null
)

data class QrStatusResponse(
    val status: String = "",
    val userId: String? = null,
    val userName: String? = null,
    val expiresAt: String? = null,
    val error: String? = null
)

// Request bodies
data class EmailSignInRequest(
    val email: String,
    val password: String
)

data class EmailSignUpRequest(
    val name: String,
    val email: String,
    val password: String
)

data class QrConfirmRequest(
    val token: String,
    val signature: String
)

data class PhoneVerifyRequest(
    @SerializedName("idToken")
    val idToken: String,
    val phoneNumber: String? = null
)

data class LinkAccountRequest(
    val email: String,
    val password: String,
    val phoneNumber: String? = null
)
