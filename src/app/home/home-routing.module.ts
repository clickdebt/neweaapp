import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { HomeGuard } from '../guards/home.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    canActivate: [HomeGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('../pages/folder/folder.module').then( m => m.FolderPageModule)
      },
      {
        path: 'folder',
        loadChildren: () => import('../pages/folder/folder.module').then( m => m.FolderPageModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: 'job-list',
        loadChildren: () => import('../pages/job-list/job-list.module').then( m => m.JobListPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
