import { Component, computed, input, ViewEncapsulation } from '@angular/core';
import { UserService } from '@cpp/users-groups';
import { UserServiceFeatureUrlPipe } from './user-service-feature-url.pipe';
import { PdkMastheadComponent, PdkCore, PdkGrid } from '@cpp/pdk';

@Component({
  selector: 'app-home',
  template: `
    <div>
      <pdk-masthead>
        <h1 pdk-typography="heading-xlarge" pdk-text-colour="white" pdk-margin-vertical="4">
          Home
        </h1>
      </pdk-masthead>
    </div>

    @for (userServicesList of groupedUserServices(); let index=$index; track index) {
    <pdk-grid container>
      @for (userService of userServicesList; track userService.name) {
      <pdk-grid one-third>
        <div
          class="home-panel"
          data-test-id="user-service"
          pdk-margin-top="6"
          pdk-border-colour="mid-grey"
          tint="25"
        >
          <div pdk-fill-colour="light-grey" pdk-padding="3">
            <h2 pdk-typography="heading-small" pdk-margin="0">{{ userService.name }}</h2>
          </div>
          <ul pdk-list pdk-padding="3">
            @for (feature of userService.features; track feature.key) { @if (feature.type === 'LINK'
            && !!(feature | userServiceFeatureUrl)) {
            <li data-test-id="user-feature">
              <a pdk-link [attr.href]="feature | userServiceFeatureUrl">{{ feature.title }}</a>
            </li>
            } }
          </ul>
        </div>
      </pdk-grid>
      }
    </pdk-grid>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .home-panel {
        border-width: 1px;
        border-style: solid;
      }
    `,
  ],
  imports: [UserServiceFeatureUrlPipe, PdkMastheadComponent, PdkGrid, PdkCore],
})
export class HomeComponent {
  readonly userServices = input.required<UserService[]>();
  groupedUserServices = computed(() => {
    const groupedServices: UserService[][] = [];
    const userServicesWithFeatures: UserService[] = [];
    for (const userService of this.userServices()) {
      if (userService.features.length > 0) {
        userServicesWithFeatures.push(userService);
      }
    }

    for (let i = 0; i < userServicesWithFeatures.length; i++) {
      if (i % 3 === 0) {
        groupedServices.push([]);
      }
      groupedServices[groupedServices.length - 1].push(userServicesWithFeatures[i]);
    }
    return groupedServices;
  });
}
