import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-server-settings',
  templateUrl: './server-settings.page.html',
  styleUrls: ['./server-settings.page.scss'],
})
export class ServerSettingsPage implements OnInit {
  settings = [];
  constructor() { }

  ngOnInit() {
    const serverSettings = localStorage.getItem('serverSettings');
    if (serverSettings) {
      this.settings = JSON.parse(serverSettings);
    }
  }
  changeServer(server) {
    this.settings.forEach(setting => {
      if (setting.nickname != server.nickname) {
        console.log(setting);
        setting.active = 0;
      }
    });
  }

}
