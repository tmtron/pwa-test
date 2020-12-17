import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'pwa-update-test-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private timerId?: number;
  status = 'uninit';

  constructor(private readonly httpClient: HttpClient) {
  }

  ngOnInit() {
    this.status = 'waiting';
    this.timerId = window.setTimeout(() => this.getAppInfo());
  }

  getAppInfo() {
    this.status = 'working';
    this.httpClient
      .get('www.non-existing.com/end-point')
      .toPromise()
      .then((_) => (this.status = 'ok'))
      .catch((err) => {
        this.status =
          new Date().toLocaleTimeString() + ' failed! (will retry soon)';
        console.log('getAppInfo failed', err);
        this.timerId = window.setTimeout(() => this.getAppInfo(), 2000);
      });
  }
}
