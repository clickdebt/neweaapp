import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArrangementModalPageRoutingModule } from './arrangement-modal-routing.module';

import { ArrangementModalPage } from './arrangement-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArrangementModalPageRoutingModule
  ],
  declarations: [ArrangementModalPage],
  exports: [ArrangementModalPage],
  entryComponents: [ArrangementModalPage],
})
export class ArrangementModalPageModule {}
