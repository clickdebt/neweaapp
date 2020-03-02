import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AuthService {

    serverURL = '';
    constructor(
        private http: HttpClient
    ) {
        this.serverURL = localStorage.getItem('server_url') + 'b/system/v1/';
    }

    authenticate(username, password) {
        const apiURL = this.serverURL + 'session/login';
        const data = {
            username: username,
            password: password
        };
        return this.http.post(apiURL, data);
    }
}
