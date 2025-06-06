import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserGet } from '../../models/UserGet';
import Swal from 'sweetalert2';
import { UserFilterDto } from '../../models/UserFilterDto';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, PipesModule, NgSelectModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css'
})
export class UsersListComponent implements OnInit {
  form: FormGroup;
  users: UserGet[] = [];
  totalItems = 0;
  totalPages = 0;
  currentUserId: number | null = null;
  sortDir: 'desc' | 'asc' = 'desc';
  page = 1;
  size = 10;
  dropdownOpenId: number | null = null;

  private readonly userService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  roleOptions = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Premium', value: 'PREMIUM' },
    { label: 'Usuario', value: 'USUARIO' },
    { label: 'Moderador', value: 'MODERADOR' }
  ];

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'true' },
    { label: 'Inactivos', value: 'false' }
  ];

  verifiedOptions = [
    { label: 'Todos', value: '' },
    { label: 'Verificados', value: 'true' },
    { label: 'No verificados', value: 'false' }
  ];

  sortOptions = [
    { label: 'Fecha registro', value: 'created_at' },
    { label: 'Nombre', value: 'name' },
    { label: 'Apellido', value: 'surname' },
    { label: 'Email', value: 'email' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      searchTerm: [''],
      active: [''],
      verified: [''],
      roles: [[]],
      location: [''],
      sortBy: ['created_at'],
      sortDir: ['desc']
    });
  }

 ngOnInit(): void {
    this.loadUsers();
    this.currentUserId = this.authService.getUser()?.id || null;

    this.form.valueChanges.subscribe((values) => {
      console.log('Form values changed:', values);
      this.page = 1;
      const searchTerm = values.searchTerm?.trim() || '';
    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      this.loadUsers();
    }
    });
  }

  loadUsers(): void {
    const formValues = this.form.value;
    
    const dto: UserFilterDto = {
      ...formValues,
      page: this.page - 1,
      size: this.size,
      active: formValues.active === '' ? undefined : formValues.active === 'true',
      verified: formValues.verified === '' ? undefined : formValues.verified === 'true',
      roles: formValues.roles?.length > 0 ? formValues.roles : undefined
    };

    this.userService.getFilteredUsers(dto).subscribe({
      next: (res) => {
        this.users = res.content;
        this.totalItems = res.totalElements;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los usuarios',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  clearFilters(): void {
    this.form.reset({
      searchTerm: '',
      active: '',
      verified: '',
      roles: [],
      location: '',
      sortBy: 'created_at'
    });
    this.sortDir = 'desc';
    this.page = 1;
    this.loadUsers();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadUsers();
    }
  }

  getPages(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.page - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleSortDirection(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.form.get('sortDir')?.setValue(this.sortDir);
    this.loadUsers();
  }

getInitials(user: any): string {
  const firstLetterName = user.name ? user.name.charAt(0).toUpperCase() : '';
  const firstLetterSurname = user.surname ? user.surname.charAt(0).toUpperCase() : '';
  return firstLetterName + firstLetterSurname;
}

  formatDate(dateStr: string): string {
    return dateStr ? dateStr.replace(/-/g, '/') : '';
  }

 getDaysByDate(dateStr: string): number {
  if (!dateStr) return NaN;

  const [day, month, year] = dateStr.split('-').map(Number);
  if (!day || !month || !year) return NaN;

  const date = new Date(year, month - 1, day);
  const today = new Date();
  
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - date.getTime();

  return diffTime <= 0 ? 0 : Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

  goToUserProfile(userId: number): void {
    this.router.navigate(['/user-profile', userId]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  toggleDropdown(userId: number): void {
    if (this.dropdownOpenId === userId) {
      this.dropdownOpenId = null;
    } else {
      this.dropdownOpenId = userId;
    }
  }

  closeDropdown(): void {
    this.dropdownOpenId = null;
  }

  getRoleBadgeClass(roles: string[]): string {
    if (roles.includes('ADMIN')) return 'bg-danger';
    if (roles.includes('MODERADOR')) return 'bg-info';
    if (roles.includes('PREMIUM')) return 'bg-warning';
    return 'bg-secondary';
  }

  getRoleDisplayName(roles: string[]): string {
    if (roles.includes('ADMIN')) return 'Admin';
    if (roles.includes('MODERADOR')) return 'Moderador';
    if (roles.includes('PREMIUM')) return 'Usuario Premium';
    return 'Usuario';
  }

  getAvatarUrl(user: UserGet): string {
    return user.avatar_url || '';
  }

  verifyUser(userId: number): void {
    this.userService.verifyUser(userId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Éxito',
          text: 'Usuario verificado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.loadUsers();
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo verificar al usuario',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  unverifyUser(userId: number): void {
    this.userService.unverifyUser(userId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Éxito',
          text: 'Usuario desverificado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.loadUsers();
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo desverificar al usuario',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  activateUser(userId: number): void {
    this.userService.activateUser(userId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Éxito',
          text: 'Usuario activado correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.loadUsers();
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo activar al usuario',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  deleteUser(userId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estas a punto de dar de baja a este usuario y todas sus publicaciones.',
      icon: 'warning',
      iconColor: '#d33',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            Swal.fire({
              title: 'Éxito',
              text: 'Usuario eliminado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              this.loadUsers();
            });
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar al usuario',
              icon: 'error',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

}
