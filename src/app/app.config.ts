import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgSmartErrorMessages } from 'ng-smart-input-fields';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimations(),
    // Fixed error texts for every NG Smart field. Errors without an entry show their key.
    // To use a translation library instead, see provideNgSmartErrorResolver().
    provideNgSmartErrorMessages({
      required: ({ label }) => `${label} is required`,
      minlength: ({ label, error }) => `${label} must be at least ${error.requiredLength} characters`,
    }),
  ],
};
