import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthorizeCardPageRoutingModule } from './authorize-card-routing.module';

import { AuthorizeCardPage } from './authorize-card.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AuthorizeCardPageRoutingModule
  ],
  declarations: [AuthorizeCardPage],
  exports: [AuthorizeCardPage],
  entryComponents: [AuthorizeCardPage]
})
export class AuthorizeCardPageModule {}
