/*eslint-disable @angular-eslint/prefer-standalone*/
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import * as lolex from 'lolex';
import { omit } from 'ramda';
import { mockFive, mockFour, mockThree, mockTwo } from '../../mocks/unified-search-cases.mock';
import { UnifiedSearchApplication, UnifiedSearchCase } from '../../search.interfaces';
import { SearchResultCaseComponent } from '../search-result-case.component';

describe('SearchResultCaseComponent', () => {
  let fixture: ComponentFixture<SearchResultCaseTestComponent>;

  beforeAll(() => {
    lolex.install({ now: new Date(2019, 0, 1) });
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SearchResultCaseComponent],
      declarations: [SearchResultCaseTestComponent]
    });

    fixture = TestBed.createComponent(SearchResultCaseTestComponent);
  });

  describe('when the case belongs to sjp', () => {
    beforeEach(() => {
      fixture.componentInstance.result = mockFour;
      fixture.detectChanges();
    });

    it('should compile correctly', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should compile with a link to enter and upload postal reply depending on the case status', () => {
      fixture.componentInstance.result = {
        ...mockFour,
        caseStatus: 'NO_PLEA_RECEIVED'
      };
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();

      fixture.componentInstance.result = {
        ...mockFour,
        caseStatus: 'NO_PLEA_RECEIVED_READY_FOR_DECISION'
      };
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();

      fixture.componentInstance.result = {
        ...mockFour,
        caseStatus: 'PLEA_RECEIVED_NOT_READY_FOR_DECISION'
      };
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should emit a `postalReply` event when uploading the postal reply', () => {
      const mock: UnifiedSearchCase = {
        ...mockFour,
        caseStatus: 'NO_PLEA_RECEIVED'
      };
      fixture.componentInstance.result = mock;
      fixture.detectChanges();
      fixture.debugElement
        .query(By.css('[data-test-id="handle-postal-reply"]'))
        .nativeElement.click();

      expect(fixture.componentInstance.postalReply).toHaveBeenCalledWith(mock);
    });

    it('should emit a `viewSjpCase` event when viewing the case', () => {
      fixture.debugElement.query(By.css('[data-test-id="view-sjp-case"]')).nativeElement.click();

      expect(fixture.componentInstance.viewSjpCase).toHaveBeenCalledWith(mockFour);
    });

    it('should emit a `viewApplicationAtAGlance` event when viewing the case', () => {
      fixture.componentInstance.result = mockFive;
      fixture.detectChanges();
      fixture.debugElement
        .query(By.css('[data-test-id="view-application-at-a-glance"]'))
        .nativeElement.click();

      expect(fixture.componentInstance.viewApplicationAtAGlance).toHaveBeenCalledWith(
        mockFive.applications![0]
      );
    });

    it('should emit a `viewCrownCourtCase` event when viewing a case that also belongs to crown court', () => {
      const modifiedMockFour = {
        ...mockFour,
        crownCourt: true
      };
      fixture.componentInstance.result = modifiedMockFour;
      fixture.detectChanges();
      fixture.debugElement
        .query(By.css('[data-test-id="view-crown-court-case"]'))
        .nativeElement.click();

      expect(fixture.componentInstance.viewCrownCourtCase).toHaveBeenCalledWith(modifiedMockFour);
    });
  });

  describe('when the case does belongs to crown court', () => {
    beforeEach(() => {
      fixture.componentInstance.result = mockThree;
      fixture.detectChanges();
    });

    it('should compile correctly when there is a next hearing', () => {
      expect(fixture).toMatchSnapshot();
    });

    it('should compile correctly when there are no hearings', () => {
      fixture.componentInstance.result = {
        ...mockThree,
        hearings: []
      };
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should compile correctly when there are no applications', () => {
      fixture.componentInstance.result = {
        ...mockThree,
        applications: []
      };
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();

      fixture.componentInstance.result = omit(['applications'], mockThree);
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should compile correctly when all hearings have elapsed', () => {
      fixture.componentInstance.result = {
        ...mockThree,
        hearings: [
          {
            ...mockThree.hearings![0],
            hearingDates: [new Date(2018, 11, 31).toISOString()]
          }
        ]
      };
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should compile correctly when the next hearing takes place over several days', () => {
      fixture.componentInstance.result = {
        ...mockThree,
        hearings: [
          {
            ...mockThree.hearings![0],
            hearingDates: [new Date(2018, 11, 31).toISOString(), new Date(2019, 0, 1).toISOString()]
          }
        ]
      };
      fixture.detectChanges();
      expect(fixture).toMatchSnapshot();
    });

    it('should emit a `viewCrownCourtCase` event when viewing the case', () => {
      fixture.debugElement
        .query(By.css('[data-test-id="view-crown-court-case"]'))
        .nativeElement.click();

      expect(fixture.componentInstance.viewCrownCourtCase).toHaveBeenCalledWith(mockThree);
    });
  });

  describe('[TO_DEPRECATE] when the case belongs to SPI', () => {
    beforeEach(() => {
      fixture.componentInstance.result = {
        ...mockFour,
        sjp: false,
        crownCourt: false,
        magistrateCourt: false
      };
      fixture.detectChanges();
    });

    it('should compile correctly', () => {
      expect(fixture).toMatchSnapshot();
    });
  });

  describe('SearchResultCaseComponent -> Filter completed application', () => {
    let component: SearchResultCaseComponent;
    let fixture2: ComponentFixture<SearchResultCaseComponent>;

    beforeEach(() => {
      fixture2 = TestBed.createComponent(SearchResultCaseComponent);
      component = fixture2.componentInstance;
      fixture2.componentRef.setInput('result', {
        ...mockTwo,
        sjp: false,
        crownCourt: false,
        magistrateCourt: false
      });
      fixture.detectChanges();
    });

    it('should compile correctly', () => {
      expect(fixture2).toMatchSnapshot();
    });

    it('should return uncompleted applications from UnifiedSearchApplication[]', () => {
      const applicationsMock = mockTwo.applications!;
      const responseMock = [
        {
          applicationId: 'mock-application-id-1',
          applicationReference: 'ARN GB987654321',
          applicationType: 'Application for witness summons',
          receivedDate: '2019-05-17',
          dueDate: '2019-05-20',
          applicationStatus: 'IN_PROGRESS'
        },
        {
          applicationId: 'mock-application-id-2',
          applicationReference: '53NP2628622',
          applicationType: 'Failing to comply with the requirements of a community order',
          receivedDate: '2022-01-20',
          applicationStatus: 'DRAFT'
        },
        {
          applicationId: 'mock-application-id-4',
          applicationReference: '53NP2628622',
          applicationType:
            'Brought before the Court following imposition of custodial sentence in absence',
          receivedDate: '2022-01-25',
          applicationStatus: 'LISTED'
        }
      ] as UnifiedSearchApplication[];
      const result = component.getUncompletedApplications(applicationsMock);

      expect(result).toEqual(responseMock);
    });
  });

  describe('sourceSystemReference', () => {
    beforeEach(() => {
      fixture.componentInstance.result = mockFour;
      fixture.detectChanges();
    });

    it('should set the source system reference when the case is migrated', () => {
      const testReference = 'ABC123456';
      fixture.componentInstance.result = {
        ...mockFour,
        sourceSystemReference: testReference
      };
      fixture.detectChanges();

      expect(fixture.componentInstance.result.sourceSystemReference).toEqual(testReference);
    });

    it('should not have a source system reference when the case is not migrated', () => {
      fixture.componentInstance.result = {
        ...mockFour,
        sourceSystemReference: undefined
      };
      fixture.detectChanges();

      expect(fixture.componentInstance.result.sourceSystemReference).toBe(undefined);
    });
  });

  @Component({
    selector: 'app-search-result-case-test',
    template: `
      <app-search-result-case
        [result]="result"
        (postalReply)="postalReply($event)"
        (viewCrownCourtCase)="viewCrownCourtCase($event)"
        (viewSjpCase)="viewSjpCase($event)"
        (viewApplicationAtAGlance)="viewApplicationAtAGlance($event)"
      >
      </app-search-result-case>
    `,
    standalone: false
  })
  class SearchResultCaseTestComponent {
    result = mockThree;
    postalReply = jest.fn();
    viewCrownCourtCase = jest.fn();
    viewSjpCase = jest.fn();
    viewApplicationAtAGlance = jest.fn();
  }
});
