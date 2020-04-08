import { Component, OnInit } from '@angular/core';
import { CaseService } from '../../services/case.service';
import * as moment from 'moment';
import { Platform } from '@ionic/angular';
import { StorageService } from 'src/app/services';
import { Router } from '@angular/router';

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

  constructor(
    private caseService: CaseService,
    private platform: Platform,
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.isMobile = this.platform.is('mobile');
  }
  async ionViewWillEnter() {
    this.currentDate = moment().format('YYYY-MM-DD hh:mm:ss');
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
    console.log(currentCase);
  }
  goToCaseDetails(currentCaseData) {
    localStorage.setItem('detais_case_data', JSON.stringify(currentCaseData));
    this.storageService.set('caseId', currentCaseData.id);
    this.router.navigate(['/home/case-details/' + currentCaseData.id]);
  }

}
