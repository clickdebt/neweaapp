import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeeCalculatorPageRoutingModule } from './fee-calculator-routing.module';

import { FeeCalculatorPage } from './fee-calculator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeeCalculatorPageRoutingModule
  ],
  declarations: [FeeCalculatorPage],
  exports: [FeeCalculatorPage],
  entryComponents: [FeeCalculatorPage],
})
export class FeeCalculatorPageModule {}
