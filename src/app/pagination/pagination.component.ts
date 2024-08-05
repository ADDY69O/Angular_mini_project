import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../post.service';
import { PostsService, ProductResponse, PostResponse } from '../services/api-calling.service';
import { APIResponse } from '../services/api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit {
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

  constructor(private postService: PostService, private apiService: PostsService) {}

  ngOnInit(): void {
    this.loadPosts();
    this.postsContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
  }

  // Method to get the title of a post
  getPostTitle(post: PostResponse): string {
    return post.title || '';
  }

  // Method to get the body of a post
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

        this.adjustPaginationScroll();
        this.adjustScroll();
        this.loading = false;
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

    const totalLoadedPages = this.currentPagesIn.length;
    const pageHeight = scrollHeight / totalLoadedPages;

    const scrollPosition = scrollTop + clientHeight;
    const currentPageIndex = Math.floor(scrollPosition / pageHeight);

    const currentPageVisible = this.currentPagesIn[currentPageIndex];

    if (currentPageVisible !== undefined && this.currentPage !== currentPageVisible) {
      this.currentPage = currentPageVisible;
    }
    const index = this.getIndex(this.currentPagesIn, this.currentPage);
    const previousBoundary = pageHeight * index;
    const nextBoundary = pageHeight * (index + 1);

    if (scrollTop + clientHeight + 1 >= scrollHeight && !this.loading) {
      if (this.currentPage < this.totalPages && !this.currentPagesIn.includes(this.currentPage + 1)) {
        this.currentPage += 1;
        this.addPageToCurrentPages(this.currentPage);
        this.loadPosts(true);
        this.adjustScroll();
      } else if (this.currentPage >= this.totalPages) {
        console.log('End of the page', 'red');
      }
    } else if (
      this.currentPage > 1 &&
      previousBoundary > scrollTop + clientHeight - 10 &&
      !this.currentPagesIn.includes(this.currentPage - 1)
    ) {
      this.currentPage -= 1;
      this.addPageToCurrentPages(this.currentPage);
      this.loadPosts(true);
      this.adjustScroll();
    } else if (
      index < this.currentPagesIn.length &&
      nextBoundary < scrollTop + clientHeight + 10 &&
      !this.currentPagesIn.includes(this.currentPage + 1)
    ) {
      this.currentPage += 1;
      this.addPageToCurrentPages(this.currentPage);
      this.loadPosts(true);
      this.adjustScroll();
    }
  }

  adjustScroll(): void {
    const container = this.postsContainer.nativeElement;
    const pageHeight = container.scrollHeight / this.currentPagesIn.length;
    const index = this.getIndex(this.currentPagesIn, this.currentPage);
    container.scrollTop = pageHeight * index + 20;
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
    let pagesRequired = loadedRecords / newLimit;

    if (loadedRecords < newLimit) {
      let remainingRecord = newLimit % loadedRecords;

      this.loadPosts(true, true, remainingRecord, loadedRecords);
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
    }

    this.currentPagesIn = newPages;
    this.pageSize = newLimit;
    this.currentPage = this.currentPagesIn[this.currentPagesIn.length - 1];
    this.adjustScroll();
  }
}
