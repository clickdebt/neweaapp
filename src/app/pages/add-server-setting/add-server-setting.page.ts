import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService, CommonService } from 'src/app/services';
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
    private commonService: CommonService
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
    this.url_array = []
    this.submitted = true;
    if (this.settingForm.controls['company_code'].valid) {
      this.settingsService.loadServerSettings(this.settingForm.controls['company_code'].value).subscribe(res => {
        if (res['data'] && res['data'].length) {
          const settings = JSON.parse(res['data'][0].server_settings);
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
      ss = JSON.parse(serverSettings)
    }
    if (ss.length > 0) {
      if (!(ss.find(s => s.url == setting.url))) {
        if (!ss.find(s => s.active == true)) {
          setting.active = 1
        }
        ss.push(setting);
        this.commonService.showToast('Server added successfully');
      } else {
        this.commonService.showToast('Server already added');
      }
    } else {
      setting.active = 1;
      localStorage.setItem('server_url', this.settingForm.controls['url'].value);
      ss.push(setting);
      this.commonService.showToast('Server added successfully');
    }
    this.settingForm.reset();
    localStorage.setItem('serverSettings', JSON.stringify(ss));
    this.router.navigate(['server-settings']);
  }
}
