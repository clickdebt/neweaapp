import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VrmSearchPage } from './vrm-search.page';

describe('VrmSearchPage', () => {
  let component: VrmSearchPage;
  let fixture: ComponentFixture<VrmSearchPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VrmSearchPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VrmSearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
