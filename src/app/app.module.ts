import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { GoogleMaps } from '@ionic-native/google-maps/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { SettingsService, AuthService, CommonService, CaseService, VisitService, HttpInterceptorService } from './services';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormioModule } from 'angular-formio';
import { PaymentModalPageModule } from './pages/payment-modal/payment-modal.module';
import { ArrangementModalPageModule } from './pages/arrangement-modal/arrangement-modal.module';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { Network } from '@ionic-native/network/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { TakePaymentPageModule } from './pages/take-payment/take-payment.module';
import { AuthorizeCardPageModule } from './pages/authorize-card/authorize-card.module';

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
    FormioModule,
    PaymentModalPageModule,
    TakePaymentPageModule,
    AuthorizeCardPageModule,
    ArrangementModalPageModule,

  ],
  providers: [
    StatusBar,
    NavigationBar,
    SplashScreen,
    SettingsService,
    AuthService,
    CommonService,
    CaseService,
    VisitService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLitePorter,
    SQLite,
    GoogleMaps,
    Geolocation,
    NativeGeocoder,
    LaunchNavigator,
    Network,
    NativeAudio,
    BackgroundMode,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
