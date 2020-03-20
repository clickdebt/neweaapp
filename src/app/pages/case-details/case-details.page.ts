import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services';
import { CaseDetailsService } from 'src/app/services/case-details.service';

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.page.html',
  styleUrls: ['./case-details.page.scss'],
})
export class CaseDetailsPage implements OnInit {
  caseId;
  currentCaseData: any = {};
  caseMarkers = {
    show: false,
    fields: []
  }
  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private caseDetailsService: CaseDetailsService) { }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    this.caseId = this.route.snapshot.params.id;
    this.currentCaseData = JSON.parse(localStorage.getItem('detais_case_data'))
    this.currentCaseData.show = false;
    console.log('Current Case', this.currentCaseData);
    this.getCaseMarkers();
  }

  onSelectChange(event) {
    // console.log(event);
  };

  toggleGroup(group) {
    group.show = !group.show;
  };

  isGroupShown(group) {
    console.log(group);

    return group.show;
  }

  getCaseMarkers() {
    this.caseDetailsService.getCaseMarkers(this.caseId).subscribe((response: any) => {
      console.log(response);
      this.caseMarkers.fields = response.data.fields;
    })
  };

  colorCondition(index) {
    if (parseInt(index) == 0) {
      return 'light'
    } else if (parseInt(index) == 1) {
      return 'success'
    } else {
      return 'danger'
    }
  }

}
