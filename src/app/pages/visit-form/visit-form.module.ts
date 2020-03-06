import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VisitFormPageRoutingModule } from './visit-form-routing.module';
import { VisitFormPage } from './visit-form.page';
import { FormioModule } from 'angular-formio';
import { PaymentModalPageModule } from '../payment-modal/payment-modal.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitFormPageRoutingModule,
    FormioModule,
    PaymentModalPageModule
  ],
  declarations: [VisitFormPage]
})
export class VisitFormPageModule {}
