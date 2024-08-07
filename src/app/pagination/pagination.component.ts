import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ApiPostService, ProductResponse, PostResponse } from '../services/api-calling.service';
import { APIResponse } from '../services/api.service';
import { debounceTime } from 'rxjs/operators';  // Import debounceTime from rxjs
import { fromEvent, Subscription, timer } from 'rxjs';

import { PaginationInfiniteScrollComponentComponent } from '../pagination-infinite-scroll-component/pagination-infinite-scroll-component.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['../assets/style.css', './pagination.component.css' ]
})
export class PaginationComponent extends PaginationInfiniteScrollComponentComponent implements OnInit, OnDestroy {


  private scrollSubscription!: Subscription;


  constructor(apiService: ApiPostService) {
    super(apiService);  // Correctly call the base class constructor
  }
  ngOnInit(): void {
    this.loadData();
    // Debounce the scroll event handler
    const scroll$ = fromEvent(this.postsContainer.nativeElement, 'scroll');
    this.scrollSubscription = scroll$.pipe(
      
      debounceTime(100)
      
    ).subscribe(() => this.onScroll());
  }



  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  

  override loadData(
    prev: boolean = false,
    remainingRecord: number = 0,
    loadedRecords: number = 0, 

  ): void {


    if (this.loading) return;
    this.loading = true;

    // Calculate the limit and the skip
    const skip = prev ? loadedRecords : (this.currentPage - 1) * this.pageSize;
    const limit = prev ? remainingRecord : this.pageSize;


    // It Calls the api
    this.apiService.getPost(limit, skip).subscribe(
      (response) => {
        this.addData(response.data)
       
       
      },
      (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
      }
    );
  }

  

}


