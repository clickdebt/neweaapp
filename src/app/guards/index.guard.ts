import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class IndexGuard implements CanActivate {
  constructor(public router: Router) { }

  canActivate() {
    let token = localStorage.getItem('remote_token');
    if (token) {
      this.router.navigate(['home']);
    } else {
      return true;
    }
  }

}
