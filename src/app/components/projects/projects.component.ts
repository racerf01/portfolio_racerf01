import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  showLinks: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Check if the current URL matches exactly '/projects'
      const currentUrl = this.router.url;
      this.showLinks = currentUrl === '/projects'; // Match the exact route
    });

    // Perform an initial check in case the component loads directly on '/projects'
    this.showLinks = this.router.url === '/projects';
  }
}
