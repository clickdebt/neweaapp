import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Chooser } from '@ionic-native/chooser/ngx';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-upload-document-modal',
  templateUrl: './upload-document-modal.page.html',
  styleUrls: ['./upload-document-modal.page.scss'],
})
export class UploadDocumentModalPage implements OnInit {
  uploadForm: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private chooser: Chooser
  ) { }

  ngOnInit() {
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      saved: false
    });
  }

  pickFile() {
    this.chooser.getFile()
      .then((file) => {
        console.log(file);
      })
      .catch((error: any) => console.error(error));
  }
}
