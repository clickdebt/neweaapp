import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { browserDBInstance } from './browserdb';
import { CaseService } from './case.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import * as moment from 'moment';
import { CommonService } from './common.service';
declare var window: any;
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: any;
  private readDatabase: any;
  private databaseReady: BehaviorSubject<boolean>;
  public isApiPending: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public refreshingData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public syncingAPI: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private detailsReady: BehaviorSubject<boolean>;
  public lastUpdateTime: BehaviorSubject<any> = new BehaviorSubject(false);
  linkedIds = [];
  version = 4;
  tables = ['rdebt_cases', 'rdebt_linked_cases', 'history', 'api_calls'];
  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private http: HttpClient,
    private storageService: StorageService,
    public sqlitePorter: SQLitePorter,
    private caseService: CaseService,
    private networkService: NetworkService,
    private commonService: CommonService
  ) {
    this.databaseReady = new BehaviorSubject(false);
    this.detailsReady = new BehaviorSubject(false);

    this.platform.ready().then(async () => {

      if(this.platform.is('android')){
        console.log('platform android');
      }
      if(this.platform.is('ios')){
        console.log('platform ios');
      }
      if(this.platform.is('iphone')){
        console.log('platform iphone');
      }
      if(this.platform.is('mobile')){
        console.log('platform mobile');
      }
      if (!this.platform.is('android') || !this.platform.is('ios')) {
        let db = window.openDatabase('fieldAgentV3.db', '1.0', 'DEV', 5 * 1024 * 1024);
        this.database = browserDBInstance(db);
        let readdb = window.openDatabase('fieldAgentV3.db', '1.0', 'DEV', 5 * 1024 * 1024);
        this.readDatabase = browserDBInstance(readdb);
        console.log('1');
      } else {
        console.log('2');
        this.database = await this.sqlite.create({
          name: 'fieldAgentV3.db',
          location: 'default',
          key: 'u3a5wIA73vmG6ruB'
        });
        this.readDatabase = await this.sqlite.create({
          name: 'fieldAgentV3.db',
          location: 'default',
          key: 'u3a5wIA73vmG6ruB'
        });
      }
      const value = await this.storageService.get('database_filled');
      const storageVersion = await this.storageService.get('version');
      if (value && storageVersion && storageVersion == this.version) {
        this.databaseReady.next(true);
      } else {
        this.setUpDatabase();
      }
      this.isApiPending.subscribe(res => {
        this.savePendingApi(res);
      })
      // this.networkService.onNetworkChange().subscribe((response) => {
      //   if (response === 1) {
          
      //   }
      // });

    }).catch((error) => { });
  }

  async setUpDatabase() {
    const rdebCases = `CREATE TABLE IF NOT EXISTS rdebt_cases(
      id INTEGER PRIMARY KEY,
      ref TEXT,
      cl_ref TEXT,
      scheme_id INTEGER,
      debtor_id INTEGER,
      date DATE,
      d_outstanding DOUBLE INT,
      visitcount_total INTEGER,
      last_allocated_date DATETIME,
      custom5 TEXT,
      manual_link_id INTEGER,
      hold_until TEXT,
      stage_type TEXT,
      client_id INTEGER,
      current_status_id INTEGER,
      current_stage_id INTEGER,
      address_postcode Text,
      enforcement_addresses_postcode TEXT,
      debtor_name Text,
      data TEXT,
      arranagement TEXT
    );`;

    const rdebLinkedCases = `CREATE TABLE IF NOT EXISTS rdebt_linked_cases(
      id INTEGER PRIMARY KEY,
      ref TEXT,
      cl_ref TEXT,
      scheme_id INTEGER,
      debtor_id INTEGER,
      date DATE,
      d_outstanding DOUBLE INT,
      visitcount_total INTEGER,
      last_allocated_date DATETIME,
      custom5 TEXT,
      manual_link_id INTEGER,
      hold_until TEXT,
      stage_type TEXT,
      client_id INTEGER,
      current_status_id INTEGER,
      current_stage_id INTEGER,
      address_postcode Text,
      enforcement_addresses_postcode Text,
      debtor_name Text,
      data TEXT,
      arranagement TEXT
    );`;

    const history = `CREATE TABLE IF NOT EXISTS history(
      id INTEGER PRIMARY KEY ,
      caseid INTEGER,
      document_id INTEGER,
      action TEXT,
      attachment TEXT,
      name TEXT,
      type TEXT,
      note TEXT,
      time DATETIME
    );`;

    const api_calls = `CREATE TABLE IF NOT EXISTS api_calls(
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      case_id INTEGER,
      url TEXT,
      type TEXT,
      data TEXT,
      is_sync INTEGER,
      response_id INTEGER,
      response_data TEXT,
      created_at DATETIME,
      updated_at DATETIME
    );`;

    this.tables.forEach(async element => {
      const deleteQuery = 'DROP TABLE IF EXISTS ' + element + ';';
      try {
        let a = await this.database.executeSql(deleteQuery);
      } catch (error) {
        console.log(error);        
      }
    });
    await this.storageService.clearAll();

    try {
      await this.database.executeSql(rdebCases);
    } catch (error) {
      console.log(error)
    }
    try {
      await this.database.executeSql(rdebLinkedCases);
    } catch (error) {
      console.log(error)
    }
    try {
      await this.database.executeSql(history);
    } catch (error) {
      console.log(error)
    }
    try {
      await this.database.executeSql(api_calls);
    } catch (error) {
      console.log(error)
    }

    this.databaseReady.next(true);
    await this.storageService.set('database_filled', true);
    await this.storageService.set('version', this.version)
  }

  async executeQuery(query, params = null) {
    try {
      const result = await this.database.executeSql(query, params);
      // console.log('exexute query', result);
      return result;
    } catch (error) {
      console.log('error', error, query);
      return false;
    }
  }

  async executeReadQuery(query, params = null) {
    try {
      if (!this.platform.is('android') || !this.platform.is('ios')) {
        const result = await this.readDatabase.executeSql(query, params);
        return result;
      } else {
        const result = await this.readDatabase.executeSql(query, params);
        return result;
      }
    } catch (error) {
      console.log('error', error, query);
      return false;
    }
  }

  async getCaseInfo(id) {
    let query = `select * from rdebt_cases where id = ${id} and 1=1`;
    let result = await this.executeReadQuery(query);
    result = await this.extractResult(result);
    if (result) {
      let finalData = result[0];
      finalData = JSON.parse(decodeURI(finalData.data));
      finalData = await this.getLinkedCases(finalData);
      return finalData;
    } else {
      return '';
    }
  }
  async getLinkedCases(item) {
    let query = 'select * from rdebt_linked_cases where (manual_link_id = ? or debtor_id = ? )and id != ?';
    let p = [item.manual_link_id, item.debtor_id, item.id];
    const results: any[] = [];

    await this.executeQuery(query, p).then((data) => {
      let link_item;
      for (let i = 0; i < data.rows.length; i++) {
        link_item = data.rows.item(i);
        link_item.data = JSON.parse(decodeURI(link_item.data));
        this.linkedIds.push(link_item.data.id);
        results.push(link_item.data);
      }
      item.linked_cases = results;
      item.linkedCasesTotalBalance = item.linked_cases.reduce((accumulator, currentValue) => {
        return accumulator + parseFloat(currentValue.d_outstanding);
      }, 0);
      item.linkedCasesTotalBalance = item.linkedCasesTotalBalance.toFixed(2);
    });
    return item;
  }

  async insert(tableName, params = []) {
    const fields = params.map(item => item.name);
    const values = params.map(item => `'${item.value}'`);
    const query = `INSERT OR REPLACE INTO ${tableName} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
    return await this.executeQuery(query);
  }

  async updateVisitForm(is_sync, visit_form_data_id, form_id) {
    const updateQuery = `update visit_reports set is_sync = ${is_sync} and
    visit_form_data_id=${visit_form_data_id} where id = ${form_id}`;
    return this.executeQuery(updateQuery);
  }
  async getUnsyncVisitForms() {
    const query = 'Select * from visit_reports where 1 = 1 and is_sync = 0';
    return this.executeReadQuery(query);
  }

  async setCases(data, linked, allCases) {
    // const cases = this.parseCaseData(data, linked);
    const sql = [];
    const sqlLinked = [];
    let sqlStart = `insert or replace INTO rdebt_cases
    ( id, ref, cl_ref, scheme_id, debtor_id, date, d_outstanding, visitcount_total,
      last_allocated_date, custom5, manual_link_id, hold_until, stage_type,
      client_id, current_status_id, current_stage_id, address_postcode,
      enforcement_addresses_postcode, debtor_name,  data ) VALUES `;

    let sqlLinkedStart = `insert or replace INTO rdebt_linked_cases
    ( id, ref, cl_ref, scheme_id, debtor_id, date, d_outstanding, visitcount_total,
      last_allocated_date, custom5, manual_link_id, hold_until, stage_type,
      client_id, current_status_id, current_stage_id, address_postcode,
      enforcement_addresses_postcode, debtor_name, data ) VALUES `;

    data.forEach((values) => {

      const query = `(${values.id}, "${values.ref}", "${values.cl_ref}", ${values.scheme_id},  ${values.debtor_id},
          "${values.date}", ${values.d_outstanding}, ${values.visitcount_total},
          "${values.last_allocated_date}", "${values.custom5}", ${values.manual_link_id},
          "${values.hold_until}", "${values.stage.stage_type.stage_type}", ${values.client_id}, ${values.current_status_id},
          ${values.current_stage_id},"${values.debtor.addresses[0].address_postcode}",
          "${values.debtor.enforcement_addresses[0].address_postcode}","${values.debtor.debtor_name}",
            "${encodeURI(JSON.stringify(values))}")`;
      sql.push(query);
      // this.executeQuery(query);

    });
    sqlStart += sql.join(',');

    linked.forEach((values) => {

      sqlLinked.push(`(${values.id}, "${values.ref}", "${values.cl_ref}", ${values.scheme_id}, ${values.debtor_id},
        "${values.date}", ${values.d_outstanding}, ${values.visitcount_total},
        "${values.last_allocated_date}", "${values.custom5}", ${values.manual_link_id},
        "${values.hold_until}", "${values.stage.stage_type.stage_type}", ${values.client_id}, ${values.current_status_id},
         ${values.current_stage_id},"${values.debtor.addresses[0].address_postcode}",
         "${values.debtor.enforcement_addresses[0].address_postcode}","${values.debtor.debtor_name}",
          "${encodeURI(JSON.stringify(values))}")`);
    });
    sqlLinkedStart += sqlLinked.join(',');
    const promiseArray = [];

    if (allCases) {
      const delQuery = 'delete from rdebt_cases where id not in (' + allCases.join(',') + ')';
      promiseArray.push(this.executeQuery(delQuery));
      const delHistoryQuery = 'delete from history where caseid not in (' + allCases.join(',') + ')';
      promiseArray.push(this.executeQuery(delHistoryQuery));
    } else if(!allCases) { // Sometime based on respose, the last case is not getting removed. So we add this logic.
      const delQuery = 'delete from rdebt_cases';
      promiseArray.push(this.executeQuery(delQuery));
      const delLinkedCasesQuery = 'delete from rdebt_linked_cases';
      promiseArray.push(this.executeQuery(delLinkedCasesQuery));
      const delHistoryQuery = 'delete from history';
      promiseArray.push(this.executeQuery(delHistoryQuery));
    }

    if (data.length) {
      promiseArray.push(this.executeQuery(sqlStart));
    }
    if (linked.length) {
      promiseArray.push(this.executeQuery(sqlLinkedStart));
    }
    await Promise.all(promiseArray)
      .then((res: any) => {
        // console.log(res);
      })
      .catch((error) => { });
  }

  async storeToSqlite(tableName, entries) {
    try {
      const promiseArray = [];
      let q = `INSERT OR REPLACE INTO ${tableName} `;
      var i = 1;
      for (const entrie of entries) {
        const params = [];
        Object.entries(entrie).map(([name, value]) => {
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          if (typeof value === 'string' && value.includes(`'`)) {
            value = value.replace(/'/g, `''`);
          }
          params.push({ name, value });
        });
        if (i == 1) {
          i = 0;
          const fields = params.map(item => `'${item.name}'`);
          q += ` (${fields.join(', ')}) values `
          const values = params.map(item => `'${item.value}'`);
          q += ` (${values.join(', ')})`
        } else {
          const values = params.map(item => `'${item.value}'`);
          q += ` , (${values.join(', ')})`
        }
      }
      return await this.executeQuery(q);
    } catch (e) {
      console.log(e);
    }
  }

  getEncodeString(data) {
    return encodeURI(JSON.stringify(data));
  }
  getDecodeString(data) {
    return JSON.parse(decodeURI(data));
  }
  async setcaseDetails(data) {
    try {
      const promiseArray = [];
      for (const currentCase of data.cases) {
        // console.log(currentCase);
        const sqlStart = `UPDATE rdebt_cases SET 
        arranagement="${this.getEncodeString(currentCase.arranagement)}" 
        WHERE id = ${currentCase.id}`;
        promiseArray.push(this.executeQuery(sqlStart));
      }
      if (data.history && (data.history).length) {
        await this.storeToSqlite('history', data.history);
      }
      // if (data.exitCodeData) {
      //   await this.setvisitOutcomes(data.exitCodeData);
      // }
      // if(data.paymentGatewayList){
      //   await this.storageService.set('gateway', data.paymentGatewayList);
      // }
      await Promise.all(promiseArray)
        .then((res: any) => {
          return res;
          // console.log(res);
        })
        .catch((error) => {
          console.log(error);

        });
    } catch (r) {
      console.log(r);
    }
  }

  async setExitcodes(data) {
    if (data.exitCodeData) {
      await this.setvisitOutcomes(data.exitCodeData);
    }
    if(data.paymentGatewayList){
      await this.storageService.set('gateway', data.paymentGatewayList);
    }
  }

  async setVisitForm(data) {
    await this.storageService.set('visit_form', data);
  }
  async setFeeOptions(data) {
    await this.storageService.set('fee_options', data);
  }
  async setFilterMasterData(data) {
    await this.storageService.set('filters', data);
  }
  async setvisitOutcomes(data) {
    await this.storageService.set('visitOutcomes', data);
  }

  async select(tableName) {
    try {
      const result = await this.database.executeSql(`SELECT * FROM ${tableName}`);
      return result;
    } catch (error) {
      return error;
    }
  }

  getDatabaseState() {
    return this.databaseReady.asObservable();
  }
  setDetailsDownloadState(val) {
    return this.detailsReady.next(val);
  }
  getDetailsDownloadState() {
    return this.detailsReady.asObservable();
  }
  setlastUpdateTime(val) {
    return this.lastUpdateTime.next(val);
  }
  public getStoredApiStatus(): Observable<boolean> {
    return this.isApiPending.asObservable();
  }
  async setDownloadStatus(data) {
    await this.storageService.set('downloadStatus', data);
  }
  async setHistoryDownloadStatus(data) {
    await this.storageService.set('historyDownloadStatus', data);
  }
  async getDownloadStatus() {
    return await this.storageService.get('downloadStatus');
  }
  async getHistoryDownloadStatus() {
    return await this.storageService.get('historyDownloadStatus');
  }

  async refreshData(params) {
    return new Promise((resolve, reject) => {
      this.refreshingData.next(true);
      forkJoin({
        cases: this.caseService.getCases(params, 1),
        caseDetails: this.caseService.getCaseDetails(params)
      }).subscribe(async (response: any) => {
        await this.setCases(response.cases.data, response.cases.linked, response.cases.allCases);
        await this.setcaseDetails(response.caseDetails);
        await this.updateLastUpdatedDates();
        resolve(response);
      }, (error) => {
        reject(error)
      });
    });
  }

  async updateLastUpdatedDates() {
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    await this.setDownloadStatus({
      status: true,
      time: time
    });
    await this.setHistoryDownloadStatus({
      status: true,
      time: time
    });
    await this.setlastUpdateTime(time);
    await this.refreshingData.next(false);
  }

  async getOfflinecaseDetails(id) {
    const caseDetails: any = {
    };
    let query = `select * from rdebt_cases where id = ${id}`;

    let result = await this.executeReadQuery(query);
    let finalResult = await this.extractResult(result);
    if (finalResult && finalResult.length) {
      caseDetails.data = this.getDecodeString(finalResult[0].data);
      caseDetails.arranagement = this.getDecodeString(finalResult[0].arranagement);

      query = `select * from history where caseid = ${id} order by time desc`;
      result = await this.executeReadQuery(query);
      finalResult = await this.extractResult(result);
      caseDetails.history = finalResult;
    } else {
      caseDetails.deleted = true;
    }


    return caseDetails;
  }

  async extractResult(value) {
    const results: any[] = [];
    let item;
    if (value && value.rows) {
      for (let i = 0; i < value.rows.length; i++) {
        item = value.rows.item(i);
        results.push(item);
      }
    }
    return results;
  }

  changeIsApiPending(val) {
    this.isApiPending.next(val);
  }
  checkApiPending(source= 'false') {
    
    this.getApiStored().then(data => {
      if (data.rows.length > 0) {
        this.changeIsApiPending(true);
      }
    })
  }
  async getApiStored(limit = false) {
    let query = "select * from api_calls where is_sync = 0"
    if(limit) {
      query += ' limit 1';
    }
    return this.executeReadQuery(query, []);
  }
  async changeApiCallStatus(id, status = 1) {
    const updateQuery = `update api_calls set is_sync = ${status} where id = ${id}`;
    return this.executeQuery(updateQuery);
  }
  async savePendingApi(val) {
    if (val && this.networkService.getCurrentNetworkStatus() === 1) {
      this.getApiStored(true).then(async (data) => {
        if (data) {
          for (let i = 0; i < data.rows.length; i++) {
            const currentFormData = data.rows.item(i);
            await this.changeApiCallStatus(currentFormData.id, 2);
            let form_data = JSON.parse(decodeURI(currentFormData.data));
            if(form_data.file) {
              const form_data1 = new FormData();
              form_data1.append('file',  new File([form_data.file], form_data.file_name));
              form_data = form_data1;
            }
            try {
              this.syncingAPI.next(true);
              let callResponse = await this.callHttpApi(currentFormData.type, localStorage.getItem('server_url') + currentFormData.url, { body: form_data });
              console.log(callResponse);
              this.syncingAPI.next(false);
              if (callResponse) {
                await this.changeApiCallStatus(currentFormData.id, 1);
                this.checkApiPending('514');
                this.refreshData({ 'cases': currentFormData.case_id })
              } else {
                await this.changeApiCallStatus(currentFormData.id, 0);
                this.checkApiPending('518');
              }
            } catch (error) {
              console.log(error);
              this.syncingAPI.next(false);
              await this.changeApiCallStatus(currentFormData.id, 3);
              this.commonService.showToast('Last submitted Request Failed!, Please try again');
            }
          }
        }
      });
    }
  }

  async callHttpApi(type, url, data) {
    return await this.http.request(type, url, data).toPromise();
  }

  async clearData() {
    localStorage.removeItem('remote_token');
    localStorage.removeItem('userdata');
    localStorage.removeItem('visit_case_data');
    localStorage.removeItem('detais_case_data')
    await this.storageService.remove('database_filled');
    await this.storageService.remove('permissionArray');
    await this.storageService.remove('isVisitFormSync');
    await this.storageService.remove('fields');
    await this.storageService.remove('timeSettings');
    await this.storageService.remove('visit_form');
    await this.storageService.remove('filters');
    await this.storageService.remove('fee_options');
    await this.storageService.remove('visitOutcomes');
    await this.storageService.remove('downloadStatus');
    await this.storageService.remove('historyDownloadStatus');
    await this.storageService.remove('caseId');
    await this.storageService.remove('not_reload_map');
    await this.storageService.remove('permissionAsked');
    this.tables.forEach(async element => {
      let checkSync = ' ;';
      if (element == 'visit_reports' || element == 'api_calls') {
        checkSync = ' where is_sync in (1,3)';
      }
      const deleteQuery = 'delete from ' + element + checkSync;
      let a = await this.database.executeSql(deleteQuery);
    });
  }
}
