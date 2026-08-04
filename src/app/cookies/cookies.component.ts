import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookiesPreferences, CookiesService } from '@cpp/core';
import { CookiesPreferencesFormComponent } from './cookies-preferences-form.component';
import { PdkCore, PdkGrid, PdkTable } from '@cpp/pdk';

@Component({
  selector: 'app-cookies',
  template: `
    <h1 pdk-typography="heading-xlarge">Cookies on Common Platform</h1>

    <pdk-grid container>
      <pdk-grid two-thirds>
        <p pdk-typography="body">
          Cookies are files saved on your phone, tablet or computer when you visit a website.
        </p>

        <p pdk-typography="body">
          We use cookies to make the Common Platform work and collect information about how you use
          the service.
        </p>

        <h2 pdk-typography="heading-medium">Essential cookies</h2>
        <p pdk-typography="body">
          Essential cookies record your session on the Common Platform, improve performance and
          remember language preferences. We do not need to ask permission to use them.
        </p>

        <table pdk-table>
          <thead pdk-table-head>
            <tr pdk-table-row>
              <th pdk-table-header>Name</th>
              <th pdk-table-header>Purpose</th>
              <th pdk-table-header>Expires</th>
            </tr>
          </thead>
          <tbody pdk-table-body>
            <tr pdk-table-row>
              <td pdk-table-cell>
                amtIdamCookie, pidpIdamCookie, pidpSessionIdamCookie, idamidpcontam, idamidptok
              </td>
              <td pdk-table-cell>Details of your current session</td>
              <td pdk-table-cell>30 minutes</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>LOGIN_LB_ID, FRONTEND_LB_ID, TOKEN_LB_ID</td>
              <td pdk-table-cell>To improve performance</td>
              <td pdk-table-cell>When your browser closes</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>pidplbIdamCookie, idamidplb</td>
              <td pdk-table-cell>To improve performance</td>
              <td pdk-table-cell>30 minutes</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>COOKIE_LOCALE_LANG, i18next</td>
              <td pdk-table-cell>Localisation</td>
              <td pdk-table-cell>30 minutes</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>COOKIE_LOCALE</td>
              <td pdk-table-cell>LocRemember language preferences (e.g. Welsh)alisation</td>
              <td pdk-table-cell>When your browser closes</td>
            </tr>
          </tbody>
        </table>

        <h2 pdk-typography="heading-medium">To measure application performance</h2>
        <p pdk-typography="body">
          We use Dynatrace Software Intelligence Platform to provide an Application Performance
          Monitoring Service to collect information about how you use HMCTS services. We do this to
          monitor HMCTS services in order to resolve issues within our services as well as collect
          data on how our services can be improved. HMCTS store information about:
        </p>
        <ul pdk-list="bullet">
          <li>Site performance</li>
          <li>Website usage</li>
          <li>User behaviour</li>
        </ul>
        <p pdk-typography="body">
          Information is presented within the Application Performance Monitoring service for the
          purposes detailed above. We do not use or share the information for any other purpose. We
          do not allow Dynatrace to use or share the information for any other purposes.
        </p>

        <table class="cookies-table" pdk-table>
          <thead pdk-table-head>
            <tr pdk-table-row>
              <th pdk-table-header>Name</th>
              <th pdk-table-header>Purpose</th>
              <th pdk-table-header>Expires</th>
            </tr>
          </thead>
          <tbody pdk-table-body>
            <tr pdk-table-row>
              <td pdk-table-cell>dtCookie</td>
              <td pdk-table-cell>Tracks a visit across multiple request</td>
              <td pdk-table-cell>Session end</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>dtLatC</td>
              <td pdk-table-cell>Measures server latency for performance monitoring</td>
              <td pdk-table-cell>Session end</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>dtPC</td>
              <td pdk-table-cell>
                Required to identify proper endpoints for beacon transmission; includes session ID
                for correlation
              </td>
              <td pdk-table-cell>Session end</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>dtSa</td>
              <td pdk-table-cell>Intermediate store for page-spanning actions</td>
              <td pdk-table-cell>Session end</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>rxVisitor</td>
              <td pdk-table-cell>Visitor ID to correlate sessions</td>
              <td pdk-table-cell>1 year</td>
            </tr>
            <tr pdk-table-row>
              <td pdk-table-cell>rxvt</td>
              <td pdk-table-cell>Session timeout</td>
              <td pdk-table-cell>Session end</td>
            </tr>
          </tbody>
        </table>

        <app-cookies-preferences-form
          [values]="formValues"
          (formSubmit)="handleSubmitCookiesPreferences($event)"
        />
      </pdk-grid>
    </pdk-grid>
  `,
  styles: [
    `
      .cookies-table {
        table-layout: fixed;
      }
      .cookies-table tr > th:nth-child(1),
      .cookies-table tr > td:nth-child(1) {
        width: 100px;
      }
      .cookies-table tr > th:nth-child(3),
      .cookies-table > td:nth-child(3) {
        width: 125px;
      }
      .cookies-table tr > td:nth-child(1) {
        font-weight: bold;
      }
    `,
  ],
  imports: [CookiesPreferencesFormComponent, PdkGrid, PdkTable, PdkCore],
})
export class CookiesComponent {
  formValues: CookiesPreferences;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cookiesService: CookiesService,
    private router: Router
  ) {
    this.formValues = this.cookiesService.getAllCookiePreferences();
  }

  handleSubmitCookiesPreferences(values: CookiesPreferences) {
    this.cookiesService.setAllCookiePreferences(values);

    const referrer = this.activatedRoute.snapshot.queryParamMap.get('referrer');

    if (referrer) {
      window.location.href = referrer;
    } else {
      this.cookiesService.restart();
      this.router.navigateByUrl('/');
    }
  }
}
