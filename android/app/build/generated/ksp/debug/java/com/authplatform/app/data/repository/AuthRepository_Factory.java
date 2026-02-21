package com.authplatform.app.data.repository;

import android.content.Context;
import com.authplatform.app.data.api.AuthApi;
import dagger.internal.DaggerGenerated;
import dagger.internal.Factory;
import dagger.internal.QualifierMetadata;
import dagger.internal.ScopeMetadata;
import javax.annotation.processing.Generated;
import javax.inject.Provider;

@ScopeMetadata("javax.inject.Singleton")
@QualifierMetadata("dagger.hilt.android.qualifiers.ApplicationContext")
@DaggerGenerated
@Generated(
    value = "dagger.internal.codegen.ComponentProcessor",
    comments = "https://dagger.dev"
)
@SuppressWarnings({
    "unchecked",
    "rawtypes",
    "KotlinInternal",
    "KotlinInternalInJava",
    "cast",
    "deprecation",
    "nullness:initialization.field.uninitialized"
})
public final class AuthRepository_Factory implements Factory<AuthRepository> {
  private final Provider<AuthApi> apiProvider;

  private final Provider<Context> contextProvider;

  public AuthRepository_Factory(Provider<AuthApi> apiProvider, Provider<Context> contextProvider) {
    this.apiProvider = apiProvider;
    this.contextProvider = contextProvider;
  }

  @Override
  public AuthRepository get() {
    return newInstance(apiProvider.get(), contextProvider.get());
  }

  public static AuthRepository_Factory create(Provider<AuthApi> apiProvider,
      Provider<Context> contextProvider) {
    return new AuthRepository_Factory(apiProvider, contextProvider);
  }

  public static AuthRepository newInstance(AuthApi api, Context context) {
    return new AuthRepository(api, context);
  }
}
