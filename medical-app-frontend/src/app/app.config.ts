import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './auth/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(appRoutes), 
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideAnimations() // Nécessaire pour Angular Material
  ]
};
