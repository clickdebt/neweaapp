import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VrmSearchPageRoutingModule } from './vrm-search-routing.module';

import { VrmSearchPage } from './vrm-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VrmSearchPageRoutingModule
  ],
  declarations: [VrmSearchPage]
})
export class VrmSearchPageModule {}
