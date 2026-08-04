import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  ViewChild,
  ViewEncapsulation,
  output,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  CheckboxOption,
  PdkFieldsetComponent,
  PdkFieldsetLegendDirective,
  PdkInsetTextComponent,
  PdkButton,
  PdkCheckBox,
  PdkCore,
  PdkDateInput,
  PdkDetailsSummary,
  PdkForm,
  PdkTextInput,
  PdkSelectComponent,
  ValidationError,
} from '@cpp/pdk';
import {
  ApplicationTypeAutosuggestComponent,
  CourtApplicationType,
  HearingType,
  HearingTypeSelectComponent,
  OrganisationUnit,
  OrganisationUnitAutosuggestComponent,
  Prosecutor,
  ProsecutorAutosuggestComponent,
} from '@cpp/reference-data';
import { parseFormValues } from '../../core/util/form';
import { CaseStatus } from '../search.interfaces';
import { SearchUnifiedCasesParams } from '../services/unified-search.service';
import { DatePipe, NgTemplateOutlet } from '@angular/common';

type PartyType = 'DEFENDANT' | 'RESPONDENT' | 'APPLICANT';

export interface SearchFormValues {
  caseStatus?: SearchUnifiedCasesParams['caseStatus'];
  applicationType?: CourtApplicationType;
  caseReference?: string;
  organisationUnit?: OrganisationUnit;
  hearingType?: HearingType;
  partyFirstAndOrMiddleName?: string;
  partyAddress?: string;
  partyTypes?: PartyType[];
  partyLastNameOrOrganisationName?: string;
  partyPostcode?: string;
  phonetic?: boolean;
  prosecutor?: Prosecutor;
  hearingDateFrom?: string;
  hearingDateTo?: string;
  sjp?: boolean;
  magistrateCourt?: boolean;
  crownCourt?: boolean;
  sortBySjpNoticeServed?: SearchUnifiedCasesParams['sortBySjpNoticeServed'];
  partyDateOfBirth?: string;
  boxWorkHearing?: boolean;
  boxWorkVirtualHearing?: boolean;
}

