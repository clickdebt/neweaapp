import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobListPageRoutingModule } from './job-list-routing.module';

import { JobListPage } from './job-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobListPageRoutingModule
  ],
  declarations: [JobListPage]
})
export class JobListPageModule {}
