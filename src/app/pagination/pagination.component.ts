import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../post.service';
import { PostsService, ProductResponse, PostResponse } from '../services/api-calling.service';
import { APIResponse } from '../services/api.service';
import { debounceTime } from 'rxjs/operators';  // Import debounceTime from rxjs
import { fromEvent, Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnDestroy {
  @ViewChild('postsContainer', { static: true }) postsContainer!: ElementRef;
  @ViewChild('paginationContainer', { static: true }) paginationContainer!: ElementRef;

  posts: PostResponse[] = [];
  totalPosts: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;
  pageSizes: number[] = [10, 20, 50, 100];
  pages: number[] = [];
  currentPagesIn: number[] = [];
  loading: boolean = false;
  private scrollSubscription!: Subscription;

  constructor(private postService: PostService, private apiService: PostsService) {}

  ngOnInit(): void {
    this.loadPosts();
    // Debounce the scroll event handler
    const scroll$ = fromEvent(this.postsContainer.nativeElement, 'scroll');
    this.scrollSubscription = scroll$.pipe(
      
      debounceTime(100)
      
      // Debounce with a delay of 300ms
    ).subscribe(() => this.onScroll());
  }

  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  getPostTitle(post: PostResponse): string {
    return post.title || '';
  }

  getPostBody(post: PostResponse): string {
    return post.body || '';
  }

  loadPosts(
    append: boolean = false,
    prev: boolean = false,
    remainingRecord: number = 0,
    loadedRecords: number = 0
  ): void {
    if (this.loading) return;
    this.loading = true;

    const skip = prev ? loadedRecords : (this.currentPage - 1) * this.pageSize;
    const limit = prev ? remainingRecord : this.pageSize;

    this.postService.getPosts(limit, skip).subscribe(
      (response) => {
        const data = response.data;
        const sortedPosts = [...data.posts].sort((a, b) => a.id - b.id);

        if (append || prev) {
          this.posts = [...this.posts, ...sortedPosts];
        } else {
          this.posts = sortedPosts;
        }

        this.totalPosts = data.total;
        this.totalPages = Math.ceil(this.totalPosts / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

        if (!this.currentPagesIn.includes(this.currentPage)) {
          this.addPageToCurrentPages(this.currentPage);
        }
        console.log(this.currentPagesIn + "array ✔️✔️✔️")
        // Delay the scroll adjustment to ensure data is loaded
        setTimeout(() => {
          this.adjustPaginationScroll();
          this.adjustScroll();
          this.loading = false;
        }, 0);
      },
      (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
      }
    );
  }

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
        this.loadPosts(true);
      } else {
        this.adjustScroll();
      }
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      if (!this.currentPagesIn.includes(this.currentPage)) {
        this.loadPosts(true);
      } else {
        this.adjustScroll();
      }
    }
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      if (!this.currentPagesIn.includes(this.currentPage)) {
        this.loadPosts(true);
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
    console.log(`Scroll Top: ${scrollTop}, Scroll Height: ${scrollHeight}, Client Height: ${clientHeight}`);

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
        this.loadPosts(true);
      } else if (this.currentPage >= this.totalPages) {
        console.log('End of the page', 'red');
      }
    } else if (
      this.currentPage > 1 &&
      previousBoundary > scrollTop + clientHeight - 25 &&
      !this.currentPagesIn.includes(this.currentPage - 1)
    ) {
      this.currentPage -= 1;
      this.addPageToCurrentPages(this.currentPage);
      this.loadPosts(true);
      this.adjustScroll();
    } else if (
      index < this.currentPagesIn.length &&
      nextBoundary < scrollTop + clientHeight + 15 &&
      !this.currentPagesIn.includes(this.currentPage + 1)
    ) {
      this.currentPage += 1;
      this.addPageToCurrentPages(this.currentPage);
      this.loadPosts(true);
      this.adjustScroll();
    }
  }

  adjustScroll(): void {
    console.trace();
    const container = this.postsContainer.nativeElement;
    console.log(`Scroll Height: ${container.scrollHeight}`);
    console.log(`Current Pages in: ${this.currentPagesIn}`);
    console.log(`Current Pages: ${this.currentPagesIn.length}`);
    const pageHeight = container.scrollHeight / this.currentPagesIn.length;
    console.log(`Page Height: ${pageHeight}`);
    const index = this.getIndex(this.currentPagesIn, this.currentPage);
    console.log(`Index: ${index}`);
    console.log(`Required Height: ${pageHeight * index}`);
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
    let pagesRequired = Math.floor(loadedRecords / newLimit);
    console.log("Pages Required : " + pagesRequired);
    if (loadedRecords < newLimit) {
      let remainingRecord = newLimit % loadedRecords;
      
      this.loadPosts(true, true, remainingRecord, loadedRecords);
      newPages.push(1);
      this.currentPage = 1;
    } else {
      console.log("Inside");
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
    }

    this.currentPagesIn = newPages;
    this.pageSize = newLimit;
    this.currentPage = this.currentPagesIn[this.currentPagesIn.length - 1];
    this.adjustScroll();
  }
}
