import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MapViewPage } from './map-view.page';

describe('MapViewPage', () => {
  let component: MapViewPage;
  let fixture: ComponentFixture<MapViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MapViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
