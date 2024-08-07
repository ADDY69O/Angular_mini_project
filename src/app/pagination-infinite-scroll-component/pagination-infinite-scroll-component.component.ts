import { Component } from '@angular/core';
import { debounceTime, fromEvent, Subscription } from "rxjs";
import { ApiPostService, PostResponse, ProductResponse } from "../services/api-calling.service";

import { ElementRef, ViewChild } from "@angular/core";


@Component({
  selector: 'app-pagination-infinite-scroll-component',
  standalone: true,
  imports: [],
  templateUrl: './pagination-infinite-scroll-component.component.html',
  styleUrl: './pagination-infinite-scroll-component.component.css'
})
export class PaginationInfiniteScrollComponentComponent {
  @ViewChild('postsContainer', { static: true }) postsContainer!: ElementRef;
  @ViewChild('paginationContainer', { static: true }) paginationContainer!: ElementRef;


    apiService: ApiPostService;
    posts: PostResponse[] = [];
    totalPosts: number = 0;
    pageSize: number = 10;
    currentPage: number = 1;
    totalPages: number = 0;
    pageSizes: number[] = [10, 20, 50, 100];
    pages: number[] = [];
    currentPagesIn: number[] = [];
    loading: boolean = false;

  
    constructor(apiService: ApiPostService) {
        this.apiService = apiService;
    }
   
  
    getPostTitle(post: PostResponse): string {
      return post.title || '';
    }
  
    getPostBody(post: PostResponse): string {
      return post.body || '';
    }


    addData (data: ProductResponse){
      const sortedPosts = [...data.posts].sort((a, b) => a.id - b.id);

       
      this.posts = [...this.posts, ...sortedPosts];
    

    this.totalPosts = data.total;
    this.totalPages = Math.ceil(this.totalPosts / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    if (!this.currentPagesIn.includes(this.currentPage)) {
      this.addPageToCurrentPages(this.currentPage);
    }

    // Delay the scroll adjustment to ensure data is loaded
    setTimeout(() => {
      this.adjustPaginationScroll();
      this.adjustScroll();
      this.loading = false;
    }, 0);
    }
  
    loadData(
      prev: boolean = false,
      remainingRecord: number = 0,
      loadedRecords: number = 0, 
    ): void {}
  
    onPageSizeChange(event: Event): void {
      const target = event.target as HTMLSelectElement;
      if (target) {
        const newSize = +target.value;
        this.updatePagesOnPageSizeChange(newSize, this.pageSize);
        this.totalPages = Math.ceil(this.totalPosts / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.adjustPaginationScroll()
      } else {
        console.error('Event target is not an HTMLSelectElement');
      }
    }
  
    prevPage(): void {
        
      if (this.currentPage > 1) {
        this.currentPage -= 1;
        if (!this.currentPagesIn.includes(this.currentPage)) {
          this.loadData( );
        } else {
          this.adjustScroll();
        }
      }
    }
  
    nextPage(): void {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
        if (!this.currentPagesIn.includes(this.currentPage)) {
          this.loadData();
        } else {
          this.adjustScroll();
        }
      }
    }
  
    goToPage(page: number): void {
      if (page !== this.currentPage) {
        this.currentPage = page;
        if (!this.currentPagesIn.includes(this.currentPage)) {
          this.loadData(false,0,0);
        } else {
          this.adjustScroll();
        }
        this.adjustPaginationScroll();
      }
    }
  
    getIndex<T>(array: T[], item: T): number {
      return array.indexOf(item);
    }
  
    addPageToCurrentPages(page: number): void {
      if (!this.currentPagesIn.includes(page)) {
        this.currentPagesIn.push(page);
        this.sortPages();
      }
    }
  
    sortPages(): void {
      this.currentPagesIn.sort((a, b) => a - b);
    }
  
    onScroll(): void {
      const container = this.postsContainer.nativeElement;
      const { scrollTop, clientHeight, scrollHeight } = container;
     
  
      const totalLoadedPages = this.currentPagesIn.length;
      const pageHeight = scrollHeight / totalLoadedPages;
  
      const scrollPosition = scrollTop + clientHeight;
      const currentPageIndex = Math.floor(scrollPosition / pageHeight);
  
      const currentPageVisible = this.currentPagesIn[currentPageIndex];
  
      if (currentPageVisible !== undefined && this.currentPage !== currentPageVisible) {
        this.currentPage = currentPageVisible;
        this.adjustPaginationScroll()
      }
  
      const index = this.getIndex(this.currentPagesIn, this.currentPage);
      const previousBoundary = pageHeight * index;
      const nextBoundary = pageHeight * (index + 1);
  
      if (scrollTop + clientHeight + 1 > scrollHeight && !this.loading) {
        if (this.currentPage < this.totalPages && !this.currentPagesIn.includes(this.currentPage + 1)) {
          this.currentPage += 1;
          this.addPageToCurrentPages(this.currentPage);
          this.loadData( false,0,0);
        } else if (this.currentPage >= this.totalPages) {
          console.log('End of the page', 'red');
        }
      }
      else if (
        index < this.currentPagesIn.length &&
        nextBoundary < scrollTop + clientHeight + 105 &&
        !this.currentPagesIn.includes(this.currentPage + 1)
      ) {
        this.currentPage += 1;
        this.addPageToCurrentPages(this.currentPage);
        this.loadData(false,0,0);
        this.adjustScroll();
      } else if (
        this.currentPage > 1 &&
        previousBoundary > scrollTop + clientHeight - 15 &&
        !this.currentPagesIn.includes(this.currentPage - 1)
      ) {
        this.currentPage -= 1;
        this.addPageToCurrentPages(this.currentPage);
        this.loadData(false,0,0);
        this.adjustScroll();
      }
    }
  
    adjustScroll(): void {
 
      const container = this.postsContainer.nativeElement;
      
      const pageHeight = container.scrollHeight / this.currentPagesIn.length;
    
      const index = this.getIndex(this.currentPagesIn, this.currentPage);
      
      container.scrollTop = (pageHeight * index) + 15;
    }
  
    adjustPaginationScroll(): void {
      const paginationContainer = this.paginationContainer.nativeElement;
      const pageWidth = paginationContainer.scrollWidth / this.totalPages;
      const targetPosition = pageWidth * this.currentPage;
      const leftScroll = targetPosition - paginationContainer.clientWidth;
  
      paginationContainer.scrollLeft = leftScroll;
    }
  
    updatePagesOnPageSizeChange(newLimit: number, prevPageSize: number): void {
      const totalData = this.totalPosts;
      const loadedRecords = this.currentPagesIn.length * prevPageSize;
      const newTotalPages = Math.ceil(totalData / newLimit);
      const remainder = loadedRecords % newLimit;
  
      let newPages: number[] = [];
      let pagesRequired = Math.ceil(loadedRecords / newLimit);
      let pagesNeeded =  (pagesRequired *newLimit) - loadedRecords;
   
      if (loadedRecords < newLimit) {
        let remainingRecord = newLimit % loadedRecords;
        
        this.loadData( true, remainingRecord, loadedRecords);
        newPages.push(1);
        this.currentPage = 1;
      } else {
        
        for (let i = 0; i < pagesRequired; i++) {
          let curentInPage = this.currentPagesIn[i];
          const page = i + 1;
          if (curentInPage < newTotalPages) {
            newPages.push(curentInPage);
          } else {
            if (i === 0) {
              newPages.push(1);
            } else {
              newPages.push(newPages[newPages.length - 1] + 1);
            }
          }
        }
        if(pagesNeeded > 0){
          let newSkip = loadedRecords;
          let newLimit = pagesNeeded;
          console.log("new Skip " +newSkip + " new limit " + newLimit)
          this.loadData( true, newLimit, newSkip);
          this.currentPage = newPages[newPages.length - 1];
  
  
        }
        
      }
  
      this.currentPagesIn = newPages;
      this.pageSize = newLimit;
      this.currentPage = this.currentPagesIn[this.currentPagesIn.length - 1];
      this.adjustScroll();
    }



}
