import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMomentsComponent } from './add-moments.component';

describe('AddMomentsComponent', () => {
  let component: AddMomentsComponent;
  let fixture: ComponentFixture<AddMomentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMomentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMomentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
