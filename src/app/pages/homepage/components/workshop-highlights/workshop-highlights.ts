import { Component, computed, signal } from '@angular/core';
import { ArrowLeft, ArrowRight, Clock, Code, Grid3X3, LucideAngularModule, User, UserPlus, Users } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';


interface Workshop {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  capacity: string;
  image: string;
  description: string;
  topics: string[];
  featured: boolean;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-workshop-highlights',
  imports: [
    LucideAngularModule,
    Button
  ],
  templateUrl: './workshop-highlights.html',
  styleUrl: './workshop-highlights.css'
})
export class WorkshopHighlights {
  readonly icons = {
    code: Code,
    user: User,
    clock: Clock,
    users: Users,
    userPlus: UserPlus,
    arrowRight: ArrowRight,
  };

  // Use a signal for the main data
  private workshops = signal<Workshop[]>([
    {
      id: 1,
      title: "Inteligencia Artificial y Machine Learning",
      instructor: "Dr. María González",
      duration: "3 horas",
      level: "Intermedio",
      capacity: "25 participantes",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Aprende los fundamentos de IA y ML con ejercicios prácticos usando Python y TensorFlow.",
      topics: ["Python", "TensorFlow", "Redes Neuronales", "Análisis de Datos"],
      featured: true
    },
    {
      id: 2,
      title: "Desarrollo Web Full Stack",
      instructor: "Ing. Carlos Rodríguez",
      duration: "4 horas",
      level: "Principiante",
      capacity: "30 participantes",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Construye aplicaciones web completas desde cero usando tecnologías modernas.",
      topics: ["React", "Node.js", "MongoDB", "API REST"],
      featured: true
    },
    {
      id: 3,
      title: "Diseño UX/UI para Desarrolladores",
      instructor: "Ana Martínez",
      duration: "2.5 horas",
      level: "Principiante",
      capacity: "20 participantes",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Domina los principios de diseño centrado en el usuario y herramientas de prototipado.",
      topics: ["Figma", "Design Thinking", "Prototipado", "Usabilidad"],
      featured: true
    },
    {
      id: 4,
      title: "Ciberseguridad y Ethical Hacking",
      instructor: "Dr. Roberto Silva",
      duration: "3.5 horas",
      level: "Avanzado",
      capacity: "15 participantes",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Aprende técnicas de seguridad informática y ethical hacking de forma práctica.",
      topics: ["Penetration Testing", "Kali Linux", "Vulnerabilidades", "Seguridad Web"],
      featured: false
    },
    {
      id: 5,
      title: "Desarrollo de Apps Móviles",
      instructor: "Laura Fernández",
      duration: "4 horas",
      level: "Intermedio",
      capacity: "25 participantes",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Crea aplicaciones móviles multiplataforma con React Native y Flutter.",
      topics: ["React Native", "Flutter", "Firebase", "App Store"],
      featured: false
    },
    {
      id: 6,
      title: "Internet of Things (IoT)",
      instructor: "Ing. David López",
      duration: "3 horas",
      level: "Intermedio",
      capacity: "20 participantes",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      description: "Desarrolla soluciones IoT integrando sensores, microcontroladores y cloud computing.",
      topics: ["Arduino", "Raspberry Pi", "Sensores", "Cloud IoT"],
      featured: false
    }
  ]);
  
  // Use computed signals to filter the data
  featuredWorkshops = computed(() => this.workshops().filter(w => w.featured));
  otherWorkshops = computed(() => this.workshops().filter(w => !w.featured));

  toggleTopics(id: number): void {
    this.workshops.update(workshops => 
      workshops.map(w => 
        w.id === id ? { ...w, isExpanded: !w.isExpanded } : w
      )
    );
  }

  /**
   * Returns a Tailwind class for the workshop's difficulty level.
   * @param level The workshop level.
   * @returns Tailwind CSS class string.
   */
  getLevelColor(level: 'Principiante' | 'Intermedio' | 'Avanzado'): string {
    const colors = {
      "Principiante": "bg-green-100 text-green-700",
      "Intermedio": "bg-yellow-100 text-yellow-700",
      "Avanzado": "bg-red-100 text-red-700"
    };
    return colors[level] || "bg-gray-100 text-gray-700";
  }

  /**
   * Handles navigation to the workshops catalog.
   */
  handleViewAllWorkshops(): void {
    window.location.href = '/workshop-activity-catalog';
  }

  /**
   * Handles navigation to the registration page.
   */
  handleRegister(): void {
    window.location.href = '/login-registration';
  }
}