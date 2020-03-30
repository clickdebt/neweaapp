import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SosService {

  constructor(
    public http: HttpClient
  ) { }
  //TODO
  sendSOS(lat, lng) {
    const apiURL = localStorage.getItem('server_url') + 'b/sms/actions/send_sos_request/' + lat + '/' + lng + '?source=API';
    console.log(apiURL);
    return this.http.get(apiURL);
  }
}
