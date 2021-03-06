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
        loadChildren: () => import('../pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'job-list',
        loadChildren: () => import('../pages/job-list/job-list.module').then(m => m.JobListPageModule)
      },
      {
        path: 'joblist-mobile',
        loadChildren: () => import('../pages/joblist-mobile/joblist-mobile.module').then(m => m.JoblistMobilePageModule)
      },
      {
        path: 'visit-form/:id',
        loadChildren: () => import('../pages/visit-form/visit-form.module').then(m => m.VisitFormPageModule)
      },
      {
        path: 'visit-reports',
        loadChildren: () => import('../pages/visit-reports/visit-reports.module').then(m => m.VisitReportsPageModule)
      } ,
      {
        path: 'case-details/:id',
        loadChildren: () => import('../pages/case-details/case-details.module').then(m => m.CaseDetailsPageModule)
      },
      {
        path: 'map-view',
        loadChildren: () => import('../pages/map-view/map-view.module').then(m => m.MapViewPageModule)
      },
      {
        path: 'vrm-search',
        loadChildren: () => import('../pages/vrm-search/vrm-search.module').then(m => m.VrmSearchPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule { }
