import { Component, Provider, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NgSmartInputComponent } from '../input/input.component';
import { NgSmartErrorResolver, provideNgSmartErrorMessages, provideNgSmartErrorResolver } from './error-messages';

const forbiddenValidator = (control: AbstractControl) => (control.value === 'admin' ? { forbidden: true } : null);

@Component({
	standalone: true,
	imports: [ReactiveFormsModule, NgSmartInputComponent],
	template: `
		<ng-smart-input class="labelled" label="Name" [formControl]="control" />
		<ng-smart-input class="unlabelled" [formControl]="control" />
	`,
})
class HostComponent {
	control = new FormControl('', [Validators.required, Validators.minLength(3), forbiddenValidator]);
}

function setup(providers: Provider[] = []) {
	TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideNoopAnimations(), ...providers] });
	const fixture = TestBed.createComponent(HostComponent);
	fixture.detectChanges();
	return fixture;
}

function errorsOf(fixture: ComponentFixture<HostComponent>, selector: string): string[] {
	return fixture.debugElement.query(By.css(selector)).componentInstance.getErrors();
}

function setValue(fixture: ComponentFixture<HostComponent>, value: string) {
	fixture.componentInstance.control.setValue(value);
	fixture.detectChanges();
}

describe('Error messages', () => {
	describe('without configuration', () => {
		it('shows the error key', () => {
			const fixture = setup();
			expect(errorsOf(fixture, '.labelled')).toEqual(['required']);

			setValue(fixture, 'ab');
			expect(errorsOf(fixture, '.labelled')).toEqual(['minlength']);
		});

		it('clears the errors when the value becomes valid', () => {
			const fixture = setup();
			setValue(fixture, 'abc');
			expect(errorsOf(fixture, '.labelled')).toEqual([]);
		});
	});

	describe('with provideNgSmartErrorMessages', () => {
		const providers = [
			provideNgSmartErrorMessages({
				required: 'This field is required',
				minlength: ({ label, error }) => `${label}: at least ${error.requiredLength} characters`,
			}),
		];

		it('uses fixed texts', () => {
			const fixture = setup(providers);
			expect(errorsOf(fixture, '.labelled')).toEqual(['This field is required']);
		});

		it('passes the label and the error value to message functions', () => {
			const fixture = setup(providers);
			setValue(fixture, 'ab');
			expect(errorsOf(fixture, '.labelled')).toEqual(['Name: at least 3 characters']);
		});

		it('passes an empty label when the field has none', () => {
			const fixture = setup(providers);
			setValue(fixture, 'ab');
			expect(errorsOf(fixture, '.unlabelled')).toEqual([': at least 3 characters']);
		});

		it('falls back to the key for errors without a message', () => {
			const fixture = setup(providers);
			setValue(fixture, 'admin');
			expect(errorsOf(fixture, '.labelled')).toEqual(['forbidden']);
		});
	});

	describe('with provideNgSmartErrorResolver', () => {
		it('lets a translation function build every message', () => {
			const resolver: NgSmartErrorResolver = ({ key, label }) => `[${key}] ${label}`;
			const fixture = setup([provideNgSmartErrorResolver(() => resolver)]);
			expect(errorsOf(fixture, '.labelled')).toEqual(['[required] Name']);
		});

		it('recomputes the messages when a signal read by the resolver changes', () => {
			const language = signal<'en' | 'es'>('en');
			const texts = { en: 'Required', es: 'Obligatorio' };
			const fixture = setup([provideNgSmartErrorResolver(() => () => texts[language()])]);
			expect(errorsOf(fixture, '.labelled')).toEqual(['Required']);

			// No change in the form control: only the language changes
			language.set('es');
			fixture.detectChanges();
			expect(errorsOf(fixture, '.labelled')).toEqual(['Obligatorio']);
		});
	});
});
