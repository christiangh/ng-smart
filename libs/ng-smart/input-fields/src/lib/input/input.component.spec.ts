import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NgSmartInputComponent } from './input.component';

/**
 * The base directive is abstract, so its behaviour is tested through a real field.
 * Each block covers one of the ways the field can be used.
 */

function setup<T>(host: new () => T): ComponentFixture<T> {
    TestBed.configureTestingModule({ imports: [host], providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(host);
    fixture.detectChanges();
    return fixture;
}

function nativeInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
}

function field(fixture: ComponentFixture<unknown>): NgSmartInputComponent {
    return fixture.debugElement.query(By.directive(NgSmartInputComponent)).componentInstance;
}

function typeInto(fixture: ComponentFixture<unknown>, value: string) {
    const input = nativeInput(fixture);
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
}

describe('NgSmartInputComponent', () => {
    describe('with formControlName', () => {
        @Component({
            standalone: true,
            imports: [ReactiveFormsModule, NgSmartInputComponent],
            template: `
                <form [formGroup]="form">
                    <ng-smart-input label="Name" formControlName="name" />
                </form>
            `,
        })
        class HostComponent {
            form = new FormGroup({ name: new FormControl('Initial', [Validators.required]) });
        }

        let fixture: ComponentFixture<HostComponent>;
        let control: FormControl;

        beforeEach(() => {
            fixture = setup(HostComponent);
            control = fixture.componentInstance.form.controls.name;
        });

        it('uses the same FormControl instance as the parent form', () => {
            expect(field(fixture).formControl).toBe(control);
        });

        it('shows the initial value', () => {
            expect(nativeInput(fixture).value).toBe('Initial');
        });

        it('writes typed text into the form control', () => {
            typeInto(fixture, 'Typed');
            expect(control.value).toBe('Typed');
        });

        it('shows values set from the form control', () => {
            control.setValue('From code');
            fixture.detectChanges();
            expect(nativeInput(fixture).value).toBe('From code');
        });

        it('marks the control as touched on blur', () => {
            nativeInput(fixture).dispatchEvent(new Event('blur'));
            expect(control.touched).toBe(true);
        });

        it('shows validation errors once the control is touched', () => {
            control.setValue('');
            control.markAsTouched();
            fixture.detectChanges();
            expect(field(fixture).getErrors()).toEqual(['required']);
            expect(fixture.debugElement.query(By.css('mat-error')).nativeElement.textContent.trim()).toBe('required');
        });

        it('shows every error message in one line', () => {
            control.setErrors({ required: true, email: true });
            control.markAsTouched();
            fixture.detectChanges();
            const error = fixture.debugElement.query(By.css('mat-error')).nativeElement;
            expect(error.textContent.trim()).toBe('required, email');
            expect(error.title).toBe('required, email');
        });

        it('shows the required marker from the parent control validators', () => {
            expect(fixture.debugElement.query(By.css('.mat-mdc-form-field-required-marker'))).not.toBeNull();
        });

        it('follows disable() and enable()', () => {
            control.disable();
            fixture.detectChanges();
            expect(nativeInput(fixture).disabled).toBe(true);

            control.enable();
            fixture.detectChanges();
            expect(nativeInput(fixture).disabled).toBe(false);
        });

        it('follows reset()', () => {
            typeInto(fixture, 'Typed');
            control.markAsTouched();
            fixture.componentInstance.form.reset();
            fixture.detectChanges();
            expect(nativeInput(fixture).value).toBe('');
            expect(control.touched).toBe(false);
        });
    });

    describe('with [formControl]', () => {
        @Component({
            standalone: true,
            imports: [ReactiveFormsModule, NgSmartInputComponent],
            template: `<ng-smart-input label="Name" [formControl]="control" />`,
        })
        class HostComponent {
            control = new FormControl('Initial', [Validators.required]);
        }

        let fixture: ComponentFixture<HostComponent>;
        let control: FormControl;

        beforeEach(() => {
            fixture = setup(HostComponent);
            control = fixture.componentInstance.control;
        });

        it('uses the bound FormControl instance', () => {
            expect(field(fixture).formControl).toBe(control);
        });

        it('shows the initial value', () => {
            expect(nativeInput(fixture).value).toBe('Initial');
        });

        it('writes typed text into the form control', () => {
            typeInto(fixture, 'Typed');
            expect(control.value).toBe('Typed');
        });

        it('shows values set from the form control', () => {
            control.setValue('From code');
            fixture.detectChanges();
            expect(nativeInput(fixture).value).toBe('From code');
        });

        it('shows validation errors', () => {
            control.setValue('');
            fixture.detectChanges();
            expect(field(fixture).getErrors()).toEqual(['required']);
        });

        it('follows disable()', () => {
            control.disable();
            fixture.detectChanges();
            expect(nativeInput(fixture).disabled).toBe(true);
        });
    });

    describe('with ngModel', () => {
        @Component({
            standalone: true,
            imports: [FormsModule, NgSmartInputComponent],
            template: `<ng-smart-input label="Name" [ngModel]="name" (ngModelChange)="onChange($event)" />`,
        })
        class HostComponent {
            name = 'Initial';
            changes: string[] = [];

            onChange(value: string) {
                this.name = value;
                this.changes.push(value);
            }
        }

        let fixture: ComponentFixture<HostComponent>;

        // ngModel writes its value asynchronously, so the view has to settle first
        async function settle() {
            fixture.detectChanges();
            await fixture.whenStable();
            fixture.detectChanges();
        }

        beforeEach(async () => {
            fixture = setup(HostComponent);
            await settle();
        });

        it('shows the initial model value', () => {
            expect(nativeInput(fixture).value).toBe('Initial');
        });

        it('updates the model when typing, emitting ngModelChange once per change', () => {
            typeInto(fixture, 'Typed');
            expect(fixture.componentInstance.name).toBe('Typed');
            expect(fixture.componentInstance.changes).toEqual(['Typed']);
        });

        it('shows values set on the model', async () => {
            fixture.componentInstance.name = 'From code';
            await settle();
            expect(nativeInput(fixture).value).toBe('From code');
        });

        it('does not emit ngModelChange when the model is set from code', async () => {
            fixture.componentInstance.name = 'From code';
            await settle();
            expect(fixture.componentInstance.changes).toEqual([]);
        });
    });

    describe('standalone, without any form directive', () => {
        @Component({
            standalone: true,
            imports: [NgSmartInputComponent],
            template: `<ng-smart-input label="Name" />`,
        })
        class HostComponent {
            input = viewChild.required(NgSmartInputComponent);
        }

        let fixture: ComponentFixture<HostComponent>;

        beforeEach(() => {
            fixture = setup(HostComponent);
        });

        it('creates its own FormControl', () => {
            expect(field(fixture).formControl).toBeInstanceOf(FormControl);
        });

        it('exposes the typed value through getValue()', () => {
            typeInto(fixture, 'Typed');
            expect(fixture.componentInstance.input().getValue()).toBe('Typed');
        });
    });
});
