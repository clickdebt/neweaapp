import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-panic-modal',
  templateUrl: './panic-modal.page.html',
  styleUrls: ['./panic-modal.page.scss'],
})
export class PanicModalPage implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      saved: false
    });
  }
}
