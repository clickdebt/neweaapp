import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VisitReportsPage } from './visit-reports.page';

describe('VisitReportsPage', () => {
  let component: VisitReportsPage;
  let fixture: ComponentFixture<VisitReportsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisitReportsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VisitReportsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
