import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaginationComponent } from './pagination/pagination.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,PaginationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pagination';
}
