
import { Component, computed, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ControlValueAccessorDirective } from '../utils/control-value-accessor.directive';
import { NgSmartInputType } from './input.model';

@Component({
    selector: 'ng-smart-input',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatInputModule],
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgSmartInputComponent),
            multi: true,
        },
    ],
})
export class NgSmartInputComponent extends ControlValueAccessorDirective {
    @Input() placeholder = '';
    @Input() type: NgSmartInputType = 'text';
    @Input() autocomplete: string | null = null;

    getClasses = computed<string>(() => {
        const classes: string[] = [];

        if (!this.computedLabel()) {
            classes.push('mat-form-field--no-label');
        }

        return classes.join(' ');
    });
}
