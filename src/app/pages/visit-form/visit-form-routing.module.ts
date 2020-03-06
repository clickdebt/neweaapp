import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitFormPage } from './visit-form.page';

const routes: Routes = [
  {
    path: '',
    component: VisitFormPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitFormPageRoutingModule {}
