import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JoblistMobilePage } from './joblist-mobile.page';

describe('JoblistMobilePage', () => {
  let component: JoblistMobilePage;
  let fixture: ComponentFixture<JoblistMobilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoblistMobilePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JoblistMobilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
