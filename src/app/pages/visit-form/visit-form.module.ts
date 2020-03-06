import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VisitFormPageRoutingModule } from './visit-form-routing.module';
import { VisitFormPage } from './visit-form.page';
import { FormioModule } from 'angular-formio';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitFormPageRoutingModule,
    FormioModule
  ],
  declarations: [VisitFormPage]
})
export class VisitFormPageModule {}
