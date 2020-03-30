import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { CommonService } from 'src/app/services';
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
  lat;
  lng;
  constructor(
    private modalCtrl: ModalController,
    private nativeAudio: NativeAudio,
    private commonService: CommonService,
    private geolocation: Geolocation,
    private sosService: SosService
  ) {
    this.getCurrentLocation();
  }

  ngOnInit() {
  }

  async ionViewDidEnter() {
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

  async dismiss() {
    this.pausePanicCounter();
    if (this.progress === 10) {
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
        await this.nativeAudio.play('score_' + this.progress);
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
    this.sosService.sendSOS(this.lat, this.lng).subscribe((response: any) => {
      this.commonService.showToast(response.message);
    });
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
      transform,
      '-moz-transform': transform,
      '-webkit-transform': transform,
      'font-size': this.radius / 3.5 + 'px'
    };
  }

  async getCurrentLocation() {
    const { coords } = await this.geolocation.getCurrentPosition();
    this.lng = coords.longitude;
    this.lat = coords.latitude;
  }
}
