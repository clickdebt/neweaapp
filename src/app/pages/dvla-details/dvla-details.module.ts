import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DvlaDetailsPageRoutingModule } from './dvla-details-routing.module';

import { DvlaDetailsPage } from './dvla-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DvlaDetailsPageRoutingModule
  ],
  declarations: [DvlaDetailsPage]
})
export class DvlaDetailsPageModule {}
