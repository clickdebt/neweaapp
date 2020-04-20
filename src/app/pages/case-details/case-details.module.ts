import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaseDetailsPageRoutingModule } from './case-details-routing.module';

import { CaseDetailsPage } from './case-details.page';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { AddNoteModalPageModule } from '../add-note-modal/add-note-modal.module';
import { OnHoldModalPageModule } from '../on-hold-modal/on-hold-modal.module';
import { AddFeeModalPageModule } from '../add-fee-modal/add-fee-modal.module';
import { UploadDocumentModalPageModule } from '../upload-document-modal/upload-document-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CaseDetailsPageRoutingModule,
    AddNoteModalPageModule,
    OnHoldModalPageModule,
    AddFeeModalPageModule,
    UploadDocumentModalPageModule
  ],
  declarations: [CaseDetailsPage, HighlightPipe]
})
export class CaseDetailsPageModule { }
