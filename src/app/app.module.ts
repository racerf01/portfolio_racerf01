import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './components/about/about.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';
import { PhotographyComponent } from './components/projects/photography/photography.component';
import { DevelopmentComponent } from './components/projects/development/development.component';
import { DesignComponent } from './components/projects/design/design.component';
import { SideProjectsComponent } from './components/projects/side-projects/side-projects.component';
import { OtherComponent } from './components/projects/other/other.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    ProjectsComponent,
    ContactComponent,
    PhotographyComponent,
    DevelopmentComponent,
    DesignComponent,
    SideProjectsComponent,
    OtherComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
