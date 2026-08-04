import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UserService, getUserServices } from '@cpp/users-groups';
import { HomeComponent } from './home.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home-container',
  template: ` <app-home [userServices]="userServices$ | async" /> `,
  imports: [HomeComponent, AsyncPipe],
})
export class HomeContainerComponent {
  userServices$: Observable<UserService[]>;

  constructor(store: Store<AppState>) {
    this.userServices$ = store.pipe(
      select(getUserServices),
      filter((userServices): userServices is UserService[] => !!userServices),
      map((userServices) =>
        userServices.filter((userService) =>
          userService.features.some((feature) => feature.type === 'LINK')
        )
      )
    );
  }
}
