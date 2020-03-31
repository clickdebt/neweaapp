import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OnHoldModalPage } from './on-hold-modal.page';

const routes: Routes = [
  {
    path: '',
    component: OnHoldModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnHoldModalPageRoutingModule {}
