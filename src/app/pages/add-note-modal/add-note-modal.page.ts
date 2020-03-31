import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CaseActionService } from 'src/app/services/case-action.service';
import { CommonService } from 'src/app/services';

@Component({
  selector: 'app-add-note-modal',
  templateUrl: './add-note-modal.page.html',
  styleUrls: ['./add-note-modal.page.scss'],
})
export class AddNoteModalPage implements OnInit {
  @Input() caseId;
  note: string;
  constructor(
    private modalCtrl: ModalController,
    private caseActionService: CaseActionService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
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
        display_officer: 1
      };
      this.caseActionService.saveNoteData(data, this.caseId).subscribe((response: any) => {
        this.commonService.showToast(response.message, 'success');
        this.dismiss();
      });
    }
  }
}
