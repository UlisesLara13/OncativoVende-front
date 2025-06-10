import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Faq } from '../../models/Faq';

@Component({
  selector: 'app-frequent-questions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frequent-questions.component.html',
  styleUrl: './frequent-questions.component.css'
})
export class FrequentQuestionsComponent {
  faqs: Faq[] = [
    {
      id: 1,
      question: '¿Cómo creo mi clave?',
      answer: 'Ingresá al sitio, seleccioná <strong>"Ingresar"</strong> luego <strong>"Crear cuenta"</strong> y completá los datos solicitados. El proceso es rápido y seguro.',
      isExpanded: false
    },
    {
      id: 2,
      question: '¿Cómo desbloqueo mi usuario?',
      answer: 'Escribinos a <strong><a href="mailto:oncativovende@gmail.com">oncativovende@gmail.com</a></strong> indicando tu nombre de usuario y nombre completo. Te ayudaremos a resolver el problema.',
      isExpanded: false
    },
    {
      id: 3,
      question: '¿A qué mail puedo escribir para sugerencias o reclamos?',
      answer: 'Para sugerencias o reclamos escribí a <strong><a href="mailto:oncativovende@gmail.com">oncativovende@gmail.com</a></strong>',
      isExpanded: false
    },
    {
      id: 4,
      question: '¿Cómo puedo eliminar mi cuenta?',
      answer: 'Ingresá a tu cuenta , una vez dentro dirigite a la sección de <strong>"Mi perfil"</strong> Luego selecciona la opción de <strong>"Eliminar cuenta"</strong>.Tu cuenta se borrará junto con tus datos personales.',
      isExpanded: false
    },
    {
      id: 5,
      question: '¿Qué medios de pago aceptan?',
      answer: 'Aceptamos múltiples medios de pago a través de Mercado Pago. Podés abonar con: <strong>tarjetas de crédito</strong>, <strong>débito</strong>, y <strong>dinero en cuenta de mercado pago</strong>. <br> El proceso es seguro y rápido. Una vez elegido el producto, serás redirigido automáticamente al Checkout de Mercado Pago donde podrás seleccionar tu método preferido.',
      isExpanded: false
    },
    {
      id: 6,
      question: '¿Qué necesito para publicar?',
      answer: 'Solo necesitás <strong>registrarte</strong>, <strong>elegir una suscripción activa</strong> y <strong>cargar tu producto</strong>. ¡Es así de simple!',
      isExpanded: false
    },
    {
      id: 7,
      question: '¿Cómo funciona Oncativo Vende?',
      answer: 'Te suscribís, publicás lo que vendés, y los compradores te contactan directamente. <strong>¡Vos coordinás la entrega!</strong> Nosotros solo facilitamos el encuentro.',
      isExpanded: false
    }
  ];

  toggleFAQ(id: number): void {
    this.faqs = this.faqs.map(faq => ({
      ...faq,
      isExpanded: faq.id === id ? !faq.isExpanded : false
    }));
  }

  trackByFn(index: number, item: Faq): number {
    return item.id;
  }
}
