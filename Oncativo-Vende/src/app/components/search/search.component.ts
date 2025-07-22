import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicationsService } from '../../services/publications.service';
import { PublicationGet } from '../../models/PublicationGet';
import { SearchDto } from '../../models/SearchDto';
import { PaginatedPublications } from '../../models/PaginatedPublications';
import { PipesModule } from '../../pipes/pipes.module';
import { CategoryGet } from '../../models/CategoryGet';
import { UtilsService } from '../../services/utils.service';
import { LocationGet } from '../../models/LocationGet';
import { TagGet } from '../../models/TagGet';
import { NgSelectModule } from '@ng-select/ng-select';
import { forkJoin, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, CommonModule, PipesModule, NgSelectModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  publications: PublicationGet[] = [];
  categories: CategoryGet[] = [];
  locations: LocationGet[] = [];
  tags: TagGet[] = [];
  searchText: string | null = null;
  location: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  totalItems: number = 0;
  category: string[] = [];
  tag: string[] = [];
  sortDir: string = 'desc';
  sortBy: string = 'createdAt';
  currentPage: number = 1;
  totalPages: number = 0;
  itemsPerPage: number = 12; 
  isLastPage: boolean = false;
  loading: boolean = false; 
  orderByOptions = [
    { label: 'Fecha de publicación', value: 'createdAt' },
    { label: 'Precio', value: 'price' },
    { label: 'Título', value: 'title' }
  ];

  constructor(
    private publicationsService: PublicationsService,
    private utilsService: UtilsService,
    private route: ActivatedRoute, 
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async params => {
      this.searchText = params['searchText'] || '';
      this.category = Array.isArray(params['category']) ? params['category'] : (params['category'] ? [params['category']] : []);
      this.location = params['location'];
      this.minPrice = params['minPrice'] ? +params['minPrice'] : null;
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.tag = Array.isArray(params['tag']) ? params['tag'] : (params['tag'] ? [params['tag']] : []);
      this.sortBy = params['sortBy'] || 'createdAt';
      this.sortDir = params['sortDir'] || 'desc';
      
      await this.loadInitialData();
      this.loadPublications();
    });
  }

  private async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      await Promise.all([
        this.loadCategories(),
        this.loadLocations(),
        this.loadTags()
      ]);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await firstValueFrom(this.publicationsService.getCategories());
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  async loadLocations(): Promise<void> {
    try {
      this.locations = await firstValueFrom(this.utilsService.getLocations());
    } catch (error) {
      console.error('Error al cargar localidades:', error);
    }
  }

  async loadTags(): Promise<void> {
    try {
      this.tags = await firstValueFrom(this.utilsService.getTags());
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
    }
  }

  loadPublications(): void {
    const searchDto: SearchDto = {};

    searchDto.active = true; 

    if (this.searchText) {
      searchDto.searchTerm = this.searchText;
    }

    if (this.category && this.category.length > 0) {
      searchDto.categories = this.category;  
    }

    if (this.tag && this.tag.length > 0) {
      searchDto.tags = this.tag;  
    }

    if (this.location) {
      searchDto.location = this.location;
    }

    if (this.minPrice !== null) {
      searchDto.minPrice = this.minPrice;
    }

    if (this.maxPrice !== null) {
      searchDto.maxPrice = this.maxPrice;
    }

    if (this.sortBy) {
      searchDto.sortBy = this.sortBy;
    }

    if (this.sortDir) {
      searchDto.sortDir = this.sortDir;
    }

    searchDto.page = this.currentPage - 1; 

    console.log('Search DTO:', searchDto); 
    console.log('publications', this.publications); 
    console.log(this.category); 
    console.log(this.tag); 

    this.publicationsService.getFilteredPublications(searchDto).subscribe((response: PaginatedPublications) => {
      this.publications = response.content;
      this.totalPages = response.totalPages || 0;
      this.totalItems = response.totalElements || 0;
      this.isLastPage = this.currentPage >= this.totalPages;
      window.scrollTo({ top: 0, behavior: 'smooth' })
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.loadPublications();
    }
  }

  getPages(): number[] {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
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

  applyFilters(): void {
    this.currentPage = 1; 
    this.loadPublications();
  }

  clearFilters(): void {
    this.searchText = null;
    this.category = [];
    this.location = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.tag = [];
    this.sortBy = 'createdAt';
    this.sortDir = 'desc';
    this.currentPage = 1;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    
    this.loadPublications();
  }

  toggleSortDir(direction: string): void {
    if (this.sortDir === direction) {
      this.sortDir = direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortDir = direction;
    }
    this.loadPublications(); 
  }

  getTagClass(tag: string): string {
    const tagColorMap: { [key: string]: string } = {
      'Nuevo': 'bg-success',
      'Usado': 'bg-danger',
      'Envío incluido': 'bg-primary',
      'Retiro en mano': 'bg-secondary',
      'Punto de encuentro': 'bg-info',
      'Precio fijo': 'bg-dark',
      'Precio negociable': 'bg-warning',
    };
  
    return `badge rounded-pill ${tagColorMap[tag] || 'bg-secondary'}`;
  }

  goToPublication(id: number): void {
    this.publicationsService.addView(id).subscribe({
      next: () => {
        this.router.navigate(['/publication', id]).then(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      },
    });
  }
}