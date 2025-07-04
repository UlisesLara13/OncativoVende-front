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
import { PublicationComponent } from './components/publication/publication.component';
import { SubscriptionsComponent } from './components/subscriptions/subscriptions.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentFailureComponent } from './components/payment-failure/payment-failure.component';
import { MyFavoritesComponent } from './components/my-favorites/my-favorites.component';
import { MyPublicationsComponent } from './components/my-publications/my-publications.component';
import { EditPublicationComponent } from './components/edit-publication/edit-publication.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { ReportsListComponent } from './components/reports-list/reports-list.component';
import { PublicationsListComponent } from './components/publications-list/publications-list.component';
import { FrequentQuestionsComponent } from './components/frequent-questions/frequent-questions.component';
import { NewEventComponent } from './components/new-event/new-event.component';
import { EventsListComponent } from './components/events-list/events-list.component';
import { ChartsUserComponent } from './components/charts-user/charts-user.component';
import { ChartsPublicationComponent } from './components/charts-publication/charts-publication.component';
import { ChartsSubscriptionsComponent } from './components/charts-subscriptions/charts-subscriptions.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent, canActivate: [loginBlockGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [loginBlockGuard] },
    { path: 'profile', component: MyProfileComponent, canActivate: [authGuard] },
    { path: 'my-favorites', component: MyFavoritesComponent, canActivate: [authGuard] },
    { path: 'my-publications', component: MyPublicationsComponent, canActivate: [authGuard] },
    { path: 'subscriptions', component: SubscriptionsComponent, canActivate: [authGuard]},
    { path: 'payment-success', component: PaymentSuccessComponent },
    { path: 'payment-failure', component: PaymentFailureComponent },
    { path: 'publication/:id', component: PublicationComponent},
    { path: 'events', component: EventsListComponent},
    { path: 'publication/:id/edit', component: EditPublicationComponent, canActivate: [authGuard, roleGuard], data: { roles: ['PREMIUM','ADMIN'] } },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'new-publication', component: NewPublicationComponent, canActivate: [authGuard, roleGuard], data: { roles: ['PREMIUM','ADMIN'] } },
    { path: 'admin/new-event', component: NewEventComponent , canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/users', component: UsersListComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/publications', component: PublicationsListComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/charts/users', component: ChartsUserComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/charts/publications', component: ChartsPublicationComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'admin/charts/subscriptions', component: ChartsSubscriptionsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },
    { path: 'moderator/reports', component: ReportsListComponent, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN','MODERADOR'] } },
    { path: 'not-found', component: NotFoundComponent },
    { path: 'search', component: SearchComponent },
    {path: 'faq', component: FrequentQuestionsComponent},
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'not-found' }
];
