import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ServerSettingsPage } from './server-settings.page';

describe('ServerSettingsPage', () => {
  let component: ServerSettingsPage;
  let fixture: ComponentFixture<ServerSettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerSettingsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ServerSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
