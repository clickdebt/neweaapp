import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DvlaPage } from './dvla.page';

describe('DvlaPage', () => {
  let component: DvlaPage;
  let fixture: ComponentFixture<DvlaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DvlaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DvlaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
