import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { authGuard } from './guards/auth.guard';
import { loginBlockGuard } from './guards/login-block.guard';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SearchComponent } from './components/search/search.component';
import { NewPublicationComponent } from './components/new-publication/new-publication.component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent, canActivate: [loginBlockGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [loginBlockGuard] },
    { path: 'profile', component: MyProfileComponent, canActivate: [authGuard] },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'new-publication', component: NewPublicationComponent, canActivate: [authGuard, roleGuard], data: { roles: ['PREMIUM'] } },
    { path: 'not-found', component: NotFoundComponent },
    { path: 'search', component: SearchComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'not-found' }
];
