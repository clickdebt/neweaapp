import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthorizeCardPage } from './authorize-card.page';

const routes: Routes = [
  {
    path: '',
    component: AuthorizeCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthorizeCardPageRoutingModule {}
