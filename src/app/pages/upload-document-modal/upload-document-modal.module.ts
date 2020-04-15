import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadDocumentModalPageRoutingModule } from './upload-document-modal-routing.module';

import { UploadDocumentModalPage } from './upload-document-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    UploadDocumentModalPageRoutingModule
  ],
  declarations: [UploadDocumentModalPage]
})
export class UploadDocumentModalPageModule { }
