import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgSmartFieldDirective } from '../utils/smart-field.directive';
import { NgSmartInputType } from './input.model';

@Component({
	selector: 'ng-smart-input',
	standalone: true,
	imports: [ReactiveFormsModule, MatInputModule],
	templateUrl: './input.component.html',
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => NgSmartInputComponent),
			multi: true,
		},
	],
})
export class NgSmartInputComponent extends NgSmartFieldDirective {
	placeholder = input<string>('');
	type = input<NgSmartInputType>('text');
	autocomplete = input<string | null>(null);
}
