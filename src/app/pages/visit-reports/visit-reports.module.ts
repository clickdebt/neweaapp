import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitReportsPageRoutingModule } from './visit-reports-routing.module';

import { VisitReportsPage } from './visit-reports.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitReportsPageRoutingModule
  ],
  declarations: [VisitReportsPage]
})
export class VisitReportsPageModule {}
