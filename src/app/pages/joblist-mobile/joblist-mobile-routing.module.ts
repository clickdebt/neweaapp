import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoblistMobilePage } from './joblist-mobile.page';

const routes: Routes = [
  {
    path: '',
    component: JoblistMobilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JoblistMobilePageRoutingModule {}
