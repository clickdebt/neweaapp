import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateArrangementModalPageRoutingModule } from './update-arrangement-modal-routing.module';

import { UpdateArrangementModalPage } from './update-arrangement-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    UpdateArrangementModalPageRoutingModule
  ],
  declarations: [UpdateArrangementModalPage]
})
export class UpdateArrangementModalPageModule { }
