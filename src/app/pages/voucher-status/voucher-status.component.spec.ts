import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherStatusComponent } from './voucher-status.component';

describe('VoucherStatusComponent', () => {
  let component: VoucherStatusComponent;
  let fixture: ComponentFixture<VoucherStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
