import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UtilsService } from '../../services/utils.service';
import { ReportPost } from '../../models/ReportPost';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-modal.component.html',
  styleUrl: './report-modal.component.css'
})
export class ReportModalComponent {
  @Input() reportedByUserId: number = 0;
  @Input() publicationId: number = 0;
  @Output() close = new EventEmitter<void>();

  modalVisible = true;
  private readonly utilsService = inject(UtilsService);

  form = new FormGroup({
    reason: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(250)])
  });

  onClose() {
    this.modalVisible = false;
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) return;

    const payload = {
      reported_by_user_id: this.reportedByUserId,
      publication_id: this.publicationId,
      reason: this.form.value.reason
    };

    // Aquí cambia la URL por la de tu API
    this.utilsService.postReport(new ReportPost(this.reportedByUserId, this.publicationId, this.form.value.reason || '')).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Reporte enviado',
          text: 'Gracias por tu reporte, será revisado.',
          timer: 2000,
          showConfirmButton: false
        });
        this.onClose();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo enviar el reporte, intenta más tarde.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  onValidate() {
    const control = this.form.get('reason');
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    };
  }

  showError() {
    const control = this.form.get('reason');
    if (control && control.errors) {
      if (control.errors['required']) return 'El motivo es obligatorio.';
      if (control.errors['minlength']) return `El motivo debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
      if (control.errors['maxlength']) return `El motivo debe tener máximo ${control.errors['maxlength'].requiredLength} caracteres.`;
    }
    return '';
  }

}
