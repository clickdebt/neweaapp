import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.settingsService.loadServerSettings().subscribe(res => {
      console.log(res);
    });
  }

}
