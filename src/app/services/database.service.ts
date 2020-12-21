import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { browserDBInstance } from './browserdb';
import { CaseService } from './case.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
declare var window: any;
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: any;
  private databaseReady: BehaviorSubject<boolean>;
  public isApiPending: BehaviorSubject<boolean> = new BehaviorSubject(false);
  linkedIds = [];
  version = 2;
  tables = ['rdebt_cases', 'rdebt_linked_cases', 'history', 'api_calls'];
  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private http: HttpClient,
    private storageService: StorageService,
    public sqlitePorter: SQLitePorter,
    private caseService: CaseService,
    private networkService: NetworkService
  ) {
    this.databaseReady = new BehaviorSubject(false);

    this.platform.ready().then(async () => {

      if (!this.platform.is('android') || !this.platform.is('ios')) {
        console.log('window');

        let db = window.openDatabase('fieldAgentV3.db', '1.0', 'DEV', 5 * 1024 * 1024);
        this.database = browserDBInstance(db);
      } else {
        console.log('app');

        this.database = await this.sqlite.create({
          name: 'fieldAgentV3.db',
          location: 'default',
          key: 'u3a5wIA73vmG6ruB'
        });
      }
      const value = await this.storageService.get('database_filled');
      const storageVersion = await this.storageService.get('version');
      if (value && storageVersion && storageVersion == this.version) {
        this.databaseReady.next(true);
        this.checkApiPending();
      } else {
        this.setUpDatabase();
      }
      this.networkService.onNetworkChange().subscribe((response) => {
        if (response === 1) {
          this.isApiPending.subscribe(res => {
            this.savePendingApi(res);
          })
        }
      });
      this.isApiPending.subscribe(res => {
        this.savePendingApi(res);
      })

    }).catch((error) => { });
  }

  async setUpDatabase() {
    const rdebCases = `CREATE TABLE IF NOT EXISTS rdebt_cases(
      id INTEGER PRIMARY KEY,
      ref TEXT,
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
      let a = await this.database.executeSql(deleteQuery);
    });
    await this.storageService.clearAll();

    await this.database.executeSql(rdebCases);
    await this.database.executeSql(rdebLinkedCases);
    await this.database.executeSql(history);
    await this.database.executeSql(api_calls);

    this.databaseReady.next(true);
    await this.storageService.set('database_filled', true);
    await this.storageService.set('version', this.version)
    this.checkApiPending();
  }

  async executeQuery(query, params = null) {
    try {
      const result = await this.database.executeSql(query, params);
      // console.log('exexute query', result);

      return result;
    } catch (error) {
      // console.log('error', error, query);
    }
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
    return this.executeQuery(query);
  }

  async setCases(data, linked) {
    // const cases = this.parseCaseData(data, linked);
    const sql = [];
    const sqlLinked = [];
    const sqlStart = `insert or replace INTO rdebt_cases
    ( id, ref, scheme_id, debtor_id, date, d_outstanding, visitcount_total,
      last_allocated_date, custom5, manual_link_id, hold_until, stage_type,
      client_id, current_status_id, current_stage_id, address_postcode,
      enforcement_addresses_postcode, debtor_name,  data ) VALUES `;
    data.forEach((values) => {

      const v = encodeURI(JSON.stringify(values));
      const query = `${sqlStart} (${values.id}, "${values.ref}", ${values.scheme_id},  ${values.debtor_id},
          "${values.date}", ${values.d_outstanding}, ${values.visitcount_total},
          "${values.last_allocated_date}", "${values.custom5}", ${values.manual_link_id},
          "${values.hold_until}", "${values.stage.stage_type.stage_type}", ${values.client_id}, ${values.current_status_id},
          ${values.current_stage_id},"${values.debtor.addresses[0].address_postcode}",
          "${values.debtor.enforcement_addresses[0].address_postcode}","${values.debtor.debtor_name}",
            "${encodeURI(JSON.stringify(values))}")`;
      sql.push(query);
      this.executeQuery(query);

    });

    const sqlLinkedStart = `insert or replace INTO rdebt_linked_cases
    ( id, ref, scheme_id, debtor_id, date, d_outstanding, visitcount_total,
      last_allocated_date, custom5, manual_link_id, hold_until, stage_type,
      client_id, current_status_id, current_stage_id, address_postcode,
      enforcement_addresses_postcode, debtor_name, data ) VALUES `;
    linked.forEach((values) => {
      const v = encodeURI(JSON.stringify(values));
      sqlLinked.push(`${sqlLinkedStart} (${values.id}, "${values.ref}", ${values.scheme_id}, ${values.debtor_id},
        "${values.date}", ${values.d_outstanding}, ${values.visitcount_total},
        "${values.last_allocated_date}", "${values.custom5}", ${values.manual_link_id},
        "${values.hold_until}", "${values.stage.stage_type.stage_type}", ${values.client_id}, ${values.current_status_id},
         ${values.current_stage_id},"${values.debtor.addresses[0].address_postcode}",
         "${values.debtor.enforcement_addresses[0].address_postcode}","${values.debtor.debtor_name}",
          "${encodeURI(JSON.stringify(values))}")`);
    });

    const promiseArray = [];
    // sql.forEach(async (query) => promiseArray.push(this.executeQuery(query)));
    sqlLinked.forEach(async (query) => promiseArray.push(this.executeQuery(query)));
    await Promise.all(promiseArray)
      .then((res: any) => {
        // console.log(res);
      })
      .catch((error) => { });
  }

  async storeToSqlite(tableName, entries) {
    try {
      const promiseArray = [];
      for (const entrie of entries) {
        const params = Object.entries(entrie).map(([name, value]) => {
          if (typeof value === 'object') {
            value = JSON.stringify(value);
          }
          if (typeof value === 'string' && value.includes(`'`)) {
            value = value.replace(/'/g, `''`);
          }
          return ({ name, value });
        });
        promiseArray.push(this.insert(tableName, params));
      }
      return await Promise.all(promiseArray);
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
      console.log(data);

      const promiseArray = [];
      for (const currentCase of data.cases) {
        // console.log(currentCase);
        const sqlStart = `UPDATE rdebt_cases SET 
        arranagement="${this.getEncodeString(currentCase.arranagement)}" 
        WHERE id = ${currentCase.id}`;
        promiseArray.push(this.executeQuery(sqlStart));
      }

      await this.storeToSqlite('history', data.history);
      await this.setvisitOutcomes(data.exitCodeData);
      await Promise.all(promiseArray)
        .then((res: any) => {
          console.log(res);
        })
        .catch((error) => {
          console.log(error);

        });
    } catch (r) {
      console.log(r);
    }
  }

  async setVisitForm(data) {
    await this.storageService.set('visit_form', data);
  }
  async setFeeOptions(data) {
    await this.storageService.set('fee_options', data.data);
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

  async getOfflinecaseDetails(id) {
    const caseDetails: any = {
    };
    let query = `select * from rdebt_cases where id = ${id}`;

    let result = await this.executeQuery(query);
    let finalResult = await this.extractResult(result);

    caseDetails.data = this.getDecodeString(finalResult[0].data);
    caseDetails.arranagement = this.getDecodeString(finalResult[0].arranagement);

    query = `select * from history where caseid = ${id} order by id desc`;
    result = await this.executeQuery(query);
    finalResult = await this.extractResult(result);
    caseDetails.history = finalResult;

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
    console.log('va', val);

    this.isApiPending.next(val);
  }
  checkApiPending() {
    this.getApiStored().then(data => {
      if (data.rows.length > 0) {
        this.isApiPending.next(true);
      }
    })
  }
  async getApiStored() {
    const query = "select * from api_calls where is_sync = 0"
    return this.executeQuery(query, []);
  }
  markApiCallSuccess(id) {
    const updateQuery = `update api_calls set is_sync = 1 where id = ${id}`;
    return this.executeQuery(updateQuery);
  }
  async savePendingApi(val) {
    if (val && this.networkService.getCurrentNetworkStatus() === 1) {
      this.getApiStored().then(async (data) => {
        const arr = [];
        if (data) {
          var currentFormData;
          for (let i = 0; i < data.rows.length; i++) {
            currentFormData = data.rows.item(i);
            let form_data = JSON.parse(decodeURI(currentFormData.data));
            let callResponse = await this.callHttpApi(currentFormData.type, localStorage.getItem('server_url') + currentFormData.url, { body: form_data });
            if (callResponse) {
              this.markApiCallSuccess(currentFormData.id);
              this.getcaseDetailsData(currentFormData.case_id)
            }
          }
        }
      });
    }
  }

  async callHttpApi(type, url, data) {
    return await this.http.request(type, url, data).toPromise();
  }

  getcaseDetailsData(case_id) {
    this.caseService.getCaseDetailById(case_id).subscribe((data) => {
      this.setcaseDetails(data);
    })
  }

  clearData() {
    this.tables.forEach(async element => {
      let checkSync = ' ;';
      if (element == 'visit_reports' || element == 'api_calls') {
        checkSync = 'where is_sync=1';
      }
      const deleteQuery = 'delete from ' + element + checkSync;
      let a = await this.database.executeSql(deleteQuery);
    });
  }
}
