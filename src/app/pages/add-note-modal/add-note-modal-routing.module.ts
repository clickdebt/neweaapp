import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddNoteModalPage } from './add-note-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AddNoteModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddNoteModalPageRoutingModule {}
