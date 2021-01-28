import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services';

@Component({
  selector: 'app-server-settings',
  templateUrl: './server-settings.page.html',
  styleUrls: ['./server-settings.page.scss'],
})
export class ServerSettingsPage implements OnInit {
  settings = [];
  appName;
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() { 
    this.appName = this.commonService.appName;
  }

  ionViewWillEnter() {
    const serverSettings = localStorage.getItem('serverSettings');
    if (serverSettings) {
      this.settings = JSON.parse(serverSettings);
    }
  }

  changeServer(server) {
    if (server.active) {
      localStorage.removeItem('server_url');
      localStorage.setItem('server_url', server.url);
    }
    if (server.active) {
      this.settings.forEach(sett => {
        if (sett.nickname !== server.nickname) {
          // console.log(sett);
          sett.active = 0;
        }
      });
    }
    localStorage.setItem('serverSettings', JSON.stringify(this.settings));
  }
  deleteServer(server) {
    if (server.active) {
      localStorage.removeItem('server_url');
    }
    this.settings.splice(this.settings.indexOf(server), 1)
    localStorage.setItem('serverSettings', JSON.stringify(this.settings));
  }
}
