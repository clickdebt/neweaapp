import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PaymentModalPage } from './payment-modal.page';

describe('PaymentModalPage', () => {
  let component: PaymentModalPage;
  let fixture: ComponentFixture<PaymentModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
