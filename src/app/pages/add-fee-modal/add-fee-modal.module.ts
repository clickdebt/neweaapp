import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddFeeModalPageRoutingModule } from './add-fee-modal-routing.module';

import { AddFeeModalPage } from './add-fee-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddFeeModalPageRoutingModule
  ],
  declarations: [AddFeeModalPage]
})
export class AddFeeModalPageModule {}
