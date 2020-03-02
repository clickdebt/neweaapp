import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JoblistMobilePageRoutingModule } from './joblist-mobile-routing.module';

import { JoblistMobilePage } from './joblist-mobile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JoblistMobilePageRoutingModule
  ],
  declarations: [JoblistMobilePage]
})
export class JoblistMobilePageModule {}
