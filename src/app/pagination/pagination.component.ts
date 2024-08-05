import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../post.service';

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

  

  posts  : any[] = [];
  totalPosts: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;
  pageSizes: number[] = [10, 20, 50, 100];
  pages: number[] = [];
  currentPagesIn: number[] = []; // Track currently loaded pages as an array
  loading: boolean = false; // Flag to track if data is loading

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts();
    this.postsContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
  }

  loadPosts(append: boolean = false , prev : boolean = false ,remainingRecord : number = 0,loadedRecords:number = 0): void {
    if (this.loading) return; // Prevent duplicate requests
    this.loading = true;

    if(prev){
      const skip = loadedRecords  ;
      const limit = remainingRecord;

      this.postService.getPosts(limit, skip).subscribe(data => {
        const sortedPosts = [...data.posts].sort((a: any, b: any) => a.id - b.id);
  
          this.posts = [...this.posts, ...sortedPosts];
       
  
        this.totalPosts = data.total;
        this.totalPages = Math.ceil(this.totalPosts / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  
        this.currentPage = this.currentPagesIn[this.currentPagesIn.length-1];
        console.log(this.currentPagesIn);
        this.adjustPaginationScroll();
        this.adjustScroll();
        this.loading = false;
      });

    }
    else{

      const skip = (this.currentPage - 1) * this.pageSize;
      this.postService.getPosts(this.pageSize, skip).subscribe(data => {
        const sortedPosts = [...data.posts].sort((a: any, b: any) => a.id - b.id);
  
        if (append) {
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
  
        console.log(this.currentPagesIn);
        this.adjustPaginationScroll();
        this.adjustScroll();
        this.loading = false;
      });
    }

  }

  onPageSizeChange(event: any): void {

    this.updatePagesOnPageSizeChange(+event.target.value,this.pageSize);

  
    
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage-=1;
      console.log(this.currentPage)
      if (!this.currentPagesIn.includes(this.currentPage)) {
        this.loadPosts(true);
      } else {
        this.adjustScroll();
      }
      
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage+=1;
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
      console.log(`Currently visible page: ${this.currentPage}`);
    }
    const index = this.getIndex(this.currentPagesIn, this.currentPage);
    const previousBoundary = pageHeight * index;
    const nextBoundary = pageHeight * (index + 1);

    // Load the next page if reaching the bottom
    if (scrollTop + clientHeight + 1 >= scrollHeight && !this.loading) {
      if (this.currentPage < this.totalPages && !this.currentPagesIn.includes(this.currentPage + 1)) {
        this.currentPage += 1;
        this.addPageToCurrentPages(this.currentPage);
        this.loadPosts(true);
        this.adjustScroll();
      } else if (this.currentPage >= this.totalPages) {
        console.log("End of the page", "red");
      }
    } else if (this.currentPage > 1 && previousBoundary > scrollTop + clientHeight - 10 && !this.currentPagesIn.includes(this.currentPage - 1)) {
      this.currentPage -= 1;
      this.addPageToCurrentPages(this.currentPage);
      this.loadPosts(true);
      this.adjustScroll();
    } else if (index < this.currentPagesIn.length && nextBoundary < scrollTop + clientHeight + 10 && !this.currentPagesIn.includes(this.currentPage + 1)) {
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
    console.log(container.scrollHeight + " scH " + pageHeight * (index) + "req Height" + " current height " + (container.scrollTop) + " " + this.currentPage);
    container.scrollTop = (pageHeight * index) + 20;
  }

  adjustPaginationScroll(): void {
    const paginationContainer = this.paginationContainer.nativeElement;
    console.log(this.totalPages);
    const pageWidth = paginationContainer.scrollWidth / this.totalPages;
    const targetPosition = pageWidth * (this.currentPage);
    const leftScroll = targetPosition - paginationContainer.clientWidth;

    paginationContainer.scrollLeft = leftScroll;
  }

  updatePagesOnPageSizeChange(newLimit: number,prevPageSize :number): void {
    const totalData = this.totalPosts;
    console.log(prevPageSize+ "psss")
    const loadedRecords = this.currentPagesIn.length * prevPageSize;
    console.log(loadedRecords)
    const newTotalPages = Math.ceil(totalData / newLimit);
    const remainder = loadedRecords % newLimit;

    let newPages: number[] = [];
    let pagesRequired =(loadedRecords / newLimit);

    if(loadedRecords < newLimit){

      let remainingRecord = newLimit % loadedRecords;
      
      this.loadPosts(true,true,remainingRecord,loadedRecords )
      newPages.push(1);
      this.currentPage =1;


    }
    else{

      // Determine pages that can be formed with the new page size
      for (let i = 0; i < pagesRequired; i++) {
        let curentInPage = this.currentPagesIn[i];
  
        const page = i + 1;
        if ( curentInPage <newTotalPages ) {
          newPages.push(curentInPage);
        }
        else{
          if(i==0){
            newPages.push(1);
          }
          else{
            newPages.push( newPages[newPages.length - 1]+1)
          }
        }
      }
    }

  

    this.currentPagesIn = newPages
    this.pageSize = newLimit;
    this.currentPage = this.currentPagesIn[this.currentPagesIn.length-1]
    this.adjustScroll()
    console.log('New Pages:', this.currentPagesIn);
  }
}
