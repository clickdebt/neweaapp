import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DvlaPage } from './dvla.page';

const routes: Routes = [
  {
    path: '',
    component: DvlaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DvlaPageRoutingModule {}
