import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewPaymentsPage } from './view-payments.page';

describe('ViewPaymentsPage', () => {
  let component: ViewPaymentsPage;
  let fixture: ComponentFixture<ViewPaymentsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewPaymentsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewPaymentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