@Component({
  selector: 'app-search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @let valueRecord = values();
    <form
      #form="ngForm"
      pdk-form
      (errors)="errors.emit($event)"
      (validSubmit)="handleSearch(form.value)"
    >
      <div data-test-id="form-actions-top">
        <ng-container *ngTemplateOutlet="formActions"></ng-container>
      </div>

      <pdk-form-group pdk-margin-bottom="4">
        <fieldset pdk-fieldset>
          <legend pdk-legend="small">Case status</legend>

          <pdk-checkbox-group
            name="caseStatus"
            [(ngModel)]="valueRecord.caseStatus"
            checkboxType="small"
            [options]="caseStatusOptions"
          >
          </pdk-checkbox-group>
        </fieldset>
      </pdk-form-group>

      <pdk-form-field label="Reference" labelType="small" pdk-margin-bottom="4">
        <input
          type="text"
          [ngModel]="valueRecord.caseReference"
          name="caseReference"
          autocomplete="off"
          pdk-text-input
        />
      </pdk-form-field>

      <pdk-form-field label="First name" labelType="small" pdk-margin-bottom="3">
        <input
          #partyFirstAndOrMiddleName="ngModel"
          type="text"
          autocomplete="off"
          [ngModel]="valueRecord.partyFirstAndOrMiddleName"
          name="partyFirstAndOrMiddleName"
          pdk-text-input
        />
      </pdk-form-field>

      <pdk-form-field
        label="Last name or organisation"
        labelType="small"
        pdk-margin-bottom="3"
        [errorMessages]="[
          { rule: 'required', message: 'Enter last name to find search results' },
          { rule: 'minlength', message: 'Name must be at least 2 characters long' }
        ]"
      >
        <input
          #partyLastNameOrOrganisationName="ngModel"
          type="text"
          autocomplete="off"
          [ngModel]="valueRecord.partyLastNameOrOrganisationName"
          name="partyLastNameOrOrganisationName"
          [minlength]="partyLastNameOrOrganisationName.value && 2"
          [required]="!!partyFirstAndOrMiddleName.value"
          pdk-text-input
        />
      </pdk-form-field>

      <details pdk-details [open]="initialValuesSnapshot()?.partyTypes">
        <summary>Select type</summary>
        <pdk-form-field label="Type" labelType="none">
          <pdk-checkbox-group
            name="partyTypes"
            checkboxType="small"
            [ngModel]="valueRecord.partyTypes"
            [options]="partyTypeOptions"
          >
          </pdk-checkbox-group>
        </pdk-form-field>
      </details>

      <pdk-form-field label="Date of birth" labelType="small">
        <pdk-date-input [ngModel]="valueRecord.partyDateOfBirth" name="partyDateOfBirth" pastDate>
        </pdk-date-input>
      </pdk-form-field>

      <fieldset pdk-fieldset>
        <legend pdk-legend="small">Address</legend>

        <pdk-form-field label="First line of address" pdk-margin-bottom="4">
          <input
            type="text"
            autocomplete="off"
            [ngModel]="valueRecord.partyAddress"
            name="partyAddress"
            pdk-text-input
          />
        </pdk-form-field>

        <pdk-form-field label="Postcode">
          <input
            type="text"
            autocomplete="off"
            [ngModel]="valueRecord.partyPostcode"
            name="partyPostcode"
            pdk-text-input="postcode"
          />
        </pdk-form-field>
      </fieldset>

      <pdk-form-field label="Prosecutor" labelType="small">
        <cpp-prosecutor-autosuggest
          [ngModel]="valueRecord.prosecutor"
          name="prosecutor"
          (inputText)="prosecutorInputText = $event"
        >
        </cpp-prosecutor-autosuggest>
      </pdk-form-field>

      <fieldset pdk-fieldset>
        <legend pdk-legend="small">Hearing date</legend>

        <pdk-form-field label="Hearing from date" labelType="none" pdk-margin-bottom="3">
          <pdk-date-input
            #hearingDateFrom="ngModel"
            [ngModel]="valueRecord.hearingDateFrom"
            name="hearingDateFrom"
          >
          </pdk-date-input>
          <pdk-inset-text pdk-margin-bottom="0" pdk-margin-top="3">
            Selected day: @if (hearingDateFrom.valid) {
            <span> {{ hearingDateFrom.value | date : 'EEEE' }}</span>
            }
          </pdk-inset-text>
        </pdk-form-field>

        <p pdk-typography="body">to</p>

        <pdk-form-field
          [errorMessages]="[
            { rule: 'minDate', message: 'Hearing to date must be later than from date' }
          ]"
          label="Hearing to date"
          labelType="none"
        >
          <pdk-date-input
            #hearingDateTo="ngModel"
            [ngModel]="valueRecord.hearingDateTo"
            name="hearingDateTo"
            [minDate]="hearingDateFrom.value"
          >
          </pdk-date-input>

          <pdk-inset-text pdk-margin-bottom="0" pdk-margin-top="3">
            Selected day: @if (!hearingDateTo.errors?.dateExists &&
            !hearingDateTo.errors?.dateFormat) {
            <span> {{ hearingDateTo.value | date : 'EEEE' }}</span>
            }
          </pdk-inset-text>
        </pdk-form-field>
      </fieldset>

      <pdk-form-field label="Hearing type" labelType="small">
        <cpp-hearing-type-select
          name="hearingType"
          [ngModel]="valueRecord.hearingType"
          justified
          placeholder="All hearing types"
        >
        </cpp-hearing-type-select>
      </pdk-form-field>

      <pdk-form-group pdk-margin-bottom="4">
        <fieldset pdk-fieldset>
          <legend pdk-legend="small">Jurisdiction</legend>
          <pdk-checkbox
            #sjp="ngModel"
            [ngModel]="valueRecord.sjp"
            (ngModelChange)="sortBySjpNoticeServed.control.setValue(undefined)"
            name="sjp"
            checkboxType="small"
            [valueChecked]="true"
            [valueUnchecked]="undefined"
            >Single justice procedure</pdk-checkbox
          >
          <div [hidden]="!sjp.value">
            <pdk-checkbox-conditional checkboxType="small">
              <pdk-form-field label="Sort by date SJP notice served" labelType="small">
                <pdk-select
                  #sortBySjpNoticeServed="ngModel"
                  [ngModel]="valueRecord.sortBySjpNoticeServed"
                  name="sortBySjpNoticeServed"
                  placeholder="Not applicable"
                  [options]="sortBySjpNoticeServedOptions"
                  justified
                ></pdk-select>
              </pdk-form-field>
            </pdk-checkbox-conditional>
          </div>
          <pdk-checkbox
            [ngModel]="valueRecord.magistrateCourt"
            name="magistrateCourt"
            checkboxType="small"
            [value]="true"
            >Magistrates'</pdk-checkbox
          >
          <pdk-checkbox
            [ngModel]="valueRecord.crownCourt"
            name="crownCourt"
            checkboxType="small"
            [value]="true"
            >Crown</pdk-checkbox
          >
        </fieldset>
      </pdk-form-group>

      <pdk-form-field label="Court" labelType="small">
        <cpp-organisation-unit-autosuggest
          name="organisationUnit"
          [ngModel]="valueRecord.organisationUnit"
        >
        </cpp-organisation-unit-autosuggest>
      </pdk-form-field>

      <pdk-form-field label="Application type" labelType="small">
        <cpp-application-type-autosuggest
          name="applicationType"
          [ngModel]="valueRecord.applicationType"
        >
        </cpp-application-type-autosuggest>
      </pdk-form-field>

      @if (valueRecord.boxWorkHearing) {
      <fieldset pdk-fieldset>
        <legend pdk-legend="small" pdk-margin-bottom="0">Box work</legend>
        <pdk-form-field>
          <pdk-checkbox
            #boxWorkHearing="ngModel"
            name="boxWorkHearing"
            checkboxType="small"
            [ngModel]="valueRecord.boxWorkHearing"
            [valueChecked]="true"
            [valueUnchecked]="undefined"
          >
            Show boxwork only
          </pdk-checkbox>
          @if (boxWorkHearing.value) {
          <div>
            <pdk-checkbox-conditional checkboxType="small">
              <pdk-checkbox
                #boxWorkVirtualHearing="ngModel"
                pdk-margin-top="2"
                name="boxWorkVirtualHearing"
                checkboxType="small"
                [ngModel]="valueRecord.boxWorkVirtualHearing"
                [valueChecked]="true"
                [valueUnchecked]="undefined"
              >
                Show timed appointments
              </pdk-checkbox>
            </pdk-checkbox-conditional>
          </div>
          }
        </pdk-form-field>
      </fieldset>
      }

      <div data-test-id="form-actions-bottom">
        <ng-container *ngTemplateOutlet="formActions"></ng-container>
      </div>
    </form>

    <ng-template #formActions>
      <pdk-form-group class="app-search__form-actions" pdk-margin-bottom="6">
        <button type="submit" pdk-button pdk-margin="0">Apply filters</button>
        <a
          pdk-link
          pdk-margin-horizontal="3"
          href="javascript:void(0)"
          data-test-id="clear-filters"
          (click)="handleClearFilters()"
          >Clear filters</a
        >
      </pdk-form-group>
    </ng-template>
  `,
  styles: [
    `
      .app-search__form-actions {
        display: flex;
        align-items: center;
      }
    `,
  ],
  imports: [
    DatePipe,
    NgTemplateOutlet,
    PdkCheckBox,
    PdkCore,
    PdkForm,
    PdkDetailsSummary,
    PdkButton,
    PdkTextInput,
    PdkFieldsetComponent,
    PdkFieldsetLegendDirective,
    PdkDateInput,
    PdkInsetTextComponent,
    PdkSelectComponent,
    FormsModule,
    OrganisationUnitAutosuggestComponent,
    ProsecutorAutosuggestComponent,
    HearingTypeSelectComponent,
    ApplicationTypeAutosuggestComponent,
  ],
})
export class SearchFormComponent {
  readonly initialValues = input<SearchFormValues | undefined>(undefined);
  readonly initialValuesSnapshot = linkedSignal(() => this.initialValues());
  readonly values = computed(() =>
    this.initialValues() ? JSON.parse(JSON.stringify(this.initialValues())) : {}
  );

  readonly errors = output<ValidationError[] | undefined>();
  readonly resetForm = output<{
    isBoxWorkHearing: boolean;
  }>();
  readonly search = output<SearchFormValues>();
  @ViewChild(NgForm) ngFormRef!: NgForm;

  prosecutorInputText: string | null = null;

  partyTypeOptions: CheckboxOption<PartyType>[] = [
    { value: 'DEFENDANT', label: 'Defendant' },
    { value: 'RESPONDENT', label: 'Respondent' },
    { value: 'APPLICANT', label: 'Applicant' },
  ];

  sortBySjpNoticeServedOptions: {
    value: SearchFormValues['sortBySjpNoticeServed'];
    label: string;
  }[] = [
    { value: 'asc', label: 'Ascending' },
    { value: 'desc', label: 'Descending' },
  ];

  caseStatusOptions: CheckboxOption<CaseStatus>[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  handleClearFilters() {
    this.ngFormRef.resetForm();
    this.initialValuesSnapshot.set(undefined);
    this.resetForm.emit({ isBoxWorkHearing: !!this.values().boxWorkHearing });
  }

  handleSearch(values: SearchFormValues) {
    this.errors.emit(undefined);
    const filteredFormValues: SearchFormValues = parseFormValues({
      ...values,
      // accept the free text entered in the prosecutor input
      prosecutor: values.prosecutor
        ? values.prosecutor
        : this.prosecutorInputText
        ? ({ shortName: this.prosecutorInputText } as Prosecutor)
        : undefined,
    });
    const {
      boxWorkHearing,
      crownCourt,
      magistrateCourt,
      partyTypes,
      sjp,
      sortBySjpNoticeServed,
      ...mandatoryFormValues
    } = filteredFormValues;
    const totalFormValues = Object.keys(mandatoryFormValues).length;

    if (filteredFormValues.boxWorkVirtualHearing || filteredFormValues.boxWorkHearing) {
      this.search.emit(filteredFormValues);
    } else if (totalFormValues === 0) {
      this.errors.emit([
        {
          id: 'javascript:void(0)',
          message: 'Add filters to find search results',
        },
      ]);
    } else if (
      totalFormValues === 1 &&
      !filteredFormValues.caseReference &&
      !filteredFormValues.partyLastNameOrOrganisationName
    ) {
      this.errors.emit([
        {
          id: 'javascript:void(0)',
          message: 'Add another filter to find search results',
        },
      ]);
    } else {
      this.search.emit(filteredFormValues);
    }
  }
}
