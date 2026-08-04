/*eslint-disable @angular-eslint/prefer-standalone*/
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Breadcrumb, BreadcrumbsComponent } from '../breadcrumbs.component';

describe('BreadcrumbsComponent', () => {
  let fixture: ComponentFixture<BreadcrumbsTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BreadcrumbsComponent],
      declarations: [BreadcrumbsTestComponent],
    });

    fixture = TestBed.createComponent(BreadcrumbsTestComponent);
    fixture.detectChanges();
  });

  it('should compile correctly', () => {
    expect(fixture).toMatchSnapshot();
  });

  @Component({
    selector: 'app-breadcrumbs-test',
    template: ` <app-breadcrumbs [breadcrumbs]="breadcrumbs"></app-breadcrumbs> `,
    standalone: false,
  })
  class BreadcrumbsTestComponent {
    breadcrumbs: Breadcrumb[] = [
      {
        label: 'Breadcrumb one',
        href: '#',
        active: false,
      },
      {
        label: 'Breadcrumb two',
        href: '/test',
        active: true,
      },
    ];
  }
});
