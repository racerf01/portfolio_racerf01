import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  showLinks: boolean = true;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Check if the current route is a child of 'projects'
      const currentRoute = this.route.firstChild?.snapshot.routeConfig?.path;
      // Hide the links if any child route is active
      this.showLinks = !currentRoute;
    });
  }
}
