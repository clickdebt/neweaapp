import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { DatabaseService } from '../services';
import { PanicModalPageModule } from '../pages/panic-modal/panic-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    PanicModalPageModule
  ],
  declarations: [HomePage],
  providers: [DatabaseService]
})
export class HomePageModule { }
