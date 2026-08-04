import { Component, input } from '@angular/core';
import { PdkMarginDirective, PdkBreadcrumbs } from '@cpp/pdk';

export interface Breadcrumb {
  href: string | null;
  label: string;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumbs',
  template: `
    <ol pdk-breadcrumb-list pdk-margin-bottom="2">
      @for (breadcrumb of breadcrumbs(); track breadcrumb.label) {
      <li pdk-breadcrumb-list-item>
        <a [attr.href]="breadcrumb.href" [pdk-breadcrumb]="getActive(breadcrumb)">
          {{ breadcrumb.label }}
        </a>
      </li>
      }
    </ol>
  `,
  imports: [PdkMarginDirective, PdkBreadcrumbs],
})
export class BreadcrumbsComponent {
  readonly breadcrumbs = input<Breadcrumb[]>([]);

  getActive({ active }: Breadcrumb) {
    return active ? 'active' : 'inactive';
  }
}
