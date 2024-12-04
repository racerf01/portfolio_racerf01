import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrl: './development.component.scss'
})
export class DevelopmentComponent {
  constructor(private router: Router) {}

  // Method to go back to the 'projects' page
  goBackToProjects() {
    this.router.navigate(['/projects']);
  }
}
