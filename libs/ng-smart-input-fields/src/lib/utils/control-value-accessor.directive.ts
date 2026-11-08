/* eslint-disable @typescript-eslint/no-empty-function */
import { computed, DestroyRef, Directive, inject, Injector, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NgControl, NgModel } from '@angular/forms';

/**
 * Base class for every NG Smart field.
 *
 * Instead of bridging values through the ControlValueAccessor callbacks, it resolves the
 * FormControl the host is bound to (formControlName, ngModel, an injected control, or a new
 * standalone one) and exposes it as `formControl`, so the inner Material input can bind to
 * that same control. Validators, touched state and errors are shared for free.
 *
 * It has no selector: it is not used in templates, only extended by field components.
 */
@Directive()
export abstract class ControlValueAccessorDirective implements ControlValueAccessor, OnInit {
    label = input<string>('');
    injectedFormControl = input<FormControl | undefined>(undefined);

    computedLabel = computed<string>(this.getComputedLabelFn());
    getErrors = signal<string[]>([]);

    private control!: FormControl;

    protected _destroyRef = inject(DestroyRef);
    protected _injector = inject(Injector);

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
        const injectedFormControl = this.injectedFormControl();

        if (injectedFormControl) {
            this.control = injectedFormControl;
            return;
        }

        const ngControl = this._injector.get(NgControl, null, { self: true, optional: true });

        try {
            if (ngControl instanceof FormControlName) {
                this.control = this._injector.get(FormGroupDirective).getControl(ngControl as FormControlName);
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
        const currentErrorsOnField = Object.keys(this.formControl.errors || {});
        this.getErrors.set(
            currentErrorsOnField.map(error => {
                return `${this.computedLabel() ? this.computedLabel() : 'The field'} ${error}`;
            })
        );
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
