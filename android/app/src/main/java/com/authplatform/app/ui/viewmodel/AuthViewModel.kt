package com.authplatform.app.ui.viewmodel

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.authplatform.app.data.repository.AuthRepository
import com.google.firebase.FirebaseException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthOptions
import com.google.firebase.auth.PhoneAuthProvider
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val isAuthenticated: Boolean = false,
    val error: String? = null,
    val userName: String? = null,
    val userEmail: String? = null,
    val userRole: String? = null,
    val sessions: List<com.authplatform.app.data.model.Session> = emptyList(),
    val isLoadingSessions: Boolean = false
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private var verificationId: String? = null
    private val firebaseAuth = FirebaseAuth.getInstance()

    init {
        // Session check disabled to prevent lag
    }

    private fun checkSession() {
        // Disabled
    }

    fun signInEmail(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.signInEmail(email, password)
            result.onSuccess { user ->
                android.util.Log.d("AuthViewModel", "Login success - User: ${user.name}, ${user.email}, ${user.role}")
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isSuccess = true,
                    isAuthenticated = true,
                    userName = user.name,
                    userEmail = user.email,
                    userRole = user.role
                )
                android.util.Log.d("AuthViewModel", "State updated: ${_uiState.value}")
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Sign in failed"
                )
            }
        }
    }

    fun signUpEmail(name: String, email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.signUpEmail(name, email, password)
            result.onSuccess { user ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isSuccess = true,
                    isAuthenticated = true,
                    userName = user.name,
                    userEmail = user.email,
                    userRole = user.role
                )
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Sign up failed"
                )
            }
        }
    }

    fun sendPhoneOtp(phoneNumber: String, activity: Activity? = null) {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)

        if (activity == null) {
            _uiState.value = _uiState.value.copy(isLoading = false, error = "Activity context required")
            return
        }

        val callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
            override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                signInWithPhoneCredential(credential)
            }

            override fun onVerificationFailed(e: FirebaseException) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Verification failed"
                )
            }

            override fun onCodeSent(id: String, token: PhoneAuthProvider.ForceResendingToken) {
                verificationId = id
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }

        val options = PhoneAuthOptions.newBuilder(firebaseAuth)
            .setPhoneNumber(phoneNumber)
            .setTimeout(60L, TimeUnit.SECONDS)
            .setActivity(activity)
            .setCallbacks(callbacks)
            .build()

        PhoneAuthProvider.verifyPhoneNumber(options)
    }

    fun verifyPhoneOtp(otp: String) {
        val vId = verificationId
        if (vId == null) {
            _uiState.value = _uiState.value.copy(error = "Please request OTP first")
            return
        }

        val credential = PhoneAuthProvider.getCredential(vId, otp)
        signInWithPhoneCredential(credential)
    }

    private fun signInWithPhoneCredential(credential: PhoneAuthCredential) {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)

        firebaseAuth.signInWithCredential(credential)
            .addOnSuccessListener { result ->
                result.user?.getIdToken(true)?.addOnSuccessListener { tokenResult ->
                    val idToken = tokenResult.token
                    val phoneNumber = result.user?.phoneNumber
                    if (idToken != null && phoneNumber != null) {
                        viewModelScope.launch {
                            val verifyResult = repository.verifyPhone(idToken, phoneNumber)
                            verifyResult.onSuccess { user ->
                                _uiState.value = _uiState.value.copy(
                                    isLoading = false,
                                    isSuccess = true,
                                    isAuthenticated = true,
                                    userName = user.name,
                                    userEmail = user.email,
                                    userRole = user.role
                                )
                            }.onFailure { e ->
                                _uiState.value = _uiState.value.copy(
                                    isLoading = false,
                                    error = e.message ?: "Phone auth failed"
                                )
                            }
                        }
                    }
                }
            }
            .addOnFailureListener { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "OTP verification failed"
                )
            }
    }

    fun confirmQr(token: String, signature: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.confirmQr(token, signature)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isSuccess = true
                )
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "QR confirmation failed"
                )
            }
        }
    }

    fun verifyPhone(idToken: String, phoneNumber: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.verifyPhone(idToken, phoneNumber)
            result.onSuccess { user ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isSuccess = true,
                    isAuthenticated = true,
                    userName = user.name,
                    userEmail = user.email,
                    userRole = user.role
                )
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Phone verification failed"
                )
            }
        }
    }

    fun linkAccount(email: String, password: String, phoneNumber: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.linkAccount(email, password, phoneNumber)
            result.onSuccess { user ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    isSuccess = true,
                    isAuthenticated = true,
                    userName = user.name,
                    userEmail = user.email,
                    userRole = user.role
                )
            }.onFailure { e ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Account linking failed"
                )
            }
        }
    }

    fun signOut() {
        viewModelScope.launch {
            repository.signOut()
            firebaseAuth.signOut()
            _uiState.value = AuthUiState()
        }
    }

    fun loadUserData() {
        viewModelScope.launch {
            val userData = repository.getUserData()
            android.util.Log.d("AuthViewModel", "Loading user data: $userData")
            _uiState.value = _uiState.value.copy(
                userName = userData["name"],
                userEmail = userData["email"],
                userRole = userData["role"],
                isAuthenticated = userData["name"] != null
            )
            android.util.Log.d("AuthViewModel", "Dashboard state: ${_uiState.value}")
            
            // Load sessions only if authenticated
            if (_uiState.value.isAuthenticated) {
                loadSessions()
            }
        }
    }

    fun loadSessions() {
        viewModelScope.launch {
            // Only load if authenticated
            if (!_uiState.value.isAuthenticated) {
                android.util.Log.d("AuthViewModel", "Not authenticated, skipping sessions load")
                return@launch
            }
            
            _uiState.value = _uiState.value.copy(isLoadingSessions = true)
            val result = repository.getSessions()
            result.onSuccess { sessions ->
                android.util.Log.d("AuthViewModel", "Loaded ${sessions.size} sessions")
                _uiState.value = _uiState.value.copy(
                    sessions = sessions,
                    isLoadingSessions = false
                )
            }.onFailure { error ->
                android.util.Log.e("AuthViewModel", "Failed to load sessions", error)
                _uiState.value = _uiState.value.copy(isLoadingSessions = false)
            }
        }
    }

    fun terminateSession(sessionId: String) {
        viewModelScope.launch {
            val result = repository.terminateSession(sessionId)
            result.onSuccess {
                loadSessions()
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
