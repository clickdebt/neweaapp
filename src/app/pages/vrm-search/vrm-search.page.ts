import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../services/case.service';
import * as moment from 'moment';
import { Platform } from '@ionic/angular';
import { StorageService, CommonService } from 'src/app/services';
import { Router } from '@angular/router';
import { CaseActionService } from 'src/app/services/case-action.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-vrm-search',
  templateUrl: './vrm-search.page.html',
  styleUrls: ['./vrm-search.page.scss'],
})
export class VrmSearchPage implements OnInit {
  searchBarValue;
  cases = [];
  currentDate;
  isSearch = false;
  isMobile = false;
  hasSApermission = false;
  constructor(
    private caseService: CaseService,
    private platform: Platform,
    private router: Router,
    private storageService: StorageService,
    private caseActionService: CaseActionService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.isMobile = this.platform.is('mobile');
  }
  async ionViewWillEnter() {
    this.currentDate = moment().format('YYYY-MM-DD hh:mm:ss');
    this.checkPermissions();
  }
  async checkPermissions() {
    this.hasSApermission = await this.commonService.hasPermission(this.commonService.permissionSlug.SelfAllocate);
  }
  search() {
    if (this.searchBarValue && this.searchBarValue !== '') {
      const param = {
        vrm: this.searchBarValue
      };
      this.caseService.getCases(param).subscribe((response: any) => {
        this.isSearch = true;
        this.cases = response.data;
      });
    }
  }
  selfAllocate(currentCase) {
    this.caseActionService.selfCaseAllocate(currentCase.id).subscribe((response: any) => {
      this.commonService.showToast('Case Successfully allocated to you.');
    });
  }
  goToCaseDetails(currentCaseData) {
    localStorage.setItem('detais_case_data', JSON.stringify(currentCaseData));
    localStorage.setItem('from_vrm', '1');
    this.storageService.set('caseId', currentCaseData.id);
    this.router.navigate(['/home/case-details/' + currentCaseData.id]);
  }

}
