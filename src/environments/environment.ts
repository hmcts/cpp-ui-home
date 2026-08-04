import { provideCppFakeSession } from '@cpp/core';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { LEGAL_ADVISER_III } from '@cpp/testing/resources';

export const environment = {
  production: false,
  providers: [
    provideCppFakeSession({
      defaultUserId: LEGAL_ADVISER_III.userId,
      queryParamInitializer: true
    }),
    provideStoreDevtools()
  ]
};
