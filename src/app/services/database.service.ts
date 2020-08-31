import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import * as moment from 'moment';
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;
  linkedIds = [];

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private storageService: StorageService,
    public sqlitePorter: SQLitePorter
  ) {
    this.databaseReady = new BehaviorSubject(false);

    this.platform.ready().then(async () => {

      if (this.platform.is('android') || this.platform.is('ios')) {

        this.database = await this.sqlite.create({
          name: 'fieldAgentV3.db',
          location: 'default',
          key: 'u3a5wIA73vmG6ruB'
        });

        const value = await this.storageService.get('database_filled');
        if (value) {
          this.databaseReady.next(true);
        } else {
          this.setUpDatabase();
        }
      }
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
      data TEXT
    );`;

    const visitReports = `CREATE TABLE IF NOT EXISTS visit_reports(
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      case_id INTEGER,
      form_data TEXT,
      created_at DATETIME,
      is_sync INTEGER,
      visit_form_data_id INTEGER
    );`;

    const sql = rdebCases + visitReports;

    const data = await this.sqlitePorter.importSqlToDb(this.database, sql);
    this.databaseReady.next(true);
    await this.storageService.set('database_filled', true);
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
    const values = params.map(item => item.value);
    return this.executeQuery(`INSERT INTO ${tableName} (${fields.toString()}) VALUES (${values.toString()})`);
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
    const sqlStart = `insert or replace INTO rdebt_cases
    ( id, ref, scheme_id, date, d_outstanding, visitcount_total,
      last_allocated_date, custom5, manual_link_id, hold_until, stage_type,
      client_id, current_status_id, current_stage_id, data ) VALUES `;
    data.forEach((values) => {
      const v = encodeURI(JSON.stringify(values));
      sql.push(`${sqlStart} (${values.id}, "${values.ref}", ${values.scheme_id},
        "${values.date}", ${values.d_outstanding}, ${values.visitcount_total},
        "${values.last_allocated_date}", "${values.custom5}", ${values.manual_link_id},
        "${values.hold_until}", "${values.stage.stage_type.stage_type}", ${values.client_id}, ${values.current_status_id},
         ${values.current_stage_id}, "${encodeURI(JSON.stringify(values))}")`);
    });

    const promiseArray = [];
    sql.forEach(async (query) => promiseArray.push(this.executeQuery(query)));
    await Promise.all(promiseArray)
      .then((res: any) => {
        // console.log(res);
      })
      .catch((error) => { });
  }

  async setVisitForm(data) {
    await this.storageService.set('visit_form', data);
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
  async setDownloadStatus(data) {
    await this.storageService.set('downloadStatus', data);
  }
  async getDownloadStatus() {
    return await this.storageService.get('downloadStatus');
  }
}
