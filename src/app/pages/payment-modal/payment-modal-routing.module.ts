import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaymentModalPage } from './payment-modal.page';

const routes: Routes = [
  {
    path: '',
    component: PaymentModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaymentModalPageRoutingModule {}
