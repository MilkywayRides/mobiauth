package com.authplatform.app.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.authplatform.app.data.api.AuthApi
import com.authplatform.app.data.model.*
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import retrofit2.Response
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth")

@Singleton
class AuthRepository @Inject constructor(
    private val api: AuthApi,
    @ApplicationContext private val context: Context
) {
    companion object {
        private val SESSION_TOKEN = stringPreferencesKey("session_token")
        private val USER_NAME = stringPreferencesKey("user_name")
        private val USER_EMAIL = stringPreferencesKey("user_email")
        private val USER_ROLE = stringPreferencesKey("user_role")
        private val USER_ID = stringPreferencesKey("user_id")
    }

    val isLoggedIn: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[SESSION_TOKEN] != null
    }

    val savedUserName: Flow<String?> = context.dataStore.data.map { it[USER_NAME] }
    val savedUserEmail: Flow<String?> = context.dataStore.data.map { it[USER_EMAIL] }
    val savedUserRole: Flow<String?> = context.dataStore.data.map { it[USER_ROLE] }

    suspend fun signInEmail(email: String, password: String): Result<User> {
        return try {
            val response = api.signInEmail(EmailSignInRequest(email, password))
            android.util.Log.d("AuthRepository", "Response code: ${response.code()}")
            android.util.Log.d("AuthRepository", "Response success: ${response.isSuccessful}")
            
            if (response.isSuccessful) {
                val body = response.body()
                android.util.Log.d("AuthRepository", "Response body: $body")
                android.util.Log.d("AuthRepository", "User: ${body?.user}")
                android.util.Log.d("AuthRepository", "User name: ${body?.user?.name}")
                android.util.Log.d("AuthRepository", "User email: ${body?.user?.email}")
                
                val sessionToken = extractSessionCookie(response)
                
                if (body?.user != null) {
                    saveSession(sessionToken, body.user)
                    Result.success(body.user)
                } else {
                    android.util.Log.e("AuthRepository", "User is null in response")
                    Result.failure(Exception("Invalid response: user is null"))
                }
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Sign in failed"
                android.util.Log.e("AuthRepository", "Error: $errorMsg")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            android.util.Log.e("AuthRepository", "Exception: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun signUpEmail(name: String, email: String, password: String): Result<User> {
        return try {
            val response = api.signUpEmail(EmailSignUpRequest(name, email, password))
            android.util.Log.d("AuthRepository", "SignUp Response code: ${response.code()}")
            
            if (response.isSuccessful) {
                val body = response.body()
                android.util.Log.d("AuthRepository", "SignUp body: $body")
                android.util.Log.d("AuthRepository", "SignUp user: ${body?.user}")
                
                val sessionToken = extractSessionCookie(response)
                if (body?.user != null) {
                    saveSession(sessionToken, body.user)
                    Result.success(body.user)
                } else {
                    android.util.Log.e("AuthRepository", "SignUp: User is null")
                    Result.failure(Exception("Invalid response"))
                }
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Sign up failed"
                android.util.Log.e("AuthRepository", "SignUp error: $errorMsg")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            android.util.Log.e("AuthRepository", "SignUp exception: ${e.message}", e)
            Result.failure(e)
        }
    }

    suspend fun verifyPhone(idToken: String, phoneNumber: String): Result<User> {
        return try {
            val response = api.verifyPhone(PhoneVerifyRequest(idToken, phoneNumber))
            if (response.isSuccessful) {
                val body = response.body()
                val sessionToken = extractSessionCookie(response)
                if (body?.user != null) {
                    saveSession(sessionToken, body.user)
                    Result.success(body.user)
                } else {
                    Result.failure(Exception("Invalid response"))
                }
            } else {
                Result.failure(Exception("Phone verification failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun linkAccount(email: String, password: String, phoneNumber: String?): Result<User> {
        return try {
            val response = api.linkAccount(LinkAccountRequest(email, password, phoneNumber))
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.user != null) {
                    Result.success(body.user)
                } else {
                    Result.failure(Exception("Invalid response"))
                }
            } else {
                Result.failure(Exception("Account linking failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun confirmQr(token: String, signature: String): Result<QrConfirmResponse> {
        return try {
            val response = api.confirmQr(QrConfirmRequest(token, signature))
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.body()?.error ?: "QR confirmation failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSession(): Result<AuthSession> {
        return try {
            val response = api.getSession()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("No session"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signOut() {
        try {
            api.signOut()
        } catch (_: Exception) { }
        clearSession()
    }

    private suspend fun saveSession(token: String?, user: User) {
        context.dataStore.edit { prefs ->
            token?.let { prefs[SESSION_TOKEN] = it }
            prefs[USER_NAME] = user.name
            prefs[USER_EMAIL] = user.email
            prefs[USER_ROLE] = user.role
            prefs[USER_ID] = user.id
        }
    }

    private suspend fun clearSession() {
        context.dataStore.edit { it.clear() }
    }

    suspend fun getUserData(): Map<String, String?> {
        return try {
            val token = context.dataStore.data.first()[SESSION_TOKEN]
            android.util.Log.d("AuthRepository", "Token: ${token?.take(20)}...")
            
            if (token.isNullOrEmpty()) {
                android.util.Log.d("AuthRepository", "No token, returning local data")
                val prefs = context.dataStore.data.first()
                return mapOf(
                    "name" to prefs[USER_NAME],
                    "email" to prefs[USER_EMAIL],
                    "role" to prefs[USER_ROLE],
                    "id" to prefs[USER_ID]
                )
            }

            // Fetch from API
            android.util.Log.d("AuthRepository", "Fetching user data from API...")
            val response = api.getSession()
            android.util.Log.d("AuthRepository", "API Response: ${response.code()}, Body: ${response.body()}")
            
            if (response.isSuccessful && response.body()?.user != null) {
                val user = response.body()!!.user!!
                android.util.Log.d("AuthRepository", "User from API: name=${user.name}, role=${user.role}")
                
                // Update local storage
                context.dataStore.edit { prefs ->
                    prefs[USER_NAME] = user.name
                    prefs[USER_EMAIL] = user.email
                    prefs[USER_ROLE] = user.role
                    prefs[USER_ID] = user.id
                }
                
                return mapOf(
                    "name" to user.name,
                    "email" to user.email,
                    "role" to user.role,
                    "id" to user.id
                )
            } else {
                android.util.Log.d("AuthRepository", "API failed, using local data")
                val prefs = context.dataStore.data.first()
                return mapOf(
                    "name" to prefs[USER_NAME],
                    "email" to prefs[USER_EMAIL],
                    "role" to prefs[USER_ROLE],
                    "id" to prefs[USER_ID]
                )
            }
        } catch (e: Exception) {
            android.util.Log.e("AuthRepository", "Error fetching user data", e)
            val prefs = context.dataStore.data.first()
            return mapOf(
                "name" to prefs[USER_NAME],
                "email" to prefs[USER_EMAIL],
                "role" to prefs[USER_ROLE],
                "id" to prefs[USER_ID]
            )
        }
    }

    suspend fun getSessions(): Result<List<Session>> {
        return try {
            val token = context.dataStore.data.first()[SESSION_TOKEN]
            if (token == null) {
                return Result.failure(Exception("Not authenticated"))
            }

            val response = api.getSessions()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.sessions)
            } else {
                Result.failure(Exception("Failed to load sessions"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun terminateSession(sessionId: String): Result<Unit> {
        return try {
            val response = api.terminateSession(sessionId)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to terminate session"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun <T> extractSessionCookie(response: Response<T>): String? {
        return response.headers().values("Set-Cookie")
            .firstOrNull { it.startsWith("auth.session_token=") }
            ?.substringBefore(";")
            ?.substringAfter("=")
    }
}
