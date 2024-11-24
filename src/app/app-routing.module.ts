import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';
import { AppComponent } from './app.component'; // Home component
import { PhotographyComponent } from './components/projects/photography/photography.component';
import { DevelopmentComponent } from './components/projects/development/development.component';
import { DesignComponent } from './components/projects/design/design.component';
import { SideProjectsComponent } from './components/projects/side-projects/side-projects.component';
import { OtherComponent } from './components/projects/other/other.component';

const routes: Routes = [
  { path: '', component: AppComponent },  // Home page (AppComponent)
  { path: 'about', component: AboutComponent },
  { path: 'projects', component: ProjectsComponent, 
    children: [
      { path: 'web-development', component: DevelopmentComponent }, 
      { path: 'graphic-design', component: DesignComponent }, 
      { path: 'photography', component: PhotographyComponent }, 
      { path: 'side-projects', component: SideProjectsComponent }, 
      { path: 'other', component: OtherComponent }, 
    ] 
   },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }  // Redirect any unknown paths to home
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
