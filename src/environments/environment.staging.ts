import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const environment = {
  production: true,
  modules: [StoreDevtoolsModule.instrument()]
};
