import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DvlaPageRoutingModule } from './dvla-routing.module';

import { DvlaPage } from './dvla.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DvlaPageRoutingModule
  ],
  declarations: [DvlaPage]
})
export class DvlaPageModule {}
