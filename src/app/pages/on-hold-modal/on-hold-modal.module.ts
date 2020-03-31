import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OnHoldModalPageRoutingModule } from './on-hold-modal-routing.module';

import { OnHoldModalPage } from './on-hold-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OnHoldModalPageRoutingModule
  ],
  declarations: [OnHoldModalPage]
})
export class OnHoldModalPageModule {}
