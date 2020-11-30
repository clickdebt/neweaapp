import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CaseActionService } from 'src/app/services/case-action.service';
import { CommonService, StorageService } from 'src/app/services';
import { NetworkService } from 'src/app/services/network.service';
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
    private commonUtils: CommonService,
    private storageService: StorageService,
    private networkService: NetworkService
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
    console.log(this.file);

  }
  uploadDocument() {
    if (this.uploadForm.valid && this.file) {
      if (this.networkService.getCurrentNetworkStatus() == 1) {
        this.storageService.set('is_case_updated', true);
        this.caseActionService.uploadDocument(this.file, this.caseId).subscribe((res: any) => {
          if (res.message) {
            this.commonUtils.showToast(res.message);
            this.modalCtrl.dismiss({
              saved: true
            });
          }
        });
      } else {
        const formData = new FormData();
        formData.append('file', this.file);
        this.caseActionService.saveActionOffline(
          `b/clickdebt_ajax_layout/legacy/panels/upload_case_documents/${this.caseId}?source=API`,
          'post',
          formData
        );
        this.modalCtrl.dismiss({
          saved: true
        });
      }



    }
  }
}
