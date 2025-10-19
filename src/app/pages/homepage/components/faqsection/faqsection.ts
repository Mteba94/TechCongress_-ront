import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { ChevronDown, ChevronUp, HelpCircle, LucideAngularModule, Mail, MessageCircle, Phone } from 'lucide-angular';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faqsection',
  imports: [
    CommonModule,
    //NgClass,
    LucideAngularModule
  ],
  templateUrl: './faqsection.html',
  styleUrl: './faqsection.css'
})
export class FAQSection {
  public openFAQ: number | null = null;

  public faqs: FAQ[] = [
    {
      id: 1,
      question: "¿Quién puede participar en el Congreso UMG?",
      answer: `El Congreso UMG está abierto a estudiantes de bachillerato y universitarios interesados en tecnología e ingeniería de sistemas. No se requiere experiencia previa en programación, ya que ofrecemos talleres para todos los niveles, desde principiantes hasta avanzados.

También pueden participar profesionales jóvenes que busquen actualizar sus conocimientos o explorar nuevas áreas tecnológicas.`
    },
//     {
//       id: 2,
//       question: "¿Cuál es el costo de participación?",
//       answer: `La participación en el TechCongress tiene diferentes modalidades:

// • Estudiantes de bachillerato: Entrada gratuita a conferencias principales
// • Estudiantes universitarios: €25 por el pase completo de 3 días
// • Talleres especializados: €15-30 por taller individual
// • Paquete completo: €75 (incluye todos los talleres, materiales y certificados)

// Ofrecemos becas parciales para estudiantes con situación económica demostrable.`
//     },
//     {
//       id: 2,
//       question: "¿Qué incluye la inscripción?",
//       answer: `Tu inscripción al TechCongress incluye:

// • Acceso a todas las conferencias magistrales
// • Materiales digitales y recursos de aprendizaje
// • Certificado de participación oficial
// • Coffee breaks y networking sessions
// • Acceso a la plataforma digital del evento
// • Grabaciones de las sesiones principales

// Los talleres especializados se cobran por separado y incluyen materiales específicos y certificación adicional.`
//     },
    {
      id: 2,
      question: "¿Necesito llevar mi propia laptop?",
      answer: `Sí, recomendamos encarecidamente traer tu propia laptop para los talleres prácticos. Requisitos mínimos:

• Sistema operativo: Windows 10, macOS 10.14+ o Linux Ubuntu 18.04+
• RAM: Mínimo 8GB (recomendado 16GB)
• Almacenamiento: Al menos 20GB libres
• Conexión a internet estable

Para talleres específicos, enviaremos una lista detallada de software a instalar previamente. Si no tienes laptop, contáctanos para opciones de préstamo limitado.`
    },
//     {
//       id: 5,
//       question: "¿Cómo funciona el sistema de certificados?",
//       answer: `Ofrecemos diferentes tipos de certificación:

// • Certificado de Participación: Por asistir al congreso completo
// • Certificados de Taller: Por completar talleres específicos con evaluación práctica
// • Certificado de Competencia: Por participar en hackathons y competencias

// Los certificados son digitales, verificables mediante blockchain, y reconocidos por empresas del sector tecnológico. Se envían por email dentro de las 48 horas posteriores al evento.`
//     },
    {
      id: 6,
      question: "¿Hay oportunidades de networking y empleo?",
      answer: `¡Absolutamente! El Congreso UMG incluye múltiples oportunidades de networking:

• Sesiones dedicadas de networking con empresas patrocinadoras
• Feria de empleo con más de 20 empresas tecnológicas
• Mentorías individuales con profesionales senior
• Presentación de proyectos estudiantiles
• Grupos de WhatsApp y LinkedIn para continuar conexiones

Muchos participantes han conseguido prácticas profesionales y ofertas de empleo directamente en el evento.`
    },
    {
      id: 7,
      question: "¿Qué medidas de seguridad y salud se implementan?",
      answer: `La seguridad y salud de nuestros participantes es prioritaria:

• Aforo controlado en todas las salas según normativas vigentes
• Estaciones de desinfección en puntos estratégicos
• Ventilación adecuada en todos los espacios
• Personal de seguridad y primeros auxilios disponible
• Protocolos de emergencia claramente establecidos

Seguimos todas las recomendaciones sanitarias locales y actualizamos nuestros protocolos según sea necesario.`
    },
    {
      id: 8,
      question: "¿Puedo cancelar mi inscripción?",
      answer: `Sí, ofrecemos diferentes políticas de cancelación:

• Hasta 30 días antes: Reembolso completo (100%)
• 15-29 días antes: Reembolso del 75%
• 7-14 días antes: Reembolso del 50%
• Menos de 7 días: Sin reembolso, pero puedes transferir tu inscripción a otra persona

En caso de cancelación del evento por causas de fuerza mayor, se reembolsa el 100% del costo de inscripción.`
    }
  ];

  public icons = {
    helpCircle: HelpCircle,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,
    messageCircle: MessageCircle,
    mail: Mail,
    phone: Phone,
  };

  public toggleFAQ(id: number): void {
    this.openFAQ = this.openFAQ === id ? null : id;
  }
}
