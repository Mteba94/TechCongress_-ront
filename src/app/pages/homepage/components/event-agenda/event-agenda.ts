import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  Calendar, UserCheck, Award, Mic, Code, Users, Coffee, Trophy, Network,
  Info, ArrowRight, UserPlus
} from 'lucide-angular';

@Component({
  selector: 'app-event-agenda',
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterLink
  ],
  templateUrl: './event-agenda.html',
  styleUrl: './event-agenda.css'
})
export class EventAgenda {
  selectedDay: number = 1;

  readonly icons = {
    calendar: Calendar,
    userCheck: UserCheck,
    award: Award,
    mic: Mic,
    code: Code,
    users: Users,
    coffee: Coffee,
    trophy: Trophy,
    network: Network,
    info: Info,
    arrowRight: ArrowRight,
    userPlus: UserPlus
  }

  agendaDays = [
    {
      day: 1,
      date: "15 Marzo 2025",
      title: "Día de Apertura",
      theme: "Fundamentos y Tendencias",
      events: [
        {
          time: "08:00 - 09:00",
          title: "Registro y Acreditación",
          type: "registration",
          location: "Hall Principal",
          description: "Recepción de participantes y entrega de materiales"
        },
        {
          time: "09:00 - 09:30",
          title: "Ceremonia de Apertura",
          type: "ceremony",
          location: "Auditorio Principal",
          speaker: "Dr. María González",
          description: "Bienvenida oficial y presentación del congreso"
        },
        {
          time: "09:30 - 10:30",
          title: "Keynote: El Futuro de la Ingeniería de Sistemas",
          type: "keynote",
          location: "Auditorio Principal",
          speaker: "Dr. María González",
          description: "Tendencias emergentes y oportunidades profesionales"
        },
        {
          time: "10:30 - 11:00",
          title: "Coffee Break & Networking",
          type: "break",
          location: "Área de Networking",
          description: "Pausa para café y networking entre participantes"
        },
        {
          time: "11:00 - 12:30",
          title: "Taller: Introducción a la Inteligencia Artificial",
          type: "workshop",
          location: "Laboratorio A",
          speaker: "Dr. María González",
          description: "Conceptos básicos y aplicaciones prácticas de IA"
        },
        {
          time: "12:30 - 14:00",
          title: "Almuerzo",
          type: "break",
          location: "Cafetería",
          description: "Almuerzo libre y networking informal"
        },
        {
          time: "14:00 - 15:30",
          title: "Panel: Carreras en Tecnología",
          type: "panel",
          location: "Auditorio Principal",
          description: "Mesa redonda con profesionales de diferentes áreas"
        },
        {
          time: "15:30 - 17:00",
          title: "Taller: Desarrollo Web Moderno",
          type: "workshop",
          location: "Laboratorio B",
          speaker: "Ing. Carlos Rodríguez",
          description: "Frameworks actuales y mejores prácticas"
        }
      ]
    },
    {
      day: 2,
      date: "16 Marzo 2025",
      title: "Día de Especialización",
      theme: "Tecnologías Avanzadas",
      events: [
        {
          time: "09:00 - 10:30",
          title: "Keynote: Cloud Computing y DevOps",
          type: "keynote",
          location: "Auditorio Principal",
          speaker: "Ing. Carlos Rodríguez",
          description: "Arquitecturas modernas y metodologías ágiles"
        },
        {
          time: "10:30 - 11:00",
          title: "Coffee Break",
          type: "break",
          location: "Área de Networking",
          description: "Pausa para café y networking"
        },
        {
          time: "11:00 - 12:30",
          title: "Taller: Diseño UX/UI",
          type: "workshop",
          location: "Laboratorio C",
          speaker: "Ana Martínez",
          description: "Principios de diseño centrado en el usuario"
        },
        {
          time: "12:30 - 14:00",
          title: "Almuerzo",
          type: "break",
          location: "Cafetería",
          description: "Almuerzo libre y networking"
        },
        {
          time: "14:00 - 15:30",
          title: "Taller: Ciberseguridad Práctica",
          type: "workshop",
          location: "Laboratorio A",
          speaker: "Dr. Roberto Silva",
          description: "Técnicas de seguridad y ethical hacking"
        },
        {
          time: "15:30 - 17:00",
          title: "Hackathon: Inicio",
          type: "competition",
          location: "Área de Competencias",
          description: "Inicio del hackathon de 24 horas"
        },
        {
          time: "17:00 - 18:00",
          title: "Networking Evening",
          type: "networking",
          location: "Terraza",
          description: "Evento de networking con empresas patrocinadoras"
        }
      ]
    },
    {
      day: 3,
      date: "17 Marzo 2025",
      title: "Día de Clausura",
      theme: "Innovación y Futuro",
      events: [
        {
          time: "09:00 - 10:30",
          title: "Taller: Desarrollo Mobile",
          type: "workshop",
          location: "Laboratorio B",
          speaker: "Laura Fernández",
          description: "React Native y Flutter para aplicaciones móviles"
        },
        {
          time: "10:30 - 11:00",
          title: "Coffee Break",
          type: "break",
          location: "Área de Networking",
          description: "Última pausa para networking"
        },
        {
          time: "11:00 - 12:30",
          title: "Taller: Internet of Things",
          type: "workshop",
          location: "Laboratorio C",
          speaker: "Ing. David López",
          description: "Desarrollo de soluciones IoT"
        },
        {
          time: "12:30 - 14:00",
          title: "Almuerzo",
          type: "break",
          location: "Cafetería",
          description: "Último almuerzo del congreso"
        },
        {
          time: "14:00 - 15:00",
          title: "Presentación de Proyectos Hackathon",
          type: "competition",
          location: "Auditorio Principal",
          description: "Presentación final de proyectos del hackathon"
        },
        {
          time: "15:00 - 16:00",
          title: "Premiación y Reconocimientos",
          type: "ceremony",
          location: "Auditorio Principal",
          description: "Entrega de premios y certificados"
        },
        {
          time: "16:00 - 16:30",
          title: "Ceremonia de Clausura",
          type: "ceremony",
          location: "Auditorio Principal",
          description: "Cierre oficial del congreso"
        }
      ]
    }
  ];

  selectDay(day: number): void {
    this.selectedDay = day;
  }

  getEventIcon(type: string): any {
    const iconMap: { [key: string]: any } = {
      registration: this.icons.userCheck,
      ceremony: this.icons.award,
      keynote: this.icons.mic,
      workshop: this.icons.code,
      panel: this.icons.users,
      break: this.icons.coffee,
      competition: this.icons.trophy,
      networking: this.icons.network,
    };
    return iconMap[type] || this.icons.calendar;
  }

  getEventColor(type: string): any {
    const colorMap: { [key: string]: string } = {
      registration: 'bg-blue-100 text-blue-700 border-blue-200',
      ceremony: 'bg-purple-100 text-purple-700 border-purple-200',
      keynote: 'bg-[var(--color-primary)]/[0.10] text-[var(--color-primary)] border-[var(--color-primary)]/[0.20]',
      workshop: 'bg-green-100 text-green-700 border-green-200',
      panel: 'bg-orange-100 text-orange-700 border-orange-200',
      break: 'bg-gray-100 text-gray-700 border-gray-200',
      competition: 'bg-red-100 text-red-700 border-red-200',
      networking: 'bg-teal-100 text-teal-700 border-teal-200'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
