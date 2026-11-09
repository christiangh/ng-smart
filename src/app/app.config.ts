import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgSmartErrorMessages } from '@ng-smart/input-fields';
import { appRoutes } from './app.routes';
import { ERROR_MESSAGES } from './error-messages';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimations(),
    // Error texts for every NG Smart field. Errors without an entry show their key.
    // To use a translation library instead, see provideNgSmartErrorResolver().
    provideNgSmartErrorMessages(ERROR_MESSAGES),
  ],
};
