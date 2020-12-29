import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
// import { DatabaseService } from '../services';
import { PanicModalPageModule } from '../pages/panic-modal/panic-modal.module';
import { TimerPageModule } from '../pages/timer/timer.module';
import { VisitFormPageModule } from '../pages/visit-form/visit-form.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    PanicModalPageModule,
    VisitFormPageModule,
    TimerPageModule
  ],
  declarations: [HomePage],
  providers: []
})
export class HomePageModule { }
