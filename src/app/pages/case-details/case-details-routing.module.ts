import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaseDetailsPage } from './case-details.page';

const routes: Routes = [
  {
    path: '',
    component: CaseDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseDetailsPageRoutingModule {}
