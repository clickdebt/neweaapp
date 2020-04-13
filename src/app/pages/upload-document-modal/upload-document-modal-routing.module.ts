import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UploadDocumentModalPage } from './upload-document-modal.page';

const routes: Routes = [
  {
    path: '',
    component: UploadDocumentModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadDocumentModalPageRoutingModule {}
