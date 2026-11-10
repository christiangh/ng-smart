import { InjectionToken, Provider } from '@angular/core';

/** Data available to build the message of one validation error. */
export interface NgSmartErrorContext {
	/** Validation error key: `required`, `minlength`, or a custom validator key. */
	key: string;
	/** Value set by the validator, e.g. `{ requiredLength, actualLength }` for `minlength`. */
	error: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	/** Field label, or an empty string when the field has none. */
	label: string;
}

/**
 * Turns a validation error into the text shown under the field.
 *
 * It runs inside a `computed`, so any signal it reads (e.g. the active language) re-renders
 * the messages when it changes.
 */
export type NgSmartErrorResolver = (context: NgSmartErrorContext) => string;

/** Default resolver: shows the error key as is. */
const showErrorKey: NgSmartErrorResolver = ({ key }) => key;

/** Resolver used by every NG Smart field. By default it shows the error key as is. */
export const NG_SMART_ERROR_RESOLVER = new InjectionToken<NgSmartErrorResolver>('NG_SMART_ERROR_RESOLVER', {
	providedIn: 'root',
	factory: () => showErrorKey,
});

/**
 * Plugs in any translation library without coupling the fields to it.
 * The factory runs in an injection context, so it can `inject()` the translation service.
 *
 * @example
 * provideNgSmartErrorResolver(() => {
 *     const translate = inject(TranslateService);
 *     return ({ key, error, label }) => translate.instant(`errors.${key}`, { label, ...error });
 * })
 */
export function provideNgSmartErrorResolver(factory: () => NgSmartErrorResolver): Provider {
	return { provide: NG_SMART_ERROR_RESOLVER, useFactory: factory };
}

/** A fixed text, or a function to build it from the error context. */
export type NgSmartErrorMessage = string | ((context: NgSmartErrorContext) => string);

/**
 * Fixed error texts, without a translation library.
 * Errors without an entry keep showing their key.
 *
 * @example
 * provideNgSmartErrorMessages({
 *     required: 'This field is required',
 *     minlength: ({ error }) => `At least ${error.requiredLength} characters`,
 * })
 */
export function provideNgSmartErrorMessages(messages: Record<string, NgSmartErrorMessage>): Provider {
	return provideNgSmartErrorResolver(() => context => {
		const message = messages[context.key];

		if (message === undefined) {
			return context.key;
		}

		return typeof message === 'function' ? message(context) : message;
	});
}
