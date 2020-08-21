import { Component, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-index',
  templateUrl: './index.page.html',
  styleUrls: ['./index.page.scss'],
})
export class IndexPage implements OnInit {

  constructor(private statusBar: StatusBar) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.statusBar.styleDefault();
    this.statusBar.backgroundColorByHexString('#fff');
  }

}
