import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services';

@Component({
  selector: 'app-case-details',
  templateUrl: './case-details.page.html',
  styleUrls: ['./case-details.page.scss'],
})
export class CaseDetailsPage implements OnInit {
  caseId;
  currentCaseData;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService) { }

  ngOnInit() {
  }
  async ionViewWillEnter() {
    this.caseId = this.route.snapshot.params.id;
    const casesData = await this.storageService.get('cases');
    this.currentCaseData = casesData.find(c => c.id == this.caseId);
    console.log(this.currentCaseData);
  }
}
