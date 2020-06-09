import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  hasVRMpermission = false;
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.checkPermissions();
  }
  async checkPermissions(){
    this.hasVRMpermission = await this.commonService.hasPermission(this.commonService.permissionSlug.VRM);
  }

}
