import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OnHoldModalPageRoutingModule } from './on-hold-modal-routing.module';

import { OnHoldModalPage } from './on-hold-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OnHoldModalPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [OnHoldModalPage]
})
export class OnHoldModalPageModule { }
