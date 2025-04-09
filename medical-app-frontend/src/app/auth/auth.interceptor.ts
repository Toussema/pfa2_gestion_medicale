// src/app/auth/auth.interceptor.ts
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Définir l’intercepteur comme une fonction
export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthService); // Injecter AuthService
  const platformId = inject(PLATFORM_ID);  // Injecter PLATFORM_ID

  let authReq = req;
  if (isPlatformBrowser(platformId)) { // Vérifier si on est côté client
    const token = authService.getToken();
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }
  return next(authReq);
}