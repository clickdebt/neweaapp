import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VrmSearchPage } from './vrm-search.page';

const routes: Routes = [
  {
    path: '',
    component: VrmSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VrmSearchPageRoutingModule {}
