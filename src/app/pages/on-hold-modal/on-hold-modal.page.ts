import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-on-hold-modal',
  templateUrl: './on-hold-modal.page.html',
  styleUrls: ['./on-hold-modal.page.scss'],
})
export class OnHoldModalPage implements OnInit {
  @Input() caseId;
  formData = {
    date: new Date().toISOString()
  };
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }
  onDaysChange(event) {
    this.formData.date = new Date(new Date().getTime() + (event.detail.value * 24 * 60 * 60 * 1000)).toISOString();
  }
  save() {

  }
  cancel() {
    this.dismiss();
  }
  async dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }
}
