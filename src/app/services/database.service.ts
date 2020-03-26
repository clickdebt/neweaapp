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
          location: 'default'
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
      client_id INTEGER,
      current_status_id INTEGER,
      current_stage_id INTEGER,
      data TEXT
    );`;

    const visitReports = `CREATE TABLE IF NOT EXISTS visit_reports(
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      case_id INTEGER,
      form_data TEXT,
      created_at TEXT,
      is_sync INTEGER,
      visit_form_data_id INTEGER,
    );`;

    const sql = rdebCases + visitReports;

    const data = await this.sqlitePorter.importSqlToDb(this.database, sql);
    this.databaseReady.next(true);
    await this.storageService.set('database_filled', true);
    const result = await this.select('rdebt_cases');
  }

  async executeQuery(query, params = null) {
    try {
      const result = await this.database.executeSql(query, params);
      return result;
    } catch (error) { }
  }

  async insert(tableName, params = []) {
    const fields = params.map(item => item.name);
    const values = params.map(item => item.value);
    const result = await this.database.executeSql(`INSERT INTO ${tableName} (${fields.toString()}) VALUES (${values.toString()})`);
    return result;
  }

  async setCases(data) {
    const sql = [];
    const sqlStart = `INSERT INTO rdebt_cases
    ( id, ref, scheme_id, date, d_outstanding, visitcount_total,
      last_allocated_date, custom5, manual_link_id, hold_until,
      client_id, current_status_id, current_stage_id, data ) VALUES `;

    data.forEach((values) => {
      sql.push(`${sqlStart} (${values.id}, "${values.ref}", ${values.scheme_id},
        "${values.date}", ${values.d_outstanding}, ${values.visitcount_total},
        "${values.last_allocated_date}", "${values.custom5}", ${values.manual_link_id},
        "${values.hold_until}", ${values.client_id}, ${values.current_status_id},
         ${values.current_stage_id}, "${encodeURI(JSON.stringify(values))}")`);
    });

    const promiseArray = [];
    sql.forEach((query) => promiseArray.push(this.executeQuery(query)));
    await Promise.all(promiseArray)
      .then((res: any) => { })
      .catch((error) => { });
  }

  async setVisitForm(data) {
    this.storageService.set('visit_form', data);
  }

  async setFilterMasterData(data) {
    await this.storageService.set('filters', data);
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
}
