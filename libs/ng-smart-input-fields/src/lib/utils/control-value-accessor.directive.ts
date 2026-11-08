/* eslint-disable @typescript-eslint/no-empty-function */
import { computed, DestroyRef, Directive, inject, Injector, input, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormControlName, FormGroupDirective, NgControl, NgModel } from '@angular/forms';

@Directive({
    selector: '[ngSmartControlValueAccessor]',
    standalone: true,
})
export class ControlValueAccessorDirective implements ControlValueAccessor, OnInit {
    label = input<string>('');
    @Input() injectedFormControl?: FormControl;

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
        if (this.injectedFormControl) {
            this.control = this.injectedFormControl;
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
        } catch (err) {
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
        const errorList = this.formControl.errors || {};
        const currentErrorsOnField = Object.keys(this.formControl.errors || {});
        this.getErrors.set(
            currentErrorsOnField.map(error => {
                return `${this.computedLabel() ? this.computedLabel() : "The field"} ${error}`
            })
        );
    }

    getValue(): any {
        return this.control.value;
    }

    writeValue() {}
    registerOnChange() {}
    registerOnTouched() {}
}
