import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicationsService } from '../../services/publications.service';
import { PublicationGet } from '../../models/PublicationGet';
import { SearchDto } from '../../models/SearchDto';
import { PaginatedPublications } from '../../models/PaginatedPublications';
import { PipesModule } from '../../pipes/pipes.module';
import { CategoryGet } from '../../models/CategoryGet';
import { UtilsService } from '../../services/utils.service';
import { LocationGet } from '../../models/LocationGet';
import { TagGet } from '../../models/TagGet';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, CommonModule, PipesModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {

  publications: PublicationGet[] = [];
  categories: CategoryGet[] = [];
  locations: LocationGet[] = [];
  tags: TagGet[] = [];
  searchText: string | null = null;
  category: string | null = null;
  location: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  tag: string | null = null;
  sortDir: string = 'asc';
  sortBy: string = 'createdAt';
  currentPage: number = 1;
  totalPages: number = 0;
  itemsPerPage: number = 12; 
  isLastPage: boolean = false;

  constructor(
    private publicationsService: PublicationsService,
    private utilsService: UtilsService,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchText = params['searchText'] || '';
      this.category = params['category'] || '';
      this.location = params['location'] || '';
      this.minPrice = params['minPrice'] ? +params['minPrice'] : null;
      this.maxPrice = params['maxPrice'] ? +params['maxPrice'] : null;
      this.tag = params['tag'] || '';
      this.sortBy = params['sortBy'] || 'createdAt';
      this.sortDir = params['sortDir'] || 'asc';
      
      this.loadCategories();
      this.loadLocations();
      this.loadTags();
      this.loadPublications();
    });
  }

  loadPublications(): void {
  const searchDto: SearchDto = {};

  if (this.searchText) {
    searchDto.searchTerm = this.searchText;
  }

  if (this.category) {
    searchDto.category = this.category;
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

  if (this.tag) {
    searchDto.tag = this.tag;
  }

  if (this.sortBy) {
    searchDto.sortBy = this.sortBy;
  }

  if (this.sortDir) {
    searchDto.sortDir = this.sortDir;
  }

  console.log('Search DTO:', searchDto); // Línea de depuración
  console.log('publications', this.publications); // Línea de depuración

  // Realizar la llamada al servicio con el objeto SearchDto creado
  this.publicationsService.getFilteredPublications(searchDto).subscribe((response: PaginatedPublications) => {
    this.publications = response.content;
    this.totalPages = response.totalPages || 0;
    this.isLastPage = this.currentPage >= this.totalPages;
  });
}

  loadPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPublications();
  }

  applyFilters(): void {
    this.currentPage = 1; 
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

  loadLocations(): void {
      this.utilsService.getLocations().subscribe({
        next: (locations: LocationGet[]) => {
          this.locations = locations;
        },
        error: (error) => {
          console.error('Error al cargar localidades:', error);
        }
      });
    }

  loadTags(): void {
    this.utilsService.getTags().subscribe({
      next: (tags: TagGet[]) => {
        this.tags = tags;
      },
      error: (error) => {
        console.error('Error al cargar etiquetas:', error);
      }
    });
  }
  

}
