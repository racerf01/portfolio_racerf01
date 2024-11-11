import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'port';
  isHomePage = true; // Default to true if the initial page is home

  // Method to set the active page
  setPage(page: string): void {
    this.isHomePage = (page === 'home');
  }
}
