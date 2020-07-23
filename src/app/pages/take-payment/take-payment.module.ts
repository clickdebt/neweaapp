import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TakePaymentPageRoutingModule } from './take-payment-routing.module';

import { TakePaymentPage } from './take-payment.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TakePaymentPageRoutingModule
  ],
  declarations: [TakePaymentPage],
  exports: [TakePaymentPage],
  entryComponents: [TakePaymentPage]
})
export class TakePaymentPageModule {}
