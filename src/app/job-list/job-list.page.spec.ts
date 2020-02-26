import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JobListPage } from './job-list.page';

describe('JobListPage', () => {
  let component: JobListPage;
  let fixture: ComponentFixture<JobListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JobListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
