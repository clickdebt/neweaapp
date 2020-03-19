import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SosService {

  constructor() { }
  //TODO
  sendSOS(storedCaseId, lat, lng): Promise<any> {
    return null
  }
}
