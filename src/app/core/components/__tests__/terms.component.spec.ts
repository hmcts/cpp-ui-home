import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsComponent } from '../terms.component';

describe('TermsComponent', () => {
  let fixture: ComponentFixture<TermsComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsComponent);
  });

  it('should compile', () => {
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
