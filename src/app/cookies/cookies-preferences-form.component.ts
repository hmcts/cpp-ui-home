import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CookiesPreferences } from '@cpp/core';
import { PdkButton, PdkForm, PdkRadio } from '@cpp/pdk';

@Component({
  selector: 'app-cookies-preferences-form',
  template: `
    <form #form="ngForm" pdk-form novalidate (validSubmit)="formSubmit.emit(form.value)">
      <pdk-form-field
        label="Allow cookies that measure website application performance monitoring?"
        labelType="small"
      >
        <pdk-radio-group [ngModel]="values().realUserMonitoring" name="realUserMonitoring">
          <pdk-radio-button [value]="true"
            >Use cookies that measure website application performance monitoring</pdk-radio-button
          >
          <pdk-radio-button [value]="false"
            >Do not use cookies that measure website application performance
            monitoring</pdk-radio-button
          >
        </pdk-radio-group>
      </pdk-form-field>

      <pdk-button-group> <button pdk-button type="submit">Save</button> </pdk-button-group>
    </form>
  `,
  imports: [PdkForm, PdkRadio, FormsModule, PdkButton],
})
export class CookiesPreferencesFormComponent {
  readonly values = input.required<Partial<CookiesPreferences>>();
  readonly formSubmit = output<CookiesPreferences>();
}
