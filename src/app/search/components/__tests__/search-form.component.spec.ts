/*eslint-disable @angular-eslint/prefer-standalone*/
import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PdkFormComponent, FormFieldControl } from '@cpp/pdk';
import { SearchFormComponent, SearchFormValues } from '../search-form.component';
import {
  ApplicationTypeAutosuggestComponent,
  HearingTypeSelectComponent,
  OrganisationUnitAutosuggestComponent,
  ProsecutorAutosuggestComponent,
} from '@cpp/reference-data';

describe('SearchFormComponent', () => {
  let fixture: ComponentFixture<SearchFormTestComponent>;
  let ProsecutorMockAutosuggestComponent: ReturnType<typeof createMockControlValueAccessor>;

  beforeEach(() => {
    ProsecutorMockAutosuggestComponent = createMockControlValueAccessor(
      'cpp-prosecutor-autosuggest'
    );
    TestBed.configureTestingModule({
      imports: [SearchFormComponent],
      declarations: [SearchFormTestComponent],
    }).overrideComponent(SearchFormComponent, {
      remove: {
        imports: [
          OrganisationUnitAutosuggestComponent,
          ProsecutorAutosuggestComponent,
          HearingTypeSelectComponent,
          ApplicationTypeAutosuggestComponent,
        ],
      },
      add: {
        imports: [
          createMockControlValueAccessor('cpp-application-type-autosuggest'),
          createMockControlValueAccessor('cpp-hearing-type-select'),
          createMockControlValueAccessor('cpp-organisation-unit-autosuggest'),
          ProsecutorMockAutosuggestComponent,
        ],
      },
    });

    fixture = TestBed.createComponent(SearchFormTestComponent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should compile correctly', () => {
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should compile correctly when there are initial values', () => {
    fixture.componentInstance.initialValues = {
      caseStatus: ['ACTIVE'],
      caseReference: 'CASE_REFERENCE',
      partyFirstAndOrMiddleName: 'PARTY_FIRST_NAME',
      partyLastNameOrOrganisationName: 'PARTY_NAME',
      partyTypes: ['APPLICANT', 'DEFENDANT'],
      partyDateOfBirth: '1980-01-01',
      partyAddress: 'ADDRESS',
      partyPostcode: 'POSTCODE',
      prosecutor: 'PROSECUTOR' as any,
      organisationUnit: 'ORGANISATION_UNIT' as any,
      applicationType: 'APPLICATION_TYPE' as any,
      hearingDateFrom: '2019-01-01',
      hearingDateTo: '2019-01-02',
      hearingType: 'HEARING_TYPE' as any,
      sjp: true,
      magistrateCourt: true,
      crownCourt: true,
      sortBySjpNoticeServed: 'asc',
      boxWorkHearing: true,
    };
    fixture.detectChanges();
    expect(fixture).toMatchSnapshot();
  });

  it('should handle resetting the form', fakeAsync(() => {
    const resetForm = jest.fn();
    fixture.componentInstance.initialValues = { caseReference: '*' };
    fixture.detectChanges();
    tick();
    fixture.debugElement.query(
      By.directive(SearchFormComponent)
    ).componentInstance.ngFormRef.resetForm = resetForm;
    fixture.debugElement.query(By.css('[data-test-id="clear-filters"]')).nativeElement.click();

    expect(resetForm).toHaveBeenCalled();
    expect(fixture.componentInstance.resetForm).toHaveBeenCalled();
  }));

  it('should emit an `errors` event when submitting an invalid form', () => {
    const errors = [{ id: '*', message: '* ' }];
    fixture.detectChanges();
    fixture.debugElement
      .query(By.directive(PdkFormComponent))
      .componentInstance.errors.emit(errors);

    expect(fixture.componentInstance.handleErrors).toHaveBeenCalledWith(errors);
  });

  it('should prevent searching with only whitespace', async () => {
    fixture.componentInstance.initialValues = { caseReference: ' ' };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    expect(fixture.componentInstance.search).not.toHaveBeenCalled();
    expect(fixture.componentInstance.handleErrors).toHaveBeenCalledWith([
      {
        id: 'javascript:void(0)',
        message: 'Add filters to find search results',
      },
    ]);
  });

  it('should prevent searching when only one facet is provided', async () => {
    fixture.componentInstance.initialValues = { partyPostcode: '*' };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    expect(fixture.componentInstance.search).not.toHaveBeenCalled();
    expect(fixture.componentInstance.handleErrors).toHaveBeenCalledWith([
      {
        id: 'javascript:void(0)',
        message: 'Add another filter to find search results',
      },
    ]);
  });

  it('should allow searching when the boxwork checkbox is true', async () => {
    fixture.componentInstance.initialValues = { boxWorkHearing: true };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    expect(fixture.componentInstance.search).toHaveBeenCalled();
    expect(fixture.componentInstance.search).toHaveBeenCalledWith({ boxWorkHearing: true });
  });

  it('should allow searching when the boxwork and timed appointments checkboxes are true', async () => {
    fixture.componentInstance.initialValues = {
      boxWorkHearing: true,
    };

    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.initialValues = {
      boxWorkHearing: true,
      boxWorkVirtualHearing: true,
    };
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    expect(fixture.componentInstance.search).toHaveBeenCalledWith({
      boxWorkHearing: true,
      boxWorkVirtualHearing: true,
    });
  });

  it('should disregard non-mandatory facets when determining the minimum filters', async () => {
    fixture.componentInstance.initialValues = {
      crownCourt: true,
      magistrateCourt: true,
      partyDateOfBirth: '2019-01-01',
      partyTypes: ['APPLICANT'],
      sjp: true,
      sortBySjpNoticeServed: 'asc',
    };

    fixture.detectChanges();
    await fixture.whenStable();

    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    expect(fixture.componentInstance.search).not.toHaveBeenCalled();
    expect(fixture.componentInstance.handleErrors).toHaveBeenCalledWith([
      {
        id: 'javascript:void(0)',
        message: 'Add another filter to find search results',
      },
    ]);
  });

  it('should display a unique error message when searching with just the `partyFirstAndOrMiddleName` facet', async () => {
    fixture.componentInstance.initialValues = { partyFirstAndOrMiddleName: '*' };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    const form = fixture.debugElement.query(By.directive(SearchFormComponent)).componentInstance
      .ngFormRef;
    expect(form.controls.partyLastNameOrOrganisationName.errors).toEqual({ required: true });
  });

  it('should permit searching when only the `caseReference` facet is provided', async () => {
    fixture.componentInstance.initialValues = { caseReference: '*' };
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();

    expect(fixture.componentInstance.search).toHaveBeenCalledWith({ caseReference: '*' });
  });

  it('should prevent searching with just the `partyLastNameOrOrganisationName` facet when it has a minimum 2 characters', async () => {
    fixture.componentInstance.initialValues = { partyLastNameOrOrganisationName: '*' };
    fixture.detectChanges();
    await fixture.whenStable();
    // trigger subsequent change detection for minlength binding due to
    // its dependency on the update to its ngModel value
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.search).not.toHaveBeenCalled();
    expect(fixture.componentInstance.handleErrors).toHaveBeenCalled();

    fixture.componentInstance.initialValues = { partyLastNameOrOrganisationName: '**' };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.search).toHaveBeenCalledWith({
      partyLastNameOrOrganisationName: '**',
    });
  });

  it('should emit a `search` event for a valid form', async () => {
    fixture.componentInstance.initialValues = {
      partyPostcode: '*',
      partyFirstAndOrMiddleName: '*',
    };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();

    expect(fixture.componentInstance.search).toHaveBeenCalledWith({
      partyPostcode: '*',
      partyFirstAndOrMiddleName: '*',
    });
  });

  it('should accept the free text of the prosecutor input when no option is selected', async () => {
    fixture.componentInstance.initialValues = {
      partyDateOfBirth: '2019-01-01',
    };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement
      .query(By.directive(ProsecutorMockAutosuggestComponent))
      .componentInstance.inputText.emit('*');
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();
    expect(fixture.componentInstance.search).toHaveBeenCalledWith({
      partyDateOfBirth: '2019-01-01',
      prosecutor: {
        shortName: '*',
      },
    });
  });

  it('should raise an error when submitting the form with no filters', async () => {
    fixture.componentInstance.initialValues = {};
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();

    expect(fixture.componentInstance.search).not.toHaveBeenCalled();
    expect(fixture.componentInstance.handleErrors).toHaveBeenCalledWith([
      {
        id: 'javascript:void(0)',
        message: 'Add filters to find search results',
      },
    ]);
  });

  it('should filter falsy values when submitting the form', async () => {
    fixture.componentInstance.initialValues = {
      caseReference: '*',
      sjp: false,
      crownCourt: false,
      magistrateCourt: false,
    };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();

    expect(fixture.componentInstance.search).toHaveBeenCalledWith({ caseReference: '*' });
  });

  it('should clear conditional values when the parent control is reset', async () => {
    fixture.componentInstance.initialValues = {
      partyLastNameOrOrganisationName: 'PARTY_LAST_NAME',
      sjp: true,
      sortBySjpNoticeServed: 'asc',
      boxWorkHearing: true,
      boxWorkVirtualHearing: false,
    };
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('input[name=sjp]')).nativeElement.click();
    fixture.debugElement.query(By.css('input[name=boxWorkHearing]')).nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();

    expect(fixture.componentInstance.search).toHaveBeenCalledWith({
      partyLastNameOrOrganisationName: 'PARTY_LAST_NAME',
    });
  });

  it('should display the checkbox for timed appointments when boxWorkHearing is true', async () => {
    fixture.componentInstance.initialValues = {
      partyLastNameOrOrganisationName: 'PARTY_LAST_NAME',
      sjp: true,
      sortBySjpNoticeServed: 'asc',
      boxWorkHearing: true,
      boxWorkVirtualHearing: false,
    };
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture).toMatchSnapshot();
  });

  it('should emit an `errors` event with undefined on valid submit', async () => {
    fixture.componentInstance.initialValues = { caseReference: 'mock-ref' };
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.debugElement.query(By.css('button[type=submit]')).nativeElement.click();

    expect(fixture.componentInstance.handleErrors).toHaveBeenCalledWith(undefined);
  });

  @Component({
    selector: 'app-search-form-test',
    template: `
      <app-search-form
        [initialValues]="initialValues"
        (errors)="handleErrors($event)"
        (resetForm)="resetForm()"
        (search)="search($event)"
      >
      </app-search-form>
    `,
    standalone: false,
  })
  class SearchFormTestComponent {
    initialValues?: SearchFormValues;
    handleErrors = jest.fn();
    resetForm = jest.fn();
    search = jest.fn();
  }

  function createMockControlValueAccessor(selector: string) {
    @Component({
      selector,
      template: ``,
      providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          multi: true,
          useExisting: MockControlValueAccessorComponent,
        },
        {
          provide: FormFieldControl,
          useExisting: MockControlValueAccessorComponent,
        },
      ],
    })
    class MockControlValueAccessorComponent implements ControlValueAccessor, FormFieldControl {
      @Output() inputText = new EventEmitter<string>();
      constructor(public injector: Injector) {}

      get ngControl() {
        return this.injector.get(NgControl);
      }
      id!: string;
      ariaDescribedBy!: string;
      controlType = 'typeahead';
      multi = false;
      writeValue(value: string) {}
      registerOnChange(fn: (_: any) => void): void {}
      registerOnTouched() {}
    }
    return MockControlValueAccessorComponent;
  }
});
