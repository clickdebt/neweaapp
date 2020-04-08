import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdateArrangementModalPage } from './update-arrangement-modal.page';

const routes: Routes = [
  {
    path: '',
    component: UpdateArrangementModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdateArrangementModalPageRoutingModule {}
