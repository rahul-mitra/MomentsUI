import { SharedModule } from '../shared-module/shared.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from '../home/home.component';
import { WackySpinnerComponent } from './wacky-spinner/wacky-spinner.component';
import { AddMomentsComponent } from './add-moments/add-moments.component';
import { ShowMomentsComponent } from './show-moments/show-moments.component';
import { DndDirective } from './dnd.directive';
import { SafePipe } from './pipes/safe.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WackySpinnerComponent,
    AddMomentsComponent,
    ShowMomentsComponent,
    DndDirective,
    SafePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
