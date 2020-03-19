import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PanicModalPage } from './panic-modal.page';

describe('PanicModalPage', () => {
  let component: PanicModalPage;
  let fixture: ComponentFixture<PanicModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanicModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PanicModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
