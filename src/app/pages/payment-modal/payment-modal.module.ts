import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentModalPageRoutingModule } from './payment-modal-routing.module';

import { PaymentModalPage } from './payment-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PaymentModalPageRoutingModule
  ],
  declarations: [PaymentModalPage],
  exports: [PaymentModalPage],
  entryComponents: [PaymentModalPage]
})
export class PaymentModalPageModule { }
