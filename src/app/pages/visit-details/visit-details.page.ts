import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CaseService, CommonService } from 'src/app/services';
@Component({
  selector: 'app-visit-details',
  templateUrl: './visit-details.page.html',
  styleUrls: ['./visit-details.page.scss'],
})
export class VisitDetailsPage implements OnInit {
  visitData;
  visitId;
  constructor(
    private modalCtrl: ModalController,
    private commonService: CommonService,
    private navParams: NavParams,
    private caseservice: CaseService,
  ) {
    this.visitId = navParams.get('visitId');
    this.visitData = navParams.get('visitData');
    console.log(this.visitData, this.visitId);
  }

  async ngOnInit() {

  }
  ionViewWillEnter() {
    if (!this.visitData && this.visitId) {
      this.caseservice.getVisitReports({ id: this.visitId }).subscribe((res: any) => {
        console.log(res);
        if (res.data) {
          let data = res.data[0];
          data.data = JSON.parse(data.form_values);
          console.log(data);
          this.visitData = data;
          this.visitData.data.created_at = res.data[0].created_at;
          this.visitData.data.case_id = res.data[0].case_id;
        }
      });
    } else {
      this.visitData.data.created_at = this.visitData.created_at;
      this.visitData.data.case_id = this.visitData.case_id;
    }
  }

  camelToNormaltext(text) {
    const result = text.replace(/([A-Z])/g, ' $1');
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult;
  }
  async dismiss() {
    this.modalCtrl.dismiss();
  }

}
