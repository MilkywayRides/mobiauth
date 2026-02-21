package com.authplatform.app.di

import android.content.Context
import com.authplatform.app.BuildConfig
import com.authplatform.app.data.api.AuthApi
import com.authplatform.app.data.repository.AuthRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(@ApplicationContext context: Context): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .cookieJar(object : CookieJar {
                override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
                    cookies.forEach { cookie ->
                        if (cookie.name.contains("session", ignoreCase = true)) {
                            android.util.Log.d("CookieJar", "Saving cookie: ${cookie.name}=${cookie.value.take(20)}...")
                            runBlocking {
                                AuthRepository.saveCookie(context, cookie.name, cookie.value)
                            }
                        }
                    }
                }

                override fun loadForRequest(url: HttpUrl): List<Cookie> {
                    val cookies = mutableListOf<Cookie>()
                    runBlocking {
                        val token = AuthRepository.getSessionToken(context)
                        if (!token.isNullOrEmpty()) {
                            val cookie = Cookie.Builder()
                                .name("auth.session_token")
                                .value(token)
                                .domain(url.host)
                                .path("/")
                                .build()
                            cookies.add(cookie)
                            android.util.Log.d("CookieJar", "Loading session cookie for ${url.host}")
                        }
                    }
                    return cookies
                }
            })
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("Origin", BuildConfig.BASE_URL)
                    .build()
                chain.proceed(request)
            }
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            })
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL + "/")
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi {
        return retrofit.create(AuthApi::class.java)
    }
}
