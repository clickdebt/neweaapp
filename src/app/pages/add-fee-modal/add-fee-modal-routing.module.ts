import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddFeeModalPage } from './add-fee-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddFeeModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddFeeModalPageRoutingModule {}
