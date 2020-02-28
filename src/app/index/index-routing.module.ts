import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexPage } from './index.page';
import { IndexGuard } from '../guards/index.guard'
const routes: Routes = [
  {
    path: '',
    component: IndexPage,
    canActivate: [IndexGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('../pages/login/login.module').then( m => m.LoginPageModule)
      },
      {
        path: 'login',
        loadChildren: () => import('../pages/login/login.module').then( m => m.LoginPageModule)
      },
      {
        path: 'server-settings',
        loadChildren: () => import('../pages/server-settings/server-settings.module').then( m => m.ServerSettingsPageModule)
      },
      {
        path: 'add-server-setting',
        loadChildren: () => import('../pages/add-server-setting/add-server-setting.module').then( m => m.AddServerSettingPageModule)
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndexPageRoutingModule {}
