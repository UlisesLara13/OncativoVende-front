import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { SearchDto } from '../../models/SearchDto';
import { PublicationsService } from '../../services/publications.service';
import { UtilsService } from '../../services/utils.service';
import { Router } from '@angular/router';
import { PublicationGet } from '../../models/PublicationGet';
import { LocationGet } from '../../models/LocationGet';
import { CategoryGet } from '../../models/CategoryGet';
import { TagGet } from '../../models/TagGet';

@Component({
  selector: 'app-publications-list',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,PipesModule,NgSelectModule],
  templateUrl: './publications-list.component.html',
  styleUrl: './publications-list.component.css'
})
export class PublicationsListComponent implements OnInit,OnDestroy {
  form: FormGroup;
  publications: PublicationGet[] = [];
  locations: LocationGet[] = [];
  categories: CategoryGet[] = [];
  tags: TagGet[] = [];
  
  totalItems = 0;
  totalPages = 0;
  page = 1;
  size = 10;
  
  sortDir: 'desc' | 'asc' = 'desc';
  
  dropdownOpenId: number | null = null;
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  
  private readonly publicationService = inject(PublicationsService);
  private readonly utilsService = inject(UtilsService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  Math = Math;

  constructor() {
    this.form = this.fb.group({
      searchTerm: [''],
      location: null,
      categories: [[]],
      tags: [[]],
      minPrice: [''],
      maxPrice: [''],
      sortBy: ['createdAt'],
      sortDir: ['desc'],
      active: [null] 
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormSubscriptions();
    this.loadPublications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.utilsService.getLocations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (locations) => this.locations = locations,
        error: (error) => console.error('Error loading locations:', error)
      });

    this.publicationService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => this.categories = categories,
        error: (error) => console.error('Error loading categories:', error)
      });

    this.utilsService.getTags()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tags) => this.tags = tags,
        error: (error) => console.error('Error loading tags:', error)
      });
  }

  private setupFormSubscriptions(): void {
    this.form.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.page = 1;
        this.loadPublications();
      });

    this.form.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe((values) => {
        const currentSearchTerm = this.form.get('searchTerm')?.value || '';
        if (currentSearchTerm.length >= 3 || currentSearchTerm.length === 0) {
          this.page = 1;
          this.loadPublications();
        }
      });
  }

  loadPublications(): void {
    this.isLoading = true;
    

    const formValues = this.form.value;
    const searchDto: SearchDto = {
      searchTerm: formValues.searchTerm?.trim() || undefined,
      location: formValues.location || undefined,
      categories: formValues.categories?.length > 0 ? formValues.categories : undefined,
      tags: formValues.tags?.length > 0 ? formValues.tags : undefined,
      minPrice: formValues.minPrice ? Number(formValues.minPrice) : undefined,
      maxPrice: formValues.maxPrice ? Number(formValues.maxPrice) : undefined,
      sortBy: formValues.sortBy || 'createdAt',
      sortDir: this.sortDir,
      page: this.page - 1, 
      size: this.size,
      active: formValues.active !== null ? formValues.active : undefined 
    };

    this.publicationService.getFilteredPublications(searchDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.publications = response.content;
          this.totalItems = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading publications:', error);
          this.isLoading = false;
          this.showErrorAlert('Error al cargar las publicaciones');
        }
      });
  }

  clearFilters(): void {
    this.form.reset({
      searchTerm: '',
      location: null,
      categories: [],
      tags: [],
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortDir: 'desc',
      active: null
    });
    this.sortDir = 'desc';
    this.page = 1;
    this.loadPublications();
  }

  toggleSortDirection(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.form.get('sortDir')?.setValue(this.sortDir);
    this.loadPublications();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadPublications();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  getActiveCount(): number {
    return this.publications.filter(pub => pub.active).length;
  }

  getInactiveCount(): number {
    return this.publications.filter(pub => !pub.active).length;
  }

  getTotalViews(): number {
    return this.publications.reduce((total, pub) => total + (pub.views || 0), 0);
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

  viewPublication(id: number): void {
    this.router.navigate(['/publication', id]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  viewUserProfile(userId: number): void {
    this.router.navigate(['/profile', userId]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Métodos de dropdown
  toggleDropdown(pubId: number): void {
    if (this.dropdownOpenId === pubId) {
      this.dropdownOpenId = null;
    } else {
      this.dropdownOpenId = pubId;
    }
  }

  closeDropdown(): void {
    this.dropdownOpenId = null;
  }

  // Métodos de acciones administrativas
  activatePublication(pubId: number): void {
    Swal.fire({
      title: '¿Activar publicación?',
      text: 'Esta acción hará que la publicación sea visible para todos los usuarios.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicationService.reactivatePublication(pubId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccessAlert('Publicación activada correctamente');
              this.loadPublications();
            },
            error: (error) => {
              console.error('Error activating publication:', error);
              this.showErrorAlert('No se pudo activar la publicación');
            }
          });
      }
    });
  }

  deactivatePublication(pubId: number): void {
    Swal.fire({
      title: '¿Desactivar publicación?',
      text: 'Esta acción ocultará la publicación de las búsquedas públicas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
      this.publicationService.deletePublication(pubId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: () => {
          this.showSuccessAlert('Publicación desactivada correctamente');
          this.loadPublications();
        },
        error: (error) => {
          console.error('Error deactivating publication:', error);
          this.showErrorAlert('No se pudo desactivar la publicación');
        }
        });
      }
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


  private showSuccessAlert(message: string): void {
    Swal.fire({
      title: 'Éxito',
      text: message,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      timer: 3000,
      showConfirmButton: false
    });
  }
}
