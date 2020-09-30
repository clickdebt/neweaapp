import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitDetailsPage } from './visit-details.page';

const routes: Routes = [
  {
    path: '',
    component: VisitDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitDetailsPageRoutingModule {}
