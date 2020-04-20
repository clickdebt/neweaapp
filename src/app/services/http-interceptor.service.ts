import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CommonService } from './common.service';

@Injectable({
    providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {

    reqCount = 0;
    noHeaderRequest = 'maps.googleapis.com';
    loaderText = '';
    constructor(
        private router: Router,
        private commonService: CommonService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let newHeaders = req.headers;
        if (req.url.includes('downaloading')) {
            this.loaderText = 'Downloading Data';
        }
        if (!req.url.includes(this.noHeaderRequest)) {
            const token = localStorage.getItem('remote_token');

            newHeaders.append('Content-Type', 'application/json').append('Accept', 'application/json');
            if (token) {
                newHeaders = newHeaders.append('Authorisation', token);
            }
        }

        const authReq = req.clone({ headers: newHeaders });
        this.reqCount++;
        if (this.reqCount === 1 && !req.url.includes('nonblocking')) {
            this.commonService.showLoader();
        }
        return next.handle(authReq).pipe(
            map((event: HttpEvent<any>) => {
                return event;
            }),
            catchError(error => {
                this.commonService.showToast(error.error.message);
                if (error.status === 401 && !req.url.includes('login')) {
                    this.commonService.dismissLoader();
                    localStorage.removeItem('remote_token');
                    localStorage.removeItem('userdata');
                    this.router.navigate(['/login']);
                }
                return throwError(error.error.message || 'server error.');
            }),
            finalize(() => {
                this.reqCount--;
                if (this.reqCount === 0) {
                    this.commonService.dismissLoader();
                }
            })
        );
    }
}
