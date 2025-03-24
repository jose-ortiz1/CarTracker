import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GarageOverviewComponent } from './garage-overview.component';

describe('GarageOverviewComponent', () => {
  let component: GarageOverviewComponent;
  let fixture: ComponentFixture<GarageOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GarageOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GarageOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
