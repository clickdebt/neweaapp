import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CaseActionService } from 'src/app/services/case-action.service';
import { CommonService } from 'src/app/services';
@Component({
  selector: 'app-upload-document-modal',
  templateUrl: './upload-document-modal.page.html',
  styleUrls: ['./upload-document-modal.page.scss'],
})
export class UploadDocumentModalPage implements OnInit {
  uploadForm: FormGroup;
  caseId = '';
  file;
  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private caseActionService: CaseActionService,
    private navParams: NavParams,
    private commonUtils: CommonService
  ) {
    this.caseId = navParams.get('caseId');
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.uploadForm = this.formBuilder.group({
      file: ['', [Validators.required]]
    });
  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      saved: false
    });
  }
  onFileInputChange(event) {
    this.file = event.target.files[0];
  }
  uploadDocument() {
    if (this.uploadForm.valid && this.file) {
      this.caseActionService.uploadDocument(this.file, this.caseId).subscribe((res: any) => {
        if (res.message) {
          this.commonUtils.showToast(res.message);
        }
      });
    }
  }
}
