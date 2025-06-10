import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  goToPublications() {
    this.router.navigate(['/search']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  goToHome() {
    this.router.navigate(['/home']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

    goToFaq() {
    this.router.navigate(['/faq']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  showTermsAndConditions() {
    Swal.fire({
      title: 'Términos y Condiciones - Oncativo Vende',
      html: `
        <div style="text-align: justify; max-height: 450px; overflow-y: auto; padding: 10px; font-size: 14px; line-height: 1.4;">
          <p><strong>Bienvenido a Oncativo Vende</strong> proporcionado por <strong>Oncativo Vende S.A.</strong> Nos complace ofrecerle acceso al Servicio, sujeto a estos términos y condiciones y a la Política de Privacidad correspondiente.</p>
          
          <h6><strong>Aceptación de Términos</strong></h6>
          <p>Al acceder y utilizar el Servicio, usted expresa su consentimiento y acuerdo con los Términos de Servicio y la Política de Privacidad. Si no está de acuerdo, no utilice el Servicio.</p>
          
          <h6><strong>Descripción del Servicio</strong></h6>
          <p>Oncativo Vende es una plataforma digital que permite a los usuarios suscribirse para publicar productos o servicios para que otros usuarios interesados puedan contactarlos. No intervenimos en las operaciones comerciales ni en los términos pactados entre las partes. Solo facilitamos el contacto entre oferentes y potenciales compradores.</p>
          
          <h6><strong>Requisitos de Usuario</strong></h6>
          <p>Al suscribirse, el usuario declara ser mayor de edad y tener capacidad legal para contratar. El acceso al Servicio está condicionado al cumplimiento de estos Términos. Nos reservamos el derecho de rechazar o cancelar suscripciones por incumplimientos.</p>
          
          <h6><strong>Derechos de la Empresa</strong></h6>
          <p>Oncativo Vende S.A. se reserva todos los derechos no expresamente otorgados en este documento. Esto incluye la posibilidad de modificar, suspender o eliminar funciones, así como cancelar o suspender cuentas sin previo aviso en caso de incumplimiento.</p>
          
          <h6><strong>Funcionamiento del Servicio</strong></h6>
          <p>El Servicio permite publicar avisos clasificados mediante una suscripción mensual, semestral o anual. Los usuarios interesados contactarán directamente con el anunciante. La Compañía no garantiza que se concreten las operaciones ni se responsabiliza por la calidad, estado, cumplimiento o veracidad de los avisos.</p>
          
          <h6><strong>Transacciones</strong></h6>
          <p>No se gestionan pagos ni entregas entre las partes. Toda transacción es responsabilidad exclusiva del vendedor y del comprador.</p>
          
          <h6><strong>Seguridad de Cuenta</strong></h6>
          <p>El acceso es mediante una clave personal, única e intransferible. Oncativo Vende nunca pedirá los datos completos de la cuenta por email o mensaje. El uso indebido de las credenciales es responsabilidad del usuario.</p>
          
          <h6><strong>Cancelación</strong></h6>
          <p>El usuario puede cancelar su suscripción en cualquier momento sin penalidades. En caso de incumplimiento, Oncativo Vende S.A. puede dar de baja la cuenta.</p>
          
          <h6><strong>Propiedad Intelectual</strong></h6>
          <p>El contenido, diseño y desarrollo del software está protegido por la Ley 11.723 de Propiedad Intelectual. Está prohibida su reproducción o modificación sin autorización expresa.</p>
          
          <h6><strong>Protección de Datos</strong></h6>
          <p>El tratamiento de datos personales se realiza según la Política de Privacidad. La información se protege con medidas de seguridad adecuadas y no se comparte con terceros sin consentimiento, salvo requerimiento legal.</p>
        </div>
      `,
      width: '700px',
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      showCloseButton: true,
      cancelButtonColor: '#6c757d',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }
}