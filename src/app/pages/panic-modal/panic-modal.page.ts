import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { CommonService, StorageService } from 'src/app/services';
import { SosService } from 'src/app/services/sos.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
@Component({
  selector: 'app-panic-modal',
  templateUrl: './panic-modal.page.html',
  styleUrls: ['./panic-modal.page.scss'],
})
export class PanicModalPage implements OnInit {
  progress = 0;
  interval;
  isMuted = false;
  volumeClass = 'volume-high-sharp';
  isPause = false;
  isStart = false;
  radius = 130;
  storedCaseId;
  lat;
  lng;
  caseId;
  constructor(
    private modalCtrl: ModalController,
    private nativeAudio: NativeAudio,
    private platform: Platform,
    private commonService: CommonService,
    private sosService: SosService,
    private geolocation: Geolocation,
    private storageService: StorageService
  ) {
  }

  async ngOnInit() {
    await this.nativeAudio.preloadSimple('score_0', 'assets/audio/10.wav');
    await this.nativeAudio.preloadSimple('score_1', 'assets/audio/9.wav');
    await this.nativeAudio.preloadSimple('score_2', 'assets/audio/8.wav');
    await this.nativeAudio.preloadSimple('score_3', 'assets/audio/7.wav');
    await this.nativeAudio.preloadSimple('score_4', 'assets/audio/6.wav');
    await this.nativeAudio.preloadSimple('score_5', 'assets/audio/5.wav');
    await this.nativeAudio.preloadSimple('score_6', 'assets/audio/4.wav');
    await this.nativeAudio.preloadSimple('score_7', 'assets/audio/3.wav');
    await this.nativeAudio.preloadSimple('score_8', 'assets/audio/2.wav');
    await this.nativeAudio.preloadSimple('score_9', 'assets/audio/1.wav');
    await this.nativeAudio.preloadSimple('score_10', 'assets/audio/0.wav');
    await this.nativeAudio.preloadSimple('siren', 'assets/audio/SOS-alarm.wav');
  }

  async ionViewDidEnter() {
    console.log('here');

    await this.getCurrentLocation();
  }

  async dismiss() {
    this.pausePanicCounter();
    if (this.progress == 10) {
      await this.nativeAudio.stop('siren');
    }
    this.modalCtrl.dismiss({
      saved: false
    });
  }

  async startPanicCounter() {
    this.isPause = false;
    this.isStart = true;
    if (!this.isMuted && this.progress == 0) {
      await this.nativeAudio.play('score_0');
    }

    const getProgress = async () => {
      if (this.progress <= 9) {
        this.progress++;
      }
      if (!this.isMuted && this.progress < 10) {
        await this.nativeAudio.play('score_' + this.progress)
      }
      if (this.progress == 10) {
        this.sendSosRequest();
        this.isPause = true;
        clearInterval(this.interval);
      }
    };

    this.interval = setInterval(getProgress, 1000);
  }

  pausePanicCounter() {
    this.isStart = false;
    this.isPause = true;
    clearInterval(this.interval);
  }

  async playSiren() {
    if (!this.isMuted) {
      await this.nativeAudio.play('siren');
    }
  }

  async sendSosRequest() {
    await this.playSiren();
    this.caseId = await this.storageService.get('caseId');
    if (!this.caseId) {
      this.caseId = 0;
    }
    this.sosService.sendSOS(this.caseId, this.lat, this.lng).subscribe((responseObj) => {
      this.setSOSTemplate(responseObj);
    });
  }

  setSOSTemplate(responseObj) {
    if (responseObj != undefined) {
      this.commonService.showToast(responseObj.message);
    }
  }

  async changeSoundSetting() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.progress == 10) {
        await this.nativeAudio.stop('siren');
      }
      this.volumeClass = 'volume-mute-sharp';
    } else {
      if (this.progress == 10) {
        await this.playSiren();
      }
      this.volumeClass = 'volume-high-sharp';
    }
  }

  getOverlayStyle() {
    const isSemi = false;
    const transform = (isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';

    return {
      top: isSemi ? 'auto' : '50%',
      bottom: isSemi ? '5%' : 'auto',
      color: '#000 !important',
      left: '50%',
      transform: transform,
      '-moz-transform': transform,
      '-webkit-transform': transform,
      'font-size': this.radius / 3.5 + 'px'
    };
  }

  async getCurrentLocation() {
    console.log('getCurrentLocation');
    await this.geolocation.getCurrentPosition().then((res: any) => {
      const coords = res.coords;
      console.log('coords', coords);
      this.lng = coords.longitude;
      this.lat = coords.latitude;
      console.log(this.lng, this.lat);
    }, err => {
      console.log(err);
    });

  }
}
