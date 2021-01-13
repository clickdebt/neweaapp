import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VisitFormPageRoutingModule } from './visit-form-routing.module';
import { VisitFormPage } from './visit-form.page';
import { FormioModule } from 'angular-formio';
import { PaymentModalPageModule } from '../payment-modal/payment-modal.module';
import { AddNoteModalPageModule } from '../add-note-modal/add-note-modal.module';
import { AddFeeModalPageModule } from '../add-fee-modal/add-fee-modal.module';
import { OnHoldModalPageModule } from '../on-hold-modal/on-hold-modal.module';
import { UploadDocumentModalPageModule } from '../upload-document-modal/upload-document-modal.module';
import { CaseDetailsPageModule } from '../case-details/case-details.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitFormPageRoutingModule,
    FormioModule,
    PaymentModalPageModule,
    AddNoteModalPageModule,
    OnHoldModalPageModule,
    AddFeeModalPageModule,
    UploadDocumentModalPageModule,
    CaseDetailsPageModule
  ],
  declarations: [VisitFormPage]
})
export class VisitFormPageModule {}
