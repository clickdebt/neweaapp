import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseDetailsPageRoutingModule } from './case-details-routing.module';

import { CaseDetailsPage } from './case-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseDetailsPageRoutingModule
  ],
  declarations: [CaseDetailsPage]
})
export class CaseDetailsPageModule {}
