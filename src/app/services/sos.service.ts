import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SosService {

  constructor(public http: HttpClient) { }

  sendSOS(caseId, lat, lng) {
    // tslint:disable-next-line: max-line-length
    const apiURL = `${localStorage.getItem('server_url')}b/system/v3/cases/send_sos_message/?case_id=${caseId}&lat=${lat}&lng=${lng}&source=API`;
    console.log(apiURL);
    return this.http.get(apiURL);
  }
}
