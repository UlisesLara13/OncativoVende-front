import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReportGet } from '../../models/ReportGet';
import { ReportFilterDto } from '../../models/ReportFilterDto';
import { UtilsService } from '../../services/utils.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './reports-list.component.html',
  styleUrl: './reports-list.component.css'
})
export class ReportsListComponent implements OnInit {
  form: FormGroup;
  reports: ReportGet[] = [];
  totalItems = 0;
  totalPages = 0;
  sortDir: 'desc' | 'asc' = 'desc';
  page = 1;
  size = 10;
  dropdownOpenId: number | null = null;

  private readonly utilsService = inject(UtilsService);

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendientes', value: 'PENDIENTE' },
    { label: 'Resueltos', value: 'RESUELTO' }
  ];

  sortOptions = [
    { label: 'Fecha de reporte', value: 'created_at' },
    { label: 'Estado', value: 'status' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      searchTerm: [''],
      status: [''],
      sortBy: ['created_at'],
      sortDir: ['desc']
    });
  }

  ngOnInit(): void {
    this.loadReports();

    this.form.valueChanges.subscribe((values) => {
      console.log('Form values changed:', values);
      this.page = 1;
      const searchTerm = values.searchTerm?.trim() || '';
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.loadReports();
      }
    });
  }

  trackByReportId(index: number, report: ReportGet): number {
    return report.id;
  }

  loadReports(): void {
    const formValues = this.form.value;
    
    const dto: ReportFilterDto = {
      ...formValues,
      page: this.page - 1,
      size: this.size,
      status: formValues.status === '' ? undefined : formValues.status,
      sortDir: this.sortDir
    };

    this.utilsService.getFilteredReports(dto).subscribe({
      next: (res) => {
        this.reports = res.content;
        this.totalItems = res.totalElements;
        this.totalPages = res.totalPages;
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los reportes',
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
      status: '',
      sortBy: 'created_at'
    });
    this.sortDir = 'desc';
    this.page = 1;
    this.loadReports();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadReports();
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
    this.loadReports();
  }

  getInitials(user: any): string {
    const firstLetterName = user.name ? user.name.charAt(0).toUpperCase() : '';
    const firstLetterSurname = user.surname ? user.surname.charAt(0).toUpperCase() : '';
    return firstLetterName + firstLetterSurname;
  }

  getPublicationUserInitials(user: any): string {
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

  toggleDropdown(reportId: number): void {
    if (this.dropdownOpenId === reportId) {
      this.dropdownOpenId = null;
    } else {
      this.dropdownOpenId = reportId;
    }
  }

  closeDropdown(): void {
    this.dropdownOpenId = null;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-warning text-dark';
      case 'RESUELTO':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }

  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'RESUELTO':
        return 'Resuelto';
      default:
        return status;
    }
  }

  viewReportDetails(report: ReportGet): void {
    Swal.fire({
      title: 'Detalles del Reporte',
      html: `
      <div class="text-start">
        <div class="mb-3">
        <h6 class="text-primary mb-2">Información del usuario que reporta</h6>
        <p class="mb-1"><strong>Usuario:</strong> ${report.reporter.name} ${report.reporter.surname}</p>
        <p class="mb-0"><strong>Username:</strong> @${report.reporter.username}</p>
        </div>
        
        <div class="mb-3">
        <h6 class="text-primary mb-2">Publicación Reportada</h6>
        <p class="mb-1"><strong>Título:</strong> "${report.publication.title}"</p>
        <p class="mb-0"><strong>Propietario:</strong> ${report.publication.user.name} ${report.publication.user.surname}</p>
        <p class="mb-1"><strong>Rating:</strong> 
            <span class="badge bg-warning text-dark">
              <i class="bi bi-star-fill"></i> ${report.publication.user.rating}/5
            </span>
          </p>
        </div>
        
        <div class="mb-3">
        <h6 class="text-primary mb-2">Detalles del Reporte</h6>
        <p class="mb-1"><strong>Razón:</strong> ${report.reason}</p>
        <p class="mb-1"><strong>Estado:</strong> <span class="badge ${this.getStatusBadgeClass(report.status)}">${this.getStatusDisplayName(report.status)}</span></p>
        <p class="mb-0"><strong>Fecha:</strong> ${this.formatDate(report.created_at)}</p>
        </div>
        
        ${report.response ? `
        <div class="mb-3">
          <h6 class="text-primary mb-2">Respuesta del Administrador</h6>
          <p class="mb-0">${report.response}</p>
        </div>
        ` : ''}
      </div>
      `,
      icon: 'info',
      showCloseButton: true,
      showConfirmButton: false,
      width: '600px'
    });
  }

  resolveReport(reportId: number): void {
    Swal.fire({
      title: 'Resolver Reporte',
      text: 'Proporciona una respuesta para resolver este reporte:',
      input: 'textarea',
      inputPlaceholder: 'Escribe la respuesta del administrador...',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Resolver',
      cancelButtonText: 'Cancelar',
      preConfirm: (response) => {
        if (!response || response.trim().length === 0) {
          Swal.showValidationMessage('Debes proporcionar una respuesta');
          return false;
        }
        return response.trim();
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        //TODO Implementar la lógica para resolver el reporte
        Swal.fire({
          title: 'Éxito',
          text: 'Reporte marcado como resuelto',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.loadReports();
        });
      }
    });
  }

  markAsPending(reportId: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto marcará el reporte como pendiente nuevamente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      confirmButtonText: 'Sí, marcar como pendiente',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        //TODO MARCAR COMO PENDIENTE DESDE EL BACK
        Swal.fire({
          title: 'Éxito',
          text: 'Reporte marcado como pendiente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          this.loadReports();
        });
      }
    });
  }
}