import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VisitFormPage } from './visit-form.page';

describe('VisitFormPage', () => {
  let component: VisitFormPage;
  let fixture: ComponentFixture<VisitFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitFormPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VisitFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
