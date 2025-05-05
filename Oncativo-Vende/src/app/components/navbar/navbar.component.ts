import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { ProductsService } from '../../services/products.service';
import { CategoryGet } from '../../models/CategoryGet';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {

  ngOnInit(): void {
    this.loadCategories();
    this.loadUserProfileImage();
  }

  private readonly router = inject(Router);
  authService = inject(AuthService);
  productsService = inject(ProductsService);
  userProfileImage: string | null = null;
  categories: CategoryGet[] = [];
  

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
        this.router.navigate(['/home']);
      }
    });
  }

  setName(){
    return this.authService.getUser().surname + ", " + this.authService.getUser().name;
  }

  getInitials(): string {
    const user = this.authService.getUser();
    if (!user.name || !user.surname) return '';
    return (user.name[0] + user.surname[0]).toUpperCase();
  }

  loadUserProfileImage(): void {
    const user = this.authService.getUser();
    this.userProfileImage = user.avatar || null;
  }

  loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: (categories: CategoryGet[]) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }


}
