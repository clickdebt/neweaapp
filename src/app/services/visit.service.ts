import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VisitService {

  constructor(
    public http: HttpClient
  ) { }

  getVisitForm() {
    const logindata = JSON.parse(localStorage.getItem('userdata'));
    // tslint:disable-next-line: max-line-length
    const apiURL = localStorage.getItem('server_url') + 'b/system/v1/forms/view/visit_form';
    return this.http.get(apiURL);
  }
}
