import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.scss']
})
export class DesignComponent {

  constructor(private router: Router) {}

  // Method to go back to the 'projects' page
  goBackToProjects() {
    this.router.navigate(['/projects']);
  }
}
