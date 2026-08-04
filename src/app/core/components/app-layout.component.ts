import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderNavItem, CppApplicationLayoutComponent } from '@cpp/application';
import { PdkMarginDirective } from '@cpp/pdk';

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <cpp-application-layout
      [activity]="activity()"
      cookiesLink="/cookies"
      accessibilityLink="/accessibility"
      [headerNavItems]="headerNavItems()"
      [searchEnabled]="searchEnabled()"
      serviceLink="/"
      serviceName="Common Platform"
      searchPlaceholder="Search by Reference or PNC ID"
      searchLabel="Search by case reference, application reference or PNC ID"
      (search)="search.emit($event)"
      termsLink="/terms-and-conditions"
    >
      <div pdk-margin-top="6">
        <router-outlet></router-outlet>
      </div>
    </cpp-application-layout>
  `,
  imports: [CppApplicationLayoutComponent, RouterOutlet, PdkMarginDirective]
})
export class AppLayoutComponent {
  readonly activity = input(false);
  readonly headerNavItems = input<HeaderNavItem[]>([]);
  readonly searchEnabled = input(false);
  readonly search = output<string>();
}
