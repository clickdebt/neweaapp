import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TakePaymentPage } from './take-payment.page';

const routes: Routes = [
  {
    path: '',
    component: TakePaymentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TakePaymentPageRoutingModule {}
