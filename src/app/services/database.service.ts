import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './storage.service';
import { BehaviorSubject } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';

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
    }).catch((error) => console.log('Error :: ', error));
  }

  async setUpDatabase() {
    const sql = `CREATE TABLE IF NOT EXISTS developer(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,skill TEXT,yearsOfExperience INTEGER);
    INSERT INTO developer(name, skill, yearsOfExperience) VALUES ('Simon', 'Ionic', '4');
    INSERT INTO developer(name, skill, yearsOfExperience) VALUES ('Jorge', 'Firebase', '2');
    INSERT INTO developer(name, skill, yearsOfExperience) VALUES ('Max', 'Startup', '5');`;

    const data = await this.sqlitePorter.importSqlToDb(this.database, sql);
    console.log('--data--', data);
    this.databaseReady.next(true);
    await this.storageService.set('database_filled', true);
    const result = await this.select('developer');
    console.log('--result--', result);
  }

  async executeQuery(query, params = []) {
    const result = await this.database.executeSql(query, params);
    return result;
  }

  async insert(tableName, params = []) {
    const fields = params.map(item => item.name);
    const values = params.map(item => item.value);
    const result = await this.database.executeSql(`INSERT INTO ${tableName} (${fields.toString()}) values (${values.toString()})`);
    return result;
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
