package com.authplatform.app.data.api

import com.authplatform.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface AuthApi {

    @POST("api/auth/sign-in/email")
    suspend fun signInEmail(@Body request: EmailSignInRequest): Response<AuthResponse>

    @POST("api/auth/sign-up/email")
    suspend fun signUpEmail(@Body request: EmailSignUpRequest): Response<AuthResponse>

    @POST("api/auth/sign-out")
    suspend fun signOut(): Response<Unit>

    @GET("api/auth/get-session")
    suspend fun getSession(): Response<AuthSession>

    @GET("api/auth/sessions")
    suspend fun getSessions(): Response<SessionsResponse>

    @DELETE("api/auth/sessions/{sessionId}")
    suspend fun terminateSession(@Path("sessionId") sessionId: String): Response<Unit>

    @POST("api/auth/qr/confirm")
    suspend fun confirmQr(@Body request: QrConfirmRequest): Response<QrConfirmResponse>

    @POST("api/auth/phone/verify")
    suspend fun verifyPhone(@Body request: PhoneVerifyRequest): Response<AuthResponse>

    @POST("api/auth/link-account")
    suspend fun linkAccount(@Body request: LinkAccountRequest): Response<AuthResponse>

    @GET("api/auth/callback/google")
    suspend fun googleCallback(@Query("code") code: String): Response<AuthResponse>

    @GET("api/auth/callback/github")
    suspend fun githubCallback(@Query("code") code: String): Response<AuthResponse>
}
