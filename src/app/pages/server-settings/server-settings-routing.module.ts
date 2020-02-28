import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServerSettingsPage } from './server-settings.page';

const routes: Routes = [
  {
    path: '',
    component: ServerSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServerSettingsPageRoutingModule {}
