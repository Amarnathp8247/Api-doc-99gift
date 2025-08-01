import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherDetailsComponent } from './voucher-details.component';

describe('VoucherDetailsComponent', () => {
  let component: VoucherDetailsComponent;
  let fixture: ComponentFixture<VoucherDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
