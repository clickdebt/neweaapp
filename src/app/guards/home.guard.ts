import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HomeGuard implements CanActivate {
  constructor(public router: Router) { }
  canActivate() {
    let token = localStorage.getItem('remote_token');
    if (token) {
      return true;
    } else {
      this.router.navigate(['login']);
    }


  }

}
