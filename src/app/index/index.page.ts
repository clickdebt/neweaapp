import { Component, OnInit } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { CommonService } from '../services';

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export class IndexPage implements OnInit {

  constructor(private statusBar: StatusBar,private commonService: CommonService,private keyboard:Keyboard) { }
  appVersion = '';
  isHideFooter = false;
  ngOnInit() {
    this.appVersion = this.commonService.getAppVersion();
  }
  ionViewWillEnter() {
    this.statusBar.styleDefault();
    this.statusBar.backgroundColorByHexString('#fff');
    this.keyboard.onKeyboardShow().subscribe((result)=>{
      this.isHideFooter=true;
    })
    this.keyboard.onKeyboardHide().subscribe((result)=>{
      this.isHideFooter=false;
    })
  }

}
