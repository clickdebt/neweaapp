import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TakePaymentPage } from './take-payment.page';

describe('TakePaymentPage', () => {
  let component: TakePaymentPage;
  let fixture: ComponentFixture<TakePaymentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakePaymentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TakePaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
