/**
 * Error texts of this app, provided once for every NG Smart field in app.config.ts.
 * Errors without an entry show their key.
 */
export const ERROR_MESSAGES = {
  required: ({ label }: { label: string }) => `${label} is required`,
  minlength: ({ label, error }: { label: string; error: { requiredLength: number } }) =>
    `${label} must be at least ${error.requiredLength} characters`,
};
