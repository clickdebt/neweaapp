import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ArrangementModalPage } from './arrangement-modal.page';

describe('ArrangementModalPage', () => {
  let component: ArrangementModalPage;
  let fixture: ComponentFixture<ArrangementModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArrangementModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArrangementModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
