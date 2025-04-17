import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login/login.component';
import { SignupComponent } from './auth/login/signup/signup.component';
import { HomeComponent } from './dashboard/home/home.component';
import { DisponibiliteComponent } from './dashboard/disponibilite/disponibilite.component';
import { RendezVousComponent } from './dashboard/rendez-vous/rendez-vous.component';
import { DoctorsComponent } from './dashboard/doctors/doctors.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { DocumentsComponent } from './dashboard/documents/documents.component';


export const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'disponibilites', component: DisponibiliteComponent },
  { path: 'rendez-vous', component: RendezVousComponent },
  { path: 'doctors', component: DoctorsComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'profile', component: ProfileComponent },
];