import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { SettingsService, AuthService, CommonService, CaseService, VisitService, HttpInterceptorService } from './services';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormioModule } from 'angular-formio';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: 'field_agent_v2',
      driverOrder: ['sqlite', 'websql', 'indexeddb']
    }),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    FormioModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SettingsService,
    AuthService,
    CommonService,
    CaseService,
    VisitService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLitePorter,
    SQLite
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
