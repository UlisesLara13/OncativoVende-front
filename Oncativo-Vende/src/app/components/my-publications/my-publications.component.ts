import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicationsService } from '../../services/publications.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../pipes/pipes.module';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-my-publications',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,PipesModule,NgSelectModule],
  templateUrl: './my-publications.component.html',
  styleUrl: './my-publications.component.css'
})
export class MyPublicationsComponent implements OnInit {
  form: FormGroup;
  publications: any[] = [];
  totalItems = 0;
  totalPages = 0;
  sortDir: 'desc' | 'asc' = 'desc';
  page = 1;
  size = 5;
  dropdownOpenId: number | null = null;

  private readonly publicationService = inject(PublicationsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      searchTerm: [''],
      active: [''],
      sortBy: ['createdAt'],
      sortDir: ['desc']
    });
  }

  ngOnInit(): void {
    this.loadPublications();

  this.form.valueChanges.subscribe((values) => {
    this.page = 1;

    const searchTerm = values.searchTerm?.trim() || '';
    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      this.loadPublications();
    }

  });
  }

  loadPublications(): void {
    const dto = {
      ...this.form.value,
      page: this.page - 1, 
      size: this.size
    };

    const userId = this.authService.getUser().id;

    this.publicationService.getFilteredPublicationsByUserId(dto, userId).subscribe(res => {
      this.publications = res.content;
      this.totalItems = res.totalElements;
      this.totalPages = Math.ceil(this.totalItems / this.size);
    });
  }

  clearFilters() {
  this.form.reset({
    searchTerm: '',
    active: '',
    sortBy: 'createdAt'  
  });
  this.sortDir = 'desc'; 
  this.page = 1; 
  this.loadPublications();  
}

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadPublications();
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

toggleSortDirection() {
  this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  this.form.get('sortDir')?.setValue(this.sortDir);
  this.loadPublications(); 
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

  goToPublication(id: number): void {
    this.router.navigate(['/publication', id]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

    goToEditPublication(id: number): void {
    this.publicationService.addView(id).subscribe({
      next: () => {
        this.router.navigate(['/publication', id, 'edit']).then(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      },
    });
  }

  toggleDropdown(pubId: number) {
    if (this.dropdownOpenId === pubId) {
      this.dropdownOpenId = null;
    } else {
      this.dropdownOpenId = pubId;
    }
  }

  closeDropdown() {
    this.dropdownOpenId = null;
  }

  unactivatePublication(pubId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción va a dar de baja tu publicacíon.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
      this.publicationService.deletePublication(pubId).subscribe({
        next: () => {
        Swal.fire({
          title: 'Éxito',
          text: 'Publicación eliminada correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.loadPublications();
        });
        },
        error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la publicación',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
        }
      });
      }
    });
  }

  activatePublication(pubId: number) {
    if (this.authService.hasRole("PREMIUM")) {
      this.publicationService.reactivatePublication(pubId).subscribe({
        next: () => {
            Swal.fire({
            title: 'Éxito',
            text: 'Publicación reactivada correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
            }).then(() => {
            this.loadPublications();
          });
        },
        error: (err) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo reactivar la publicación',
            icon: 'error',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Atención',
        text: 'Solo los usuarios con una suscripcíon pueden reactivar publicaciones',
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
      });
      return;

    }
  }

}
