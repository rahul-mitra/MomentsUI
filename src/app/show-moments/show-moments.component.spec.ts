import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMomentsComponent } from './show-moments.component';

describe('ShowMomentsComponent', () => {
  let component: ShowMomentsComponent;
  let fixture: ComponentFixture<ShowMomentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowMomentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowMomentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
