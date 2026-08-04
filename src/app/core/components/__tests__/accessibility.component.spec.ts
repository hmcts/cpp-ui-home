import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityComponent } from '../accessibility.component';

describe('AccessibilityComponent', () => {
  let fixture: ComponentFixture<AccessibilityComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessibilityComponent);
  });

  it('should compile', () => {
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });
});
