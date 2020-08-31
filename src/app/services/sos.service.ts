import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { StorageService } from './storage.service';
import { CommonService } from './common.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Injectable({
  providedIn: 'root'
})
export class SosService {

  timeProgressBehaviorSubject = new BehaviorSubject<number>(null);
  timerPauseBehaviorSubject = new BehaviorSubject<boolean>(null);
  timerStopBehaviorSubject = new BehaviorSubject<boolean>(false);
  selectedTime;
  progress = 0;
  isMuted = false;
  caseId;
  interval;
  lng;
  lat;
  note;
  constructor(
    public http: HttpClient,
    private nativeAudio: NativeAudio,
    private storageService: StorageService,
    private commonService: CommonService,
    private geolocation: Geolocation
  ) { }

  sendSOS(caseId, lat, lng, note) {
    // tslint:disable-next-line: max-line-length
    const apiURL = `${localStorage.getItem('server_url')}b/system/v3/cases/send_sos_message/?case_id=${caseId}&lat=${lat}&lng=${lng}&note=${note}&source=API`;
    console.log(apiURL);
    return this.http.get(apiURL);
  }
  getSecondsAsDigitalClock(inputSeconds: number) {
    const inputSec = parseInt(inputSeconds.toString(), 10); // don't forget the second param
    const hours = Math.floor(inputSec / 3600);
    const minutes = Math.floor((inputSec - (hours * 3600)) / 60);
    const seconds = inputSec - (hours * 3600) - (minutes * 60);
    let hoursString = '';
    let minutesString = '';
    let secondsString = '';
    hoursString = (hours < 10) ? '0' + hours : hours.toString();
    minutesString = (minutes < 10) ? '0' + minutes : minutes.toString();
    secondsString = (seconds < 10) ? '0' + seconds : seconds.toString();
    return hoursString + ':' + minutesString + ':' + secondsString;
  }

  startTimer() {
    localStorage.setItem('isSafeGuardActive', String(true));
    const getProgress = async () => {

      if (this.progress <= this.selectedTime) {
        this.progress++;
        this.timeProgressBehaviorSubject.next(this.progress);
      }
      if (!this.isMuted && (this.selectedTime - this.progress) <= 10) {
        await this.nativeAudio.play('score_' + (this.selectedTime - this.progress));
      }
      if (this.progress == this.selectedTime) {
        this.sendSosRequest();
        this.pauseTimer();
      }
    };
    this.interval = setInterval(getProgress, 1000);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  async stopTimer() {
    localStorage.setItem('isSafeGuardActive', String(false));
    clearInterval(this.interval);
    this.note = '';
    if (this.progress == this.selectedTime) {
      await this.nativeAudio.stop('siren');
    }
    this.selectedTime = 0;
    this.progress = 0;
  }

  async sendSosRequest() {
    await this.playSiren();
    // this.caseId = await this.storageService.get('caseId');
    if (!this.caseId) {
      this.caseId = 0;
    }
    await this.getCurrentLocation();

    this.sendSOS(this.caseId, this.lat, this.lng, this.note).subscribe((responseObj) => {
      this.setSOSTemplate(responseObj);
    });
  }

  async playSiren() {
    if (!this.isMuted) {
      await this.nativeAudio.play('siren');
    }
  }

  setSOSTemplate(responseObj) {
    if (responseObj != undefined) {
      this.commonService.showToast(responseObj.message);
    }
  }
  async getCurrentLocation() {
    const { coords } = await this.geolocation.getCurrentPosition();
    this.lng = coords.longitude;
    this.lat = coords.latitude;
  }

}
