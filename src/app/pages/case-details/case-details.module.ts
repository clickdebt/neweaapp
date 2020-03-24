import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseDetailsPageRoutingModule } from './case-details-routing.module';

import { CaseDetailsPage } from './case-details.page';
import { HighlightPipe } from '../../pipes/highlight.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseDetailsPageRoutingModule
  ],
  declarations: [CaseDetailsPage, HighlightPipe]
})
export class CaseDetailsPageModule { }
