import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitDetailsPageRoutingModule } from './visit-details-routing.module';

import { VisitDetailsPage } from './visit-details.page';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { TimerPageModule } from '../timer/timer.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitDetailsPageRoutingModule,
    RoundProgressModule,
    TimerPageModule
  ],
  declarations: [VisitDetailsPage],
  exports: [VisitDetailsPage],
  entryComponents: [VisitDetailsPage],
})
export class VisitDetailsModule { }
