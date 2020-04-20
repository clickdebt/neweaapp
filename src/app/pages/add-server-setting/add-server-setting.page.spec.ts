import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddServerSettingPage } from './add-server-setting.page';

describe('AddServerSettingPage', () => {
  let component: AddServerSettingPage;
  let fixture: ComponentFixture<AddServerSettingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddServerSettingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddServerSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
