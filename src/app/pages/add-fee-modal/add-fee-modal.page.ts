import { Component, OnInit, Input } from '@angular/core';
import { CaseActionService } from 'src/app/services/case-action.service';
import { NavParams, ModalController, AlertController } from '@ionic/angular';
import { CommonService, DatabaseService, StorageService } from 'src/app/services';
import * as moment from 'moment';

@Component({
  selector: 'app-add-fee-modal',
  templateUrl: './add-fee-modal.page.html',
  styleUrls: ['./add-fee-modal.page.scss'],
})
export class AddFeeModalPage implements OnInit {
  @Input() caseId;
  @Input() currentCase;
  feeOptions: any[];
  selectedFeeOption = '';
  feeActions: any[];
  constructor(
    private caseActionService: CaseActionService,
    private modalCtrl: ModalController,
    private storageService: StorageService,
    private databaseService: DatabaseService,
    private alertCtrl: AlertController,
    private commonService: CommonService) {
  }

  ngOnInit() {
    this.getFeeOptions();
    this.getFeeActions();
  }
  async getFeeOptions() {
    this.feeOptions = await this.storageService.get('fee_options');
    this.feeOptions = this.feeOptions.filter((item: any) => {
      return (item.sm_id == this.currentCase.scheme_manager_id) && item.fee['id'] > 0;
    }).map((item: any)=>{
        return item.fee
    });
    // this.caseActionService.getFeeOptions(this.caseId).subscribe((response: any) => {
    //   this.feeOptions = response.data.data;
    // });
  }
  async onSelectChange(event) {
    if (this.selectedFeeOption) {
      var selectedFee = this.feeOptions.filter((item: any) => {
        return item.id == this.selectedFeeOption;
      });
      var feeData = {
        fee_id: selectedFee[0].id,
        amount: selectedFee[0].amount
      };
      if(selectedFee[0].feetype == "manual_financial_fee_prototype"){
        const alert = await this.alertCtrl.create({
          header: 'Manual Fee Selected',
          message: 'Please enter the amount as you have selected Manual Fee',
          inputs: [
            {
              name: 'amount',
              type: 'number',
            }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                this.dismiss();
              }
            },
            {
              text: 'Sumbit',
              handler: (data) => {
                feeData.amount = data.amount;
                this.sumbitAction(this.caseId,feeData);
              }
            }
          ]
        });
        await alert.present();

      } else {
        this.sumbitAction(this.caseId,feeData);
      }
      // this.caseActionService.addFee(feeData, this.caseId).subscribe((response: any) => {
      //   this.getFeeActions();
      //   this.commonService.showToast(response.data.message, 'success');
      //   if (response.data.data.length) {
      //     this.feeOptions = response.data.data;
      //   }
      // });
    }
  }
  sumbitAction(caseId,feeData){
    const api_data = [
      { name: 'case_id', value: `${caseId}` },
      { name: 'url', value: `b/clickdebt_panel_layout/financial/case_actions_panels/case_action_add_fee/${caseId}?source=API`, },
      { name: 'type', value: `post` },
      { name: 'data', value: `${encodeURI(JSON.stringify(feeData))}` },
      { name: 'is_sync', value: 0 },
      { name: 'created_at', value: `${moment().format('YYYY-MM-DD hh:mm:ss')}` },
    ]
    this.caseActionService.saveActionOffline('api_calls', api_data);
    this.storageService.set('is_case_updated', true);
    this.dismiss();
  }
  async getFeeActions() {
    // let query = 'select * from fees where caseid = ?';
    // let p = [this.caseId];
    // const result = await this.databaseService.executeQuery(query, p);
    // this.feeActions = await this.databaseService.extractResult(result);
    
    this.caseActionService.getFeeActions(this.caseId).subscribe((response: any) => {
      console.log(response.data.data);
      this.feeActions = response.data.data;
    });
  }
  async dismiss() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }
  delete(feeActionId) {
    const api_data = [
      { name: 'case_id', value: `${this.caseId}` },
      { name: 'url', value: `b/clickdebt_panel_layout/financial/case_actions_panels/case_action_remove_fee/${feeActionId.cf_id}/${this.caseId}?source=API`, },
      { name: 'type', value: `post` },
      { name: 'data', value: `` },
      { name: 'is_sync', value: 0 },
      { name: 'created_at', value: `${moment().format('YYYY-MM-DD hh:mm:ss')}` },
    ]
    this.caseActionService.saveActionOffline('api_calls', api_data);

    // this.caseActionService.deleteFeeAction(feeActionId, this.caseId).subscribe((response: any) => {
    //   this.getFeeActions();
    //   this.commonService.showToast(response.data.message);
    // });
  }
}
