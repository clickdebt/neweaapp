import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewPaymentsPage } from './view-payments.page';

const routes: Routes = [
  {
    path: '',
    component: ViewPaymentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewPaymentsPageRoutingModule {}
