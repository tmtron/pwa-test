# PwaUpdateTest

see related:
* [SO question: How to update an old PWA that is constantly polling?](https://stackoverflow.com/questions/65340710/how-to-update-an-old-pwa-that-is-constantly-polling)
* [Angular ServiceWorker #40207](https://github.com/angular/angular/issues/40207)

## Init
* npm install
* npm run build:prod
* npm run serve
* Open the app: http://127.0.0.1:8080/

Notes:
* we use: `registrationStrategy: 'registerImmediately'`

## Update App (no timer) - works
This works as expected.

Initial state:
* We have already started the app once and the browser has version 1 of the PWA.
* Close the browser tabs (that show our app)

Now we build and serve a new app version:
* Change the application: in AppComponent, update the version property to `2`.
* Build: `npm run build:prod`
* Restart the http server (to make sure that it does not serve
  old cached content): `npm run serve`

Open the app: http://127.0.0.1:8080/
* the browser will sever the previous app-version `1`
* since this is a navigation request the browser will check for updates
* now watch the terminal of the http-server - after some seconds it will show 
  that the browser requests the new application version 
  ```
  [2020-12-17T10:58:37.316Z]  "GET /ngsw.json?ngsw-cache-bust=0.33340559290865834" ...
  [2020-12-17T10:58:37.380Z]  "GET /index.html" ...
  [2020-12-17T10:58:37.390Z]  "GET /main.4272f7787741a944a504.js" ...
  [2020-12-17T10:58:37.531Z]  "GET /ngsw.json?ngsw-cache-bust=0.45014398825618906" ...
  ```
* when we now refresh the tab (press F5), the new app version `2` will be activated

## Update App (timer) - FAILS
Now we build a new version of the app, but activate the timer.


Initial state:
* We have started the app before and the browser has version 2 of the PWA.
* Close the browser tabs (that show our app)

Now we build and serve a new app version:
* Change the application: in AppComponent, update the version property to `3`.
* Build: `npm run build:prod`
* Restart the http server (to make sure that it does not serve
  old cached content): `npm run serve`

Open the app: http://127.0.0.1:8080?timer
* Note: the `timer` parameter!
* the browser will sever the previous app-version `2` (as expected)
* since this is a navigation request the browser will check for updates
* now watch the terminal of the http-server - after some seconds it will show
  that the browser requests a new version of the `ngsw-worker.js`
  ```
  [2020-12-17T11:03:23.948Z]  "GET /ngsw-worker.js" ...
  ```
* but it does not get the new application version 
* when we now refresh the tab (press F5), the OLD app version `2` will still be activated!
* closing the browser window and opening again (with the timer enabled) will not help
  * **we still see the OLD version `2` - refresh won't work**
* workaround to update the local version is to press CTRL+F5: now we are on version 3
  * but this is of course not a solution, because ordinary users don't know this 

### NGSW state
http://127.0.0.1:8080/ngsw/state 

```
NGSW Debug Info:

Driver state: NORMAL ((nominal))
Latest manifest hash: b5a9f50d4efae604dbc6706040c71ecb2029c1cf
Last update check: never

=== Version b5a9f50d4efae604dbc6706040c71ecb2029c1cf ===

Clients: 4cad0ef1-179e-4629-b20f-602c4a4be1f9, 4d82d618-8fac-4e79-938c-605266702fa1, e0813c6a-3b76-4aeb-a14a-9043f0417b24, 9bf1be36-e911-4612-8158-21819eb222dc, 09337bd0-d060-46a1-b9e9-56257b879bdd, 0ce1327b-05bb-44e1-bba7-f3769cbad9b2, c9b796dd-b20c-417b-a504-7f065fd841db

=== Idle Task Queue ===
Last update tick: 1s996u
Last update run: never
Task queue:
 * init post-load (update, cleanup)
 * initialization(b5a9f50d4efae604dbc6706040c71ecb2029c1cf)
 * check-updates-on-navigation

Debug log:
```

* I am not sure why there are so many `Clients` - the app is only opened in one tab and the
`ngsw/state` tab is open
  * whenever you press refresh on the http://127.0.0.1:8080/ngsw/state URL a new client will show up and not go away
* It seems tha the task queue never changes

Test URLs:
* http://127.0.0.1:8080/
* http://127.0.0.1:8080/ngsw/state
* http://127.0.0.1:8080/?timer



