import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'pwa-update-test-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private timerId?: number;
  status = 'uninit';

  version = 1;

  timerActive = true;

  constructor(private readonly httpClient: HttpClient) {}

  ngOnInit() {
    this.status = 'waiting';
    const timerUrlParamIsPresent = window.location.href.indexOf('timer') >= 0;
    this.timerActive = timerUrlParamIsPresent
    if (this.timerActive) {
      this.timerId = window.setTimeout(() => this.getAppInfo());
    } else {
      this.status = 'timer deactivated via URL parameter';
    }
  }

  getAppInfo() {
    this.status = 'working';
    this.httpClient
      .get(window.location.origin+'/non-existing-end-point')
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
}
