import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AuthService {

    serverURL = '';
    constructor(
        private http: HttpClient
    ) {
        this.serverURL = localStorage.getItem('API_URL');
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
