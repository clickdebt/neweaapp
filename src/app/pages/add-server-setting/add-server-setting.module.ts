import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AddServerSettingPageRoutingModule } from './add-server-setting-routing.module';
import { AddServerSettingPage } from './add-server-setting.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddServerSettingPageRoutingModule
  ],
  declarations: [AddServerSettingPage]
})
export class AddServerSettingPageModule { }