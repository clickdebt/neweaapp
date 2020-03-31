import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OnHoldModalPage } from './on-hold-modal.page';

describe('OnHoldModalPage', () => {
  let component: OnHoldModalPage;
  let fixture: ComponentFixture<OnHoldModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnHoldModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OnHoldModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
