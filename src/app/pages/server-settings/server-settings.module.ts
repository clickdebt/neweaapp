import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServerSettingsPageRoutingModule } from './server-settings-routing.module';

import { ServerSettingsPage } from './server-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServerSettingsPageRoutingModule
  ],
  declarations: [ServerSettingsPage]
})
export class ServerSettingsPageModule {}
