import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationInfiniteScrollComponentComponent } from './pagination-infinite-scroll-component.component';

describe('PaginationInfiniteScrollComponentComponent', () => {
  let component: PaginationInfiniteScrollComponentComponent;
  let fixture: ComponentFixture<PaginationInfiniteScrollComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationInfiniteScrollComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationInfiniteScrollComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
