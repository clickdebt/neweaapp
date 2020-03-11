import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitReportsPage } from './visit-reports.page';

const routes: Routes = [
  {
    path: '',
    component: VisitReportsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitReportsPageRoutingModule {}
