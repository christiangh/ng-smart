import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsBoardComponent } from './forms-board.component';

describe('FormsBoardComponent', () => {
  let component: FormsBoardComponent;
  let fixture: ComponentFixture<FormsBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsBoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormsBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
