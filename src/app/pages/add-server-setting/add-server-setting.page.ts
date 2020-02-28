import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from 'src/app/services/settings.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-server-setting',
  templateUrl: './add-server-setting.page.html',
  styleUrls: ['./add-server-setting.page.scss'],
})
export class AddServerSettingPage implements OnInit {
  settingForm: FormGroup;
  submitted = false;
  url_array = [];
  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.settingForm = this.formBuilder.group({
      nickname: ['', [Validators.required]],
      company_code: ['', [Validators.required]],
      url: ['', [Validators.required]],
    });
  }

  fetchSettings() {
    this.submitted = true;
    if (this.settingForm.controls['company_code'].valid) {
      this.settingsService.loadServerSettings(this.settingForm.controls['company_code'].value).subscribe(res => {
        if (res.data && res.data.length) {
          const settings = JSON.parse(res.data[0].server_settings);

          for (let key in settings) {
            if (key != 'features' && key != 'logo') {
              this.url_array.push({
                val: settings[key].url,
                server_url: key + '-' + settings[key].url
              });
            }
          }
        }
      });
    }
  }

  saveSettings() {
    const serverSettings = localStorage.getItem('serverSettings');
    let setting = { nickname: this.settingForm.controls['nickname'].value, url: this.settingForm.controls['url'].value, active: 0 };
    let ss = [];
    if (serverSettings) {
      ss = JSON.parse(serverSettings);
    } else {
      setting.active = 1;
      localStorage.setItem('server_url', this.settingForm.controls['url'].value);
    }
    ss.push(setting);
    localStorage.setItem('serverSettings', JSON.stringify(ss));
    this.router.navigate(['server-settings']);
  }
}
