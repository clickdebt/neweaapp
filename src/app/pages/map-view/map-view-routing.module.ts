import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapViewPage } from './map-view.page';

const routes: Routes = [
  {
    path: '',
    component: MapViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapViewPageRoutingModule {}
