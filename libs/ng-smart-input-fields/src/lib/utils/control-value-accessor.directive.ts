/* eslint-disable @typescript-eslint/no-empty-function */
import { computed, DestroyRef, Directive, inject, Injector, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ControlValueAccessor,
    FormControl,
    FormControlDirective,
    FormControlName,
    FormGroupDirective,
    NgControl,
    NgModel,
} from '@angular/forms';
import { NG_SMART_ERROR_RESOLVER } from './error-messages';

/**
 * Base class for every NG Smart field.
 *
 * Instead of bridging values through the ControlValueAccessor callbacks, it resolves the
 * FormControl the host is bound to (formControlName, [formControl], ngModel, or a new
 * standalone one) and exposes it as `formControl`, so the inner Material input can bind to
 * that same control. Validators, touched state and errors are shared for free.
 *
 * It has no selector: it is not used in templates, only extended by field components.
 */
@Directive()
export abstract class ControlValueAccessorDirective implements ControlValueAccessor, OnInit {
    label = input<string>('');

    computedLabel = computed<string>(this.getComputedLabelFn());
    // Signals read by the error resolver (e.g. the active language) also trigger a recompute.
    getErrors = computed<string[]>(() => {
        this._errorsVersion();
        const errors = this.control?.errors || {};
        const label = this.computedLabel();

        return Object.entries(errors).map(([key, error]) => this._errorResolver({ key, error, label }));
    });

    private control!: FormControl;
    // FormControl errors are not signals: bumped on every status change so getErrors recomputes.
    private _errorsVersion = signal(0);

    protected _destroyRef = inject(DestroyRef);
    protected _injector = inject(Injector);
    protected _errorResolver = inject(NG_SMART_ERROR_RESOLVER);

    get formControl(): FormControl {
        return this.control;
    }

    ngOnInit() {
        this.setFormControl();
        this.subscribeToFormControl();
        this.componentOnInit();
    }

    // Function to be overwritten in case we need to add something else in the ng on init function when extending the directive
    componentOnInit() {}

    getComputedLabelFn() {
        return () => {
            if (this.label()) {
                return this.label();
            }

            return '';
        };
    }

    setFormControl() {
        const ngControl = this._injector.get(NgControl, null, { self: true, optional: true });

        try {
            if (ngControl instanceof FormControlName) {
                // FormControlName resolves its control in its own ngOnChanges, which runs after this
                // component's ngOnInit, so the control is looked up in the parent FormGroupDirective.
                this.control = this._injector.get(FormGroupDirective).getControl(ngControl);
            } else if (ngControl instanceof FormControlDirective) {
                // [formControl] receives the FormControl instance as an input, already set at this point.
                this.control = ngControl.form;
            } else if (ngControl instanceof NgModel) {
                this.control = ngControl.control;

                ngControl.control.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(value => {
                    if (ngControl.model !== value || ngControl.viewModel !== value) {
                        ngControl.viewToModelUpdate(value);
                    }
                });
            } else {
                this.control = new FormControl();
            }
        } catch {
            this.control = new FormControl();
        }
    }

    subscribeToFormControl() {
        this.formControl.statusChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
            this.updateFieldErrors();
        });
        // We check the original status
        this.updateFieldErrors();
    }

    updateFieldErrors() {
        this._errorsVersion.update(version => version + 1);
    }

    getValue(): unknown {
        return this.control.value;
    }

    // The ControlValueAccessor callbacks are intentionally empty: the field shares the parent's
    // FormControl with its inner input, so there is nothing to bridge.
    writeValue() {}
    registerOnChange() {}
    registerOnTouched() {}
}
