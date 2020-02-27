import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class SettingsService {

  serverURL = '';
  constructor(
    private http: HttpClient
  ) {
    this.serverURL = 'https://lateral1.com/getServerSettings.php';
  }

  loadServerSettings(companyCode = 'aylesbury') {
    const apiURL = this.serverURL + '?code=' + companyCode;
    const header = {
      'Content-Type': 'application/json'
    };
    const headers = new HttpHeaders(header);
    return this.http.get(apiURL, { headers: headers });

  }
}
