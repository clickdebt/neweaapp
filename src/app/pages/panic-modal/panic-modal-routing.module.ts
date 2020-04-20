import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PanicModalPage } from './panic-modal.page';

const routes: Routes = [
  {
    path: '',
    component: PanicModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanicModalPageRoutingModule {}
