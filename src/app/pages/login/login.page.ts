import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService, CommonService, StorageService } from 'src/app/services';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  setting;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private commonService: CommonService,
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.initForm();
  }
  ionViewWillEnter() {
    this.getActiveServerSetting();
  }
  initForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  getActiveServerSetting() {
    const serverSettings = localStorage.getItem('serverSettings');
    if (serverSettings) {
      const settings = JSON.parse(serverSettings);
      const setting = settings.find(sett => {
        return sett.active;
      });
      this.setting = setting;
    }
  }
  login() {
    if (this.loginForm.valid) {
      this.authService.authenticate(this.loginForm.value.username, this.loginForm.value.password).subscribe(
        data => {
          if (data['result']) {
            const userdata = data['data'];
            localStorage.setItem('userdata', JSON.stringify(userdata));
            if (userdata.user_permissions) {
              const permissions = userdata.user_permissions;
              let permissionArr = [];
              permissions.filter(per => {
                const p = Object.keys(per).filter(element => {
                  return per[element] == true;
                });
                permissionArr = permissionArr.concat(p);
              });
              this.storageService.set('permissionArray', permissionArr);
            }
            localStorage.setItem('remote_token', data['data']['remote_token']);
            this.commonService.showToast('Successfully logged in.', 'success');
            this.router.navigate(['/home']);
          } else {
            this.commonService.showToast(data['message'], 'danger');
          }
        },
        err => {
          this.commonService.showToast(err, 'danger');
        }
      );
    }
  }

}
