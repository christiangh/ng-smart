import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSmartInputComponent } from 'ng-smart-input-fields';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forms-board',
  standalone: true,
  imports: [CommonModule, NgSmartInputComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './forms-board.component.html',
  styleUrl: './forms-board.component.scss',
})
export class FormsBoardComponent {
    smartFormGroup: FormGroup = new FormGroup({
      textInput: new FormControl<string>(''),
      textInputDefault: new FormControl<string>('Default text'),
      textInputRequired: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
    });

    textInputControl = new FormControl('');
    textInputDefaultControl = new FormControl('Default value by formControl');
    textInputRequiredControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

    textInputNgModel = '';
    textInputDefaultNgModel = 'Default value by ngModel';
}
