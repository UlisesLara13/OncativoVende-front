import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';
import { authGuard } from './guards/auth.guard';
import { loginBlockGuard } from './guards/login-block.guard';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'login', component: LoginComponent, canActivate: [loginBlockGuard]},
    {path: 'register', component: RegisterComponent, canActivate: [loginBlockGuard]},
    {path: 'profile', component: MyProfileComponent, canActivate: [authGuard]},
    {path: 'unauthorized', component: UnauthorizedComponent},
    {path: 'not-found', component: NotFoundComponent},
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'not-found' }
];
