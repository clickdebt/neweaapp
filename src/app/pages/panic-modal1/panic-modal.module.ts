import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PanicModalPageRoutingModule } from './panic-modal-routing.module';

import { PanicModalPage } from './panic-modal.page';
import {RoundProgressModule} from 'angular-svg-round-progressbar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PanicModalPageRoutingModule,
    RoundProgressModule
  ],
  declarations: [PanicModalPage],
  exports: [PanicModalPage]
})
export class PanicModalPageModule { }
