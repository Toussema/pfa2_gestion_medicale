import { AuthComponent } from './auth/auth.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login/login.component';
import { SignupComponent } from './auth/login/signup/signup.component';
import { HomeComponent } from './dashboard/home/home.component';
import { DisponibiliteComponent } from './dashboard/disponibilite/disponibilite.component';
import { RendezVousComponent } from './dashboard/rendez-vous/rendez-vous.component';
import { DoctorsComponent } from './dashboard/doctors/doctors.component';
import { ProfileComponent } from './dashboard/profile/profile.component';
import { DocumentsComponent } from './dashboard/documents/documents.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { AboutComponent} from './about/about.component';
import { PredictionComponent } from './prediction/prediction.component';
import { GestionRendezvousComponent } from './dashboard/gestion-rendezvous/gestion-rendezvous.component';

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
  {path:'auth',component: AuthComponent},
  {path:'footer',component:FooterComponent},
  {path:'footer',component:FooterComponent},
  {path:'header',component:HeaderComponent},
  {path:'about',component:AboutComponent},
  { path: 'prediction', component: PredictionComponent },
  {path: 'gestion-rendez-vous',component:GestionRendezvousComponent}
];