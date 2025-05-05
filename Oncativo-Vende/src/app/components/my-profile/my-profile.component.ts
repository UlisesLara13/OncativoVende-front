import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { UserLoged } from '../../models/UserLoged';
import { UserGet } from '../../models/UserGet';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  authService = inject(AuthService);
  usersService = inject(UsersService);
  private readonly router = inject(Router);

  user: UserGet = new UserGet();
  userLoged: UserLoged = new UserLoged();

  ngOnInit(): void {
    this.userLoged = this.authService.getUser();
    this.loadUserData(this.userLoged.id);
  }

  loadUserData(userId: number): void {
    this.usersService.getUserById(userId).subscribe({
      next: (userData: UserGet) => {
        this.user = userData;
      },
      error: (error) => {
        console.error('Error al cargar los datos del usuario:', error);
      }
    });
  }

  getInitials(name: string, surname: string): string {
    const firstLetterName = name ? name.charAt(0).toUpperCase() : '';
    const firstLetterSurname = surname ? surname.charAt(0).toUpperCase() : '';
    return firstLetterName + firstLetterSurname;
  }

  getStarClass(rating: number, index: number): string {
    if (index < Math.floor(rating)) {
      return 'bi bi-star-fill text-warning'; // Estrella llena
    } else if (index < Math.ceil(rating)) {
      return 'bi bi-star-half text-warning'; // Media estrella
    } else {
      return 'bi bi-star text-muted'; // Estrella vacía
    }
  }

  onChangeAvatar(): void {
    console.log('Cambiar avatar...');
  }
}
