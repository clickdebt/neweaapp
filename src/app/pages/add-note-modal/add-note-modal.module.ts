import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddNoteModalPageRoutingModule } from './add-note-modal-routing.module';

import { AddNoteModalPage } from './add-note-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddNoteModalPageRoutingModule
  ],
  declarations: [AddNoteModalPage]
})
export class AddNoteModalPageModule {}
