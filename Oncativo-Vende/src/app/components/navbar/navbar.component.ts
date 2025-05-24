import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

import { CategoryGet } from '../../models/CategoryGet';
import { UserGet } from '../../models/UserGet';
import { UserLoged } from '../../models/UserLoged';
import { PublicationsService } from '../../services/publications.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  private readonly router = inject(Router);
  authService = inject(AuthService);
  publicationsService = inject(PublicationsService);
  usersService = inject(UsersService);

  userLoged: UserLoged = new UserLoged();
  selectedCategory: string = '';
  user: UserGet = new UserGet();
  categories: CategoryGet[] = [];
  searchText: string = '';

  ngOnInit(): void {
    this.userLoged = this.authService.getUser();
    this.loadUserProfileImage(this.userLoged.id);
    this.loadCategories();
  }

  logout(): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: "Se cerrará su sesión actual.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logOut();
        this.refreshPage("/home");
      }
    });
  }

  refreshPage(link: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([link]);
    });
  }

  goToLogin() {
    this.refreshPage("/login");
  }

  selectCategory(category: any) {
    this.selectedCategory = category.description;  

    this.onCategoryChange(this.selectedCategory);
  }

  loadCategories(): void {
    this.publicationsService.getCategories().subscribe({
      next: (categories: CategoryGet[]) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  loadUserProfileImage(userId: number): void {
    this.usersService.getUserById(userId).subscribe({
      next: (userData: UserGet) => {
        this.user = userData;
      },
      error: (error) => {
        console.error('Error al cargar el usuario:', error);
      }
    });
  }

  getInitials(): string {
    const firstLetterName = this.user.name ? this.user.name.charAt(0).toUpperCase() : '';
    const firstLetterSurname = this.user.surname ? this.user.surname.charAt(0).toUpperCase() : '';
    return firstLetterName + firstLetterSurname;
  }

  setName(): string {
    return `${this.user.surname}, ${this.user.name}`;
  }

  getProfileImage(): string {
    return this.user.avatar_url ? this.user.avatar_url : '';
  }

onSearch() {
    this.router.navigate(['/search'], {
      queryParams: {
        searchText: this.searchText,
      }
    });
  }

  onCategoryChange(categorySelected: string) {
    this.router.navigate(['/search'], {
      queryParams: {
        category: categorySelected
      }
  });
  }


}
