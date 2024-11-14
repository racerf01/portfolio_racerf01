import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';  // Correct imports
import { AboutMeComponent } from './components/about-me/about-me.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';
import { filter } from 'rxjs';  // Correctly import filter

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    AboutMeComponent,
    ProjectsComponent,
    ContactComponent,
    RouterModule  // Use only RouterModule here
  ],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'port';
  isHomePage = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isHomePage = this.router.url === '/' || this.router.url === '/';
    });
  }
}
