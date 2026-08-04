import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import { AppState } from '../app.reducer';

@Injectable({ providedIn: 'root' })
export class ConfigGuard {
  constructor(private router: Router, private store: Store<AppState>) {}

  canActivate() {
    return this.store.pipe(
      map((state) => !state.config.appFailedError),
      tap((canActivate) => {
        if (!canActivate) {
          this.router.navigate(['/technical-error']);
        }
      })
    );
  }
}
