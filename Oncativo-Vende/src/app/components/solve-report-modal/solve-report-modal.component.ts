import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UtilsService } from '../../services/utils.service';
import { SolveReportPost } from '../../models/SolveReportPost';
import { UsersService } from '../../services/users.service';
import { PublicationsService } from '../../services/publications.service';

@Component({
  selector: 'app-solve-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './solve-report-modal.component.html',
  styleUrl: './solve-report-modal.component.css'
})
export class SolveReportModalComponent {
  @Input() reportId: number = 0;
  @Input() userId: number = 0;
  @Input() publicationId: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() resolved = new EventEmitter<void>();

  modalVisible = true;
  private readonly utilsService = inject(UtilsService);
  private readonly userService = inject(UsersService);
  private readonly publicationService = inject(PublicationsService);

  form = new FormGroup({
    response: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]),
    banUser: new FormControl(false),
    deletePublication: new FormControl(false)
  });

  onClose() {
    this.modalVisible = false;
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload: SolveReportPost = {
      reportId: this.reportId,
      response: this.form.value.response || ''
    };

    this.utilsService.solveReport(payload).subscribe({
      next: () => {
        this.executeAdditionalActions();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo resolver el reporte, intenta más tarde.',
          timer: 2000,
          showConfirmButton: false
        });
        console.error('Error resolving report:', error);
      }
    });
  }

  private executeAdditionalActions() {
    const actions: Promise<any>[] = [];

    if (this.form.value.banUser && this.userId) {
      actions.push(this.userService.deleteUser(this.userId).toPromise());
    }

    if (this.form.value.deletePublication && this.publicationId) {
      actions.push(this.publicationService.deletePublication(this.publicationId).toPromise());
    }

    Promise.all(actions)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Reporte resuelto correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.resolved.emit();
        this.onClose();
      })
      .catch((error) => {
        console.error('Error executing additional actions:', error);
        Swal.fire({
          icon: 'warning',
          title: 'Parcialmente completado',
          text: 'El reporte fue resuelto, pero algunas acciones adicionales fallaron.',
          timer: 3000,
          showConfirmButton: false
        });
        this.resolved.emit();
        this.onClose();
      });
  }

  onValidate(controlName: string) {
    const control = this.form.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid && (control?.dirty || control?.touched)
    };
  }

  showError(controlName: string) {
    const control = this.form.get(controlName);
    if (control && control.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) return `${this.getFieldLabel(controlName)} es obligatorio.`;
      if (control.errors['minlength']) return `${this.getFieldLabel(controlName)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
      if (control.errors['maxlength']) return `${this.getFieldLabel(controlName)} debe tener máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      'response': 'La respuesta'
    };
    return labels[controlName] || controlName;
  }

}
