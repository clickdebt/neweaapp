import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CaseActionService } from 'src/app/services/case-action.service';
import { CommonService, StorageService } from 'src/app/services';

@Component({
  selector: 'app-add-note-modal',
  templateUrl: './add-note-modal.page.html',
  styleUrls: ['./add-note-modal.page.scss'],
})
export class AddNoteModalPage implements OnInit {
  @Input() caseId;
  @Input() currentCase: any;
  linkCases;
  selectedLinkCaseIds;
  note: string;
  constructor(
    private modalCtrl: ModalController,
    private caseActionService: CaseActionService,
    private commonService: CommonService,
    private storageService: StorageService
  ) { }

  ngOnInit() {
  }


  ionViewWillEnter() {
    if (this.currentCase.linked_cases.length > 0) {
      // Select all linked cases
      this.linkCases = this.currentCase.linked_cases.map(({ id }) => id);
    }
  }
  onLinkCaseSelectChange(event) {
    console.log(this.linkCases, this.selectedLinkCaseIds);
  }

  async dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }
  cancel() {
    this.dismiss();
  }
  save() {
    if (this.note) {
      const data = {
        note: this.note,
        display_client: 1,
        display_officer: 1,
        case_ids: this.selectedLinkCaseIds
      };
      this.storageService.set('is_case_updated', true);
      this.caseActionService.saveNoteData(data, this.caseId).subscribe((response: any) => {
        this.commonService.showToast(response.message, 'success');
        this.dismiss();
      });
    }
  }
}
