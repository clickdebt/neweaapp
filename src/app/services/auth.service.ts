import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class AuthService {

    constructor(
        private http: HttpClient,
    ) { }

    authenticate(username, password) {
        const apiURL = localStorage.getItem('server_url') + 'b/system/v1/' + 'session/login';
        const data = {
            username: username,
            password: password
        };
        return this.http.post(apiURL, data);
    }
}
