import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobListPage } from './job-list.page';

const routes: Routes = [
  {
    path: '',
    component: JobListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobListPageRoutingModule {}
