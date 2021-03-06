import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArrangementModalPageRoutingModule } from './arrangement-modal-routing.module';

import { ArrangementModalPage } from './arrangement-modal.page';
import { UpdateArrangementModalPageModule } from '../update-arrangement-modal/update-arrangement-modal.module';
import { CalendarModule } from 'ion2-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ArrangementModalPageRoutingModule,
    UpdateArrangementModalPageModule,
    CalendarModule
  ],
  declarations: [ArrangementModalPage],
  exports: [ArrangementModalPage],
  entryComponents: [ArrangementModalPage],
})
export class ArrangementModalPageModule { }
