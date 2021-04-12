import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewPaymentsPageRoutingModule } from './view-payments-routing.module';

import { ViewPaymentsPage } from './view-payments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewPaymentsPageRoutingModule
  ],
  declarations: [ViewPaymentsPage]
})
export class ViewPaymentsPageModule {}
