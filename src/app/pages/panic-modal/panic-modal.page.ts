import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { CommonService, StorageService } from 'src/app/services';
import { SosService } from 'src/app/services/sos.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-panic-modal',
  templateUrl: './panic-modal.page.html',
  styleUrls: ['./panic-modal.page.scss'],
})
export class PanicModalPage implements OnInit, OnDestroy {
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
  timeLeft;
  caseId;
  @Input() selectedCase;
  isSafeGuardActive;
  timeSettings;
  selectedTime;
  note;
  subscriptions = new Subscription();
  constructor(
    private modalCtrl: ModalController,
    private nativeAudio: NativeAudio,
    private platform: Platform,
    private commonService: CommonService,
    private sosService: SosService,
    private geolocation: Geolocation,
    private storageService: StorageService,
    private router: Router
  ) {
  }

  async ngOnInit() {
    this.isSafeGuardActive = (localStorage.getItem('isSafeGuardActive') === 'true');
    this.sosService.isMuted = this.isMuted;
    this.selectedTime = '';
    this.progress = 0;
    this.timeSettings = await this.storageService.get('timeSettings');
    if(!this.timeSettings) {
      this.timeSettings= [{"time":10,"label":"10 seconds"}];
    }
    if (this.isSafeGuardActive) {
      this.getTimerDetails();
    }
    if (!this.selectedCase && this.router.routerState.snapshot.url.includes('case-details')) {
      this.selectedCase = JSON.parse(localStorage.getItem('detais_case_data'));
    }
    if (this.selectedCase) {
      this.setCaseDetails();
    } else {
      this.sosService.caseId = 0;
    }
  }
  setCaseDetails() {
    this.caseId = this.selectedCase.id;
    this.sosService.caseId = this.selectedCase.id;
    this.note = `Last Data Viewed was Account Ref ${this.selectedCase.ref},`;
    if (this.selectedCase.debtor.enforcement_addresses.length) {
      this.note += this.selectedCase.debtor.enforcement_addresses[0].address_ln1
        + ' ' + this.selectedCase.debtor.enforcement_addresses[0].address_ln2
        + ' ' + this.selectedCase.debtor.enforcement_addresses[0].address_ln3
        + ' ' + this.selectedCase.debtor.enforcement_addresses[0].address_town
        + ',' + this.selectedCase.debtor.enforcement_addresses[0].address_postcode;
    } else {
      this.note += this.selectedCase.debtor.addresses[0].address_ln1
        + ' ' + this.selectedCase.debtor.addresses[0].address_ln2
        + ' ' + this.selectedCase.debtor.addresses[0].address_ln3
        + ' ' + this.selectedCase.debtor.addresses[0].address_town
        + ',' + this.selectedCase.debtor.addresses[0].address_postcode;
    }
  }
  async setCountDownAudio() {
    await this.nativeAudio.preloadSimple('score_10', 'assets/audio/10.wav');
    await this.nativeAudio.preloadSimple('score_9', 'assets/audio/9.wav');
    await this.nativeAudio.preloadSimple('score_8', 'assets/audio/8.wav');
    await this.nativeAudio.preloadSimple('score_7', 'assets/audio/7.wav');
    await this.nativeAudio.preloadSimple('score_6', 'assets/audio/6.wav');
    await this.nativeAudio.preloadSimple('score_5', 'assets/audio/5.wav');
    await this.nativeAudio.preloadSimple('score_4', 'assets/audio/4.wav');
    await this.nativeAudio.preloadSimple('score_3', 'assets/audio/3.wav');
    await this.nativeAudio.preloadSimple('score_2', 'assets/audio/2.wav');
    await this.nativeAudio.preloadSimple('score_1', 'assets/audio/1.wav');
    await this.nativeAudio.preloadSimple('score_0', 'assets/audio/0.wav');
    await this.nativeAudio.preloadSimple('siren', 'assets/audio/SOS-alarm.wav');
  }

  async ionViewDidEnter() {
    this.setCountDownAudio();
  }
  onSelectChange(event) {
  }

  getTimerDetails() {
    this.subscriptions.add(this.sosService.timeProgressBehaviorSubject.subscribe((progress) => {
      if (progress) {
        this.selectedTime = this.sosService.selectedTime;
        this.isPause = false;
        this.progress = progress;
        this.timeLeft = this.sosService.getSecondsAsDigitalClock(this.selectedTime - progress)
        console.log(this.timeLeft);
      }
    }));
    this.subscriptions.add(this.sosService.timerPauseBehaviorSubject.subscribe((response) => {
      if (response) {
        this.isPause = true;
      } else {
        this.isPause = false;
      }
    }));

  }

  startSafeGuard() {
    localStorage.setItem('isSafeGuardActive', String(this.isSafeGuardActive));
    this.sosService.selectedTime = this.selectedTime;
    this.sosService.startTimer();
    this.getTimerDetails();
    this.isSafeGuardActive = true;
    this.sosService.note = this.note;
    // this.startPanicCounter();
  }
  pauseTimer() {
    this.sosService.pauseTimer();
    this.isPause = true;
    this.sosService.timerPauseBehaviorSubject.next(true);
  }
  playTimer() {
    this.sosService.startTimer();
    this.isPause = false;
    this.sosService.timerPauseBehaviorSubject.next(false);
  }
  stopTimer() {
    this.selectedTime = '';
    this.progress = 0;
    this.timeLeft = '';
    this.sosService.stopTimer();
    this.isSafeGuardActive = false;
    localStorage.setItem('isSafeGuardActive', String(this.isSafeGuardActive));
    this.sosService.timeProgressBehaviorSubject.next(null);
    this.sosService.timerStopBehaviorSubject.next(true);
  }

  async dismiss() {
    this.modalCtrl.dismiss();
  }

  async playSiren() {
    if (!this.isMuted) {
      await this.nativeAudio.play('siren');
    }
  }

  async changeSoundSetting() {
    this.isMuted = !this.isMuted;
    this.sosService.isMuted = this.isMuted;
    if (this.isMuted) {
      if (this.progress == this.selectedTime) {
        await this.nativeAudio.stop('siren');
      }
      this.volumeClass = 'volume-mute-sharp';
    } else {
      if (this.progress !== 0 &&
        this.selectedTime !== 0
        && (this.selectedTime - this.progress) === 0) {
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
      'font-size': '29px'
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
