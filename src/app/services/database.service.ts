import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { browserDBInstance } from './browserdb';
import { CaseService } from './case.service';
declare var window: any;
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: any;
  private databaseReady: BehaviorSubject<boolean>;
  public isApiPending: BehaviorSubject<boolean> = new BehaviorSubject(false);
  linkedIds = [];

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private http: HttpClient,
    private storageService: StorageService,
    public sqlitePorter: SQLitePorter,
    private caseService: CaseService
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
      if (value) {
        this.databaseReady.next(true);
        this.checkApiPending();
      } else {
        this.setUpDatabase();
      }
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
      case_markers TEXT,
      case_Summary TEXT,
      Financials TEXT,
      case_details TEXT
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
      case_markers TEXT,
      case_Summary TEXT,
      Financials TEXT,
      case_details TEXT
    );`;

    const visitReports = `CREATE TABLE IF NOT EXISTS visit_reports(
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      case_id INTEGER,
      form_data TEXT,
      created_at DATETIME,
      is_sync INTEGER,
      visit_form_data_id INTEGER
    );`;

    const history = `CREATE TABLE IF NOT EXISTS history(
      id INTEGER PRIMARY KEY ,
      caseid INTEGER,
      document_id INTEGER,
      action TEXT,
      attachment TEXT,
      name TEXT,
      note TEXT,
      time DATETIME
    );`;

    const payment = `CREATE TABLE IF NOT EXISTS payment(
      id INTEGER PRIMARY KEY ,
      caseid INTEGER,
      amount INTEGER,
      payment_type TEXT,
      source_name TEXT,
      date DATETIME
    );`;

    const fees = `CREATE TABLE IF NOT EXISTS fees(
      id INTEGER PRIMARY KEY,
      cf_id INTEGER,
      caseid INTEGER,
      amount INTEGER,
      vat TEXT,
      fee_name TEXT,
      date DATETIME
    );`;

    const document = `CREATE TABLE IF NOT EXISTS document(
      id INTEGER PRIMARY KEY ,
      case_id INTEGER,
      label TEXT,
      action TEXT,
      attachment TEXT,
      time DATETIME
    );`;

    const api_calls = `CREATE TABLE IF NOT EXISTS api_calls(
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      case_id INTEGER,
      url TEXT,
      type TEXT,
      data TEXT,
      is_sync INTEGER,
      created_at DATETIME
    );`;

    // const sql = rdebCases + visitReports + history + payment + document;

    await this.database.executeSql(rdebCases);
    await this.database.executeSql(rdebLinkedCases);
    await this.database.executeSql(visitReports);
    await this.database.executeSql(history);
    await this.database.executeSql(payment);
    await this.database.executeSql(document);
    await this.database.executeSql(api_calls);
    await this.database.executeSql(fees);

    // const data = await this.sqlitePorter.importSqlToDb(this.database, sql);
    this.databaseReady.next(true);
    await this.storageService.set('database_filled', true);
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

  parseCaseData(caseData, linkedCases) {
    caseData.forEach((elem) => {
      if (this.linkedIds.indexOf(elem.id) == -1) {
        // console.log(elem.id);
        elem.linkedCasesTotalBalance = 0;
        // if (elem.debtor_linked_cases != undefined && (elem.linked_cases != '' || elem.debtor_linked_cases != '') {
        elem.linked_cases_group = linkedCases.filter(linked => (
          ((linked.manual_link_id === elem.manual_link_id && linked.manual_link_id !== null) || linked.debtorid === elem.debtorid)
          && (this.linkedIds.indexOf(linked.id) == -1)
        ));
        elem.linked_cases = linkedCases.filter(linked => (
          ((linked.manual_link_id === elem.manual_link_id && linked.manual_link_id !== null) || linked.debtorid === elem.debtorid)
          && linked.id !== elem.id && (this.linkedIds.indexOf(linked.id) == -1)
        ));
        if (elem.linked_cases != '') {
          (elem.linked_cases).forEach(l => {
            l.parent_case_id = elem.id;
            this.linkedIds.push(l.id);
          });
          const linked = elem.linked_cases.map(l => l.id);
          caseData = caseData.filter(c => {
            return (linked.indexOf(c.id) == -1);
          });
          elem.linked_cases = Object.values(elem.linked_cases);
          elem.linkedCasesTotalBalance = parseFloat(elem.d_outstanding) + elem.linked_cases.reduce((accumulator, currentValue) => {
            return accumulator + parseFloat(currentValue.d_outstanding);
          }, 0);
          elem.linkedCasesTotalBalance = (elem.linkedCasesTotalBalance).toFixed(2);
        }
      } else {
        caseData = caseData.filter(cd => cd.id != elem.id);
      }
    });
    return caseData;
  }

  async setCases(data, linked) {
    // const cases = this.parseCaseData(data, linked);
    const sql = [];
    const sqlLinked = [];
    const sqlStart = `insert or replace INTO rdebt_cases
    ( id, ref, scheme_id, date, d_outstanding, visitcount_total,
      last_allocated_date, custom5, manual_link_id, hold_until, stage_type,
      client_id, current_status_id, current_stage_id, address_postcode,enforcement_addresses_postcode,
      debtor_name, data ) VALUES `;
    data.forEach((values) => {
      console.log(values);

      const v = encodeURI(JSON.stringify(values));
      sql.push(`${sqlStart} (${values.id}, "${values.ref}", ${values.scheme_id},
        "${values.date}", ${values.d_outstanding}, ${values.visitcount_total},
        "${values.last_allocated_date}", "${values.custom5}", ${values.manual_link_id},
        "${values.hold_until}", "${values.stage.stage_type.stage_type}", ${values.client_id}, ${values.current_status_id},
         ${values.current_stage_id},"${values.debtor.addresses[0].address_postcode}",
         "${values.debtor.enforcement_addresses[0].address_postcode}","${values.debtor.debtor_name}",
          "${encodeURI(JSON.stringify(values))}")`);
    });

    const sqlLinkedStart = `insert or replace INTO rdebt_linked_cases
    ( id, ref, scheme_id, debtor_id, date, d_outstanding, visitcount_total,
      last_allocated_date, custom5, manual_link_id, hold_until, stage_type,
      client_id, current_status_id, current_stage_id,address_postcode,enforcement_addresses_postcode,
      debtor_name, data ) VALUES `;
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
    sql.forEach(async (query) => promiseArray.push(this.executeQuery(query)));
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
      const promiseArray = [];
      for (const currentCase of data.cases) {
        // console.log(currentCase);

        const caseSummary = {
          clientRef: currentCase.ref,
          clientName: currentCase.client____title,
          scheme: currentCase.scheme____title,
          stage: currentCase.stage____name,
          status: currentCase.current_status____status_name,
          lastVisitDate: currentCase.last_visit_date ? currentCase.last_visit_date : '-'
        };
        const sqlStart = `UPDATE rdebt_cases SET case_markers="${this.getEncodeString(currentCase.markers_data)}",
        case_Summary="${this.getEncodeString(caseSummary)}",
        Financials="${this.getEncodeString(currentCase.case_financials)}",
        case_details="${this.getEncodeString(currentCase.scheme_panel_data)}" WHERE id = ${currentCase.id}`;
        promiseArray.push(this.executeQuery(sqlStart));
      }

      await this.storeToSqlite('history', data.history);
      await this.storeToSqlite('payment', data.payments);
      await this.storeToSqlite('document', data.documents);
      await this.storeToSqlite('fees', data.fees);

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
  async getDownloadStatus() {
    return await this.storageService.get('downloadStatus');
  }

  async getOfflinecaseDetails(id) {
    const caseDetails: any = {
    };
    let query = `select case_markers,case_Summary,Financials,case_details from rdebt_cases where id = ${id}`;

    let result = await this.executeQuery(query);
    let finalResult = await this.extractResult(result);

    caseDetails.caseMarkers = this.getDecodeString(finalResult[0].case_markers);
    caseDetails.case_Summary = this.getDecodeString(finalResult[0].case_Summary);
    caseDetails.Financials = this.getDecodeString(finalResult[0].Financials);
    caseDetails.case_details = this.getDecodeString(finalResult[0].case_details);

    query = `select * from history where caseid = ${id}`;
    result = await this.executeQuery(query);
    finalResult = await this.extractResult(result);
    caseDetails.history = finalResult;

    query = `select * from payment where caseid = ${id}`;
    result = await this.executeQuery(query);
    finalResult = await this.extractResult(result);
    caseDetails.paymentData = finalResult;

    query = `select * from document where case_id = ${id}`;
    result = await this.executeQuery(query);
    finalResult = await this.extractResult(result);
    caseDetails.caseDocuments = finalResult;

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
  savePendingApi(val) {
    if (val) {
      this.getApiStored().then(async (data) => {
        const arr = [];
        if (data) {
          var currentFormData;
          for (let i = 0; i < data.rows.length; i++) {
            currentFormData = data.rows.item(i);
            let form_data = JSON.parse(decodeURI(currentFormData.data));
            this.http.request(currentFormData.type, localStorage.getItem('server_url') + currentFormData.url, { body: form_data })
              .subscribe((res) => {
                if (res) {
                  this.markApiCallSuccess(currentFormData.id);
                  this.getcaseDetailsData(currentFormData.case_id)
                }
              });
          }
        }
      });
    }
  }

  getcaseDetailsData(case_id) {
    this.caseService.getCaseDetailById(case_id).subscribe((data) => {
      this.setcaseDetails(data);
    })
  }
}
