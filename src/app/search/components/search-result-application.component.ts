import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { generateId, PdkAlertComponent, PdkInsetTextComponent, PdkCore } from '@cpp/pdk';
import { isAfter } from 'date-fns';
import { displayName } from '../../shared/pipes/display-name.pipe';
import {
  UnifiedSearchApplication,
  UnifiedSearchCase,
  UnifiedSearchParty,
  UnifiedSearchHearing,
} from '../search.interfaces';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-search-result-application',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="app-search-result" pdk-margin-bottom="5" pdk-border-colour="mid-grey">
      <header
        class="app-search-result__header"
        pdk-fill-colour="light-grey"
        pdk-padding-top="2"
        pdk-padding-bottom="1"
        pdk-padding-horizontal="6"
      >
        <button
          class="app-search-result__toggle"
          pdk-margin-bottom="1"
          pdk-padding-left="4"
          pdk-text-colour="blue"
          pdk-text-hover-colour="dark-blue"
          pdk-typography="body-medium"
          pdk-focusable
          [class.app-search-result__toggle--open]="contentExpanded"
          [attr.id]="summaryId"
          [attr.aria-controls]="contentId"
          [attr.aria-expanded]="contentExpanded"
          (click)="contentExpanded = !contentExpanded"
        >
          <span class="app-search-result__toggle-text">{{ application.applicationReference }}</span>
        </button>
        @if (application.applicationId) {
        <a
          data-test-id="view-application"
          pdk-link
          href="javascript:void(0)"
          (click)="viewApplication.emit(result())"
          >View application</a
        >
        }
      </header>
      <div pdk-padding-horizontal="6">
        @if (overdueError) {
        <div data-test-id="overdue-notice" pdk-margin-vertical="4">
          <pdk-alert icon>Overdue</pdk-alert>
        </div>
        }
        <dl>
          <div class="app-search-result__row">
            <div pdk-margin-right="2">
              <dt pdk-visually-hidden>Application type</dt>
              <dd>{{ application.applicationType }}</dd>
            </div>
            @if (applicationDueDate) {
            <div>
              <dt>Due date</dt>
              <dd>{{ applicationDueDate | date : 'd MMMM yyyy' }}</dd>
            </div>
            }
          </div>

          <div class="app-search-result__row app-search-result__row__appointmentTime">
            <dt>Appointment time</dt>
            @if (appointmentTime) {
            <dd>
              {{ appointmentTime | date : 'HH:mm' }}
            </dd>
            } @if (!hearing?.isVirtualBoxHearing) {
            <dd>-</dd>
            }
          </div>
        </dl>
        <pdk-inset-text
          pdk-padding-vertical="0"
          class="app-search-result__content"
          [class.app-search-result__content--open]="contentExpanded"
          [attr.id]="contentId"
          [attr.aria-labelledby]="summaryId"
        >
          <dl class="app-search-result__metadata">
            <div pdk-margin-bottom="4">
              <dt>Applicant</dt>
              @if (applicants) {
              <dd>{{ applicants }}</dd>
              } @if (!applicants) {
              <dd>-</dd>
              }
            </div>
            <div pdk-margin-bottom="4">
              <dt>Respondents</dt>
              @if (respondents) {
              <dd>{{ respondents }}</dd>
              } @if (!respondents) {
              <dd>-</dd>
              }
            </div>
            <div pdk-margin-bottom="4">
              <dt>Court</dt>
              <dd>{{ hearing?.courtCentreName || '-' }}</dd>
            </div>
          </dl>
        </pdk-inset-text>
      </div>
    </section>
  `,
  imports: [DatePipe, PdkCore, PdkAlertComponent, PdkInsetTextComponent],
})
export class SearchResultApplicationComponent {
  readonly result = input.required<UnifiedSearchCase>();
  readonly viewApplication = output<UnifiedSearchCase>();

  contentExpanded = false;
  contentId = generateId('app-search-result-application-content');
  summaryId = generateId('app-search-result-application-summary');

  get appointmentTime(): string | undefined {
    if (
      this.hearing &&
      this.hearing.isVirtualBoxHearing &&
      this.hearing.hearingDays &&
      this.hearing.hearingDays[0].sittingDay
    ) {
      return this.hearing.hearingDays[0].sittingDay;
    }
  }

  get applicants(): string | null {
    return this.getFilteredParties('APPLICANT');
  }

  get application(): UnifiedSearchApplication {
    return this.result().applications![0];
  }

  get applicationAssignedTo(): UnifiedSearchHearing['assignedTo'] {
    if (this.hearing) {
      return this.hearing.assignedTo;
    }
  }

  get hearing(): UnifiedSearchHearing | undefined {
    const result = this.result();
    if (result.hearings && result.hearings[0]) {
      return result.hearings[0];
    }
  }

  get applicationDueDate(): string | undefined {
    const hearing = this.hearing;
    if (hearing && hearing.isBoxHearing) {
      if (hearing.hearingDates && hearing.hearingDates.length > 0) {
        return hearing.hearingDates[0];
      }
    }
  }

  get overdueError(): boolean {
    if (
      this.hearing &&
      this.hearing.isBoxHearing &&
      this.hearing.boxWorkTaskStatus === 'IN_PROGRESS' &&
      this.applicationDueDate
    ) {
      return isAfter(new Date(), this.applicationDueDate);
    }
    return false;
  }

  get respondents(): string | null {
    return this.getFilteredParties('RESPONDENT');
  }

  private getFilteredParties(partyType: UnifiedSearchParty['partyType']) {
    const partyTypes = this.result().parties.filter((party) => party.partyType === partyType);

    if (partyTypes.length !== 0) {
      return partyTypes.map((party) => party.organisationName || displayName(party)).join(', ');
    }
    return null;
  }
}
