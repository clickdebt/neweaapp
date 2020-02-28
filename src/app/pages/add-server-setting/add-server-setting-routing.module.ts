import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddServerSettingPage } from './add-server-setting.page';

const routes: Routes = [
  {
    path: '',
    component: AddServerSettingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddServerSettingPageRoutingModule {}
