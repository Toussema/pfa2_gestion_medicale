import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login/login.component';
import { SignupComponent } from './auth/login/signup/signup.component';
import { HomeComponent } from './dashboard/home/home.component';
import { DisponibiliteComponent } from './dashboard/disponibilite/disponibilite.component';


export const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'disponibilites', component: DisponibiliteComponent },
];