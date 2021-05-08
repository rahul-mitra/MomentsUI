import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WackySpinnerComponent } from './wacky-spinner.component';

describe('WackySpinnerComponent', () => {
  let component: WackySpinnerComponent;
  let fixture: ComponentFixture<WackySpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WackySpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WackySpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
