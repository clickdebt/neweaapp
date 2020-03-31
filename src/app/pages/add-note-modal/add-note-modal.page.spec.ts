import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddNoteModalPage } from './add-note-modal.page';

describe('AddNoteModalPage', () => {
  let component: AddNoteModalPage;
  let fixture: ComponentFixture<AddNoteModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNoteModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddNoteModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
