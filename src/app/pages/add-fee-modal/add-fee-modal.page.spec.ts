import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddFeeModalPage } from './add-fee-modal.page';

describe('AddFeeModalPage', () => {
  let component: AddFeeModalPage;
  let fixture: ComponentFixture<AddFeeModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFeeModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddFeeModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
