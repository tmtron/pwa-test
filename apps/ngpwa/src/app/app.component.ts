import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwUpdate } from '@angular/service-worker';
import { switchMap, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pwa-update-test-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private timerId?: number;
  status = 'uninit';

  version = 1;

  timerActive = true;

  autoActivateSubscription?: Subscription;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly swUpdate: SwUpdate
  ) {}

  ngOnInit() {
    this.status = 'waiting';

    const auto = window.location.href.indexOf('auto') >= 0;
    if (auto) {
      this.autoActivate();
    }

    const checkImmediately = window.location.href.indexOf('check') >= 0;
    if (checkImmediately) {
      this.checkForUpdate();
    }

    const timerUrlParamIsPresent = window.location.href.indexOf('timer') >= 0;
    this.timerActive = timerUrlParamIsPresent;
    if (this.timerActive) {
      this.timerId = window.setTimeout(() => this.getAppInfo());
    } else {
      this.status = 'timer deactivated via URL parameter';
    }
  }

  ngOnDestroy() {
    this.autoActivateSubscription?.unsubscribe();
  }

  getAppInfo() {
    this.status = 'working';
    this.httpClient
      .get(window.location.origin + '/non-existing-end-point')
      .toPromise()
      .catch((err) => {
        this.status =
          new Date().toLocaleTimeString() + ' failed! (will retry soon)';
        console.log('getAppInfo failed', err);
        if (this.timerActive) {
          this.timerId = window.setTimeout(() => this.getAppInfo(), 2000);
        }
      });
  }

  stopTimer() {
    this.timerActive = false;
    clearTimeout(this.timerId);
  }

  checkForUpdate() {
    this.swUpdate
      .checkForUpdate()
      .catch((e) => console.error('checkForUpdate failed', e));
  }

  autoActivate() {
    if (this.autoActivateSubscription) return;

    this.autoActivateSubscription = this.swUpdate.available
      .pipe(
        tap((event) => console.log('update available', event)),
        switchMap(() => this.activateUpdate())
      )
      .subscribe({
        next: () => window.location.reload(),
      });
  }

  activateUpdate() {
    return this.swUpdate
      .activateUpdate()
      .catch((e) => console.error('activateUpdate failed', e));
  }
}
