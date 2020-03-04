import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService, CommonService } from 'src/app/services';
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
    private loadingController: LoadingController
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
      const setting = settings.filter(sett => {
        return sett.active;
      });
      this.setting = setting[0];
    }
  }
  login() {
    if (this.loginForm.valid) {
      this.authService.authenticate(this.loginForm.value.username, this.loginForm.value.password).subscribe(
        data => {
          if (data['result']) {
            localStorage.setItem('userdata', JSON.stringify(data['data']));
            localStorage.setItem('remote_token', data['data']['remote_token']);
            this.commonService.showToast('Successfully logged in.', 'success');
            this.router.navigate(['/home']);
          } else {
            this.commonService.showToast(data['message'], 'danger');
          }
        },
        err => {
          this.commonService.showToast(err);
        }
      );
    }
  }

}
