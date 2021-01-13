import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FeeCalculatorPage } from './fee-calculator.page';

const routes: Routes = [
  {
    path: '',
    component: FeeCalculatorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeeCalculatorPageRoutingModule {}
