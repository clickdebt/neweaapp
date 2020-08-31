import { Component, OnInit, OnDestroy } from '@angular/core';
import { SosService } from 'src/app/services/sos.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.page.html',
  styleUrls: ['./timer.page.scss'],
})
export class TimerPage implements OnInit, OnDestroy {
  timeLeft = '';
  isPause;
  showTimer;
  subscriptions = new Subscription();
  isSafeGuardActive;
  selectedTime;
  constructor(private sosService: SosService) { }

  ngOnInit() {
    this.getTimerDetails();
  }

  getTimerDetails() {
    this.subscriptions.add(this.sosService.timeProgressBehaviorSubject.subscribe((progress) => {
      if (progress) {
        this.selectedTime = this.sosService.selectedTime;
        this.isPause = false;
        this.isSafeGuardActive = true;
        this.timeLeft = this.sosService.getSecondsAsDigitalClock(this.selectedTime - progress);
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
    this.subscriptions.add(this.sosService.timerStopBehaviorSubject.subscribe((response) => {
      if (response) {
        this.isSafeGuardActive = false;
      }
    }));
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
    this.sosService.stopTimer();
    this.isSafeGuardActive = false;
    localStorage.setItem('isSafeGuardActive', String(this.isSafeGuardActive));
    this.sosService.timerStopBehaviorSubject.next(true);
    this.sosService.timeProgressBehaviorSubject.next(null);
    this.selectedTime = 0;
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
