import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor(public http: HttpClient) { }

  getHeaders(token) {
    const header = {
      'Content-Type': 'application/json'
    };
    const headers = new HttpHeaders(header);
    const newheader = headers.append('Authorisation', token);
    return newheader;
  }

  geoCodeAddress(location) {
    if (location) {
      const apiURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=AIzaSyB2SD46TH6aRspJzp_jvIBFTFv-AlN_mUQ`;
      return this.http.get(apiURL);
    }
  }
}
