import { NgSmartErrorMessage } from '@ng-smart/input-fields';

/**
 * Error texts of this app, provided once for every NG Smart field in app.config.ts.
 * Errors without an entry show their key.
 */
export const ERROR_MESSAGES = {
	required: ({ label }) => `${label} is required`,
	minlength: ({ label, error }) => `${label} must be at least ${error.requiredLength} characters`,
} satisfies Record<string, NgSmartErrorMessage>;
