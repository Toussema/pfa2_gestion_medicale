import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionRendezvousComponent } from './gestion-rendezvous.component';

describe('GestionRendezvousComponent', () => {
  let component: GestionRendezvousComponent;
  let fixture: ComponentFixture<GestionRendezvousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionRendezvousComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionRendezvousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
