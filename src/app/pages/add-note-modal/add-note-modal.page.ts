import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CaseActionService } from 'src/app/services/case-action.service';
import * as moment from 'moment';
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
    private caseActionService: CaseActionService  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (this.currentCase.linked_cases.length > 0) {
      // Select all linked cases
      this.linkCases = this.currentCase.linked_cases.map(({ id }) => id);
    }
  }
  onLinkCaseSelectChange() {
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

      const api_data = [
        { name: 'case_id', value: `${this.caseId}` },
        { name: 'url', value: `b/clickdebt_panel_layout/history/panels/add_case_note/${this.caseId}?source=API`, },
        { name: 'type', value: `post` },
        { name: 'data', value: `${encodeURI(JSON.stringify(data)).replace(/'/g, "%27")}` },
        { name: 'is_sync', value: 0 },
        { name: 'created_at', value: `${moment().format('YYYY-MM-DD hh:mm:ss')}` },
      ]
      this.caseActionService.saveActionOffline('api_calls', api_data);
      this.dismiss();
    }
  }
}
