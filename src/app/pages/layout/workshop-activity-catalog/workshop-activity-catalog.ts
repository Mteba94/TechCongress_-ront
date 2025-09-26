import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../login-registration/services/auth';
import { Header } from '../../../shared/components/layout/header/header';
import { Breadcrumbs } from '../../../shared/components/reusables/breadcrumbs/breadcrumbs';
import { Calendar, Info, LucideAngularModule } from 'lucide-angular';
import { SearchAndFilters } from '../../workshop-activity-catalog/components/search-and-filters/search-and-filters';
import { RegistrationCallToAction } from "../../../shared/components/reusables/registration-call-to-action/registration-call-to-action";
import { ActivityGrid } from '../../workshop-activity-catalog/components/activity-grid/activity-grid';
import { ActivityDetailModal } from '../../workshop-activity-catalog/components/activity-detail-modal/activity-detail-modal';
import { Router } from '@angular/router';
import { Actividad } from '../../workshop-activity-catalog/services/actividad';
import { ActividadResponse } from '../../workshop-activity-catalog/models/actividad-req.interface';

// Define the Enrollment type
interface Enrollment {
  activityId: number;
  userId: string;
}

@Component({
  selector: 'app-workshop-activity-catalog',
  imports: [
    CommonModule,
    FormsModule,
    Header,
    Breadcrumbs,
    LucideAngularModule,
    SearchAndFilters,
    RegistrationCallToAction,
    ActivityGrid,
    ActivityDetailModal
],
  templateUrl: './workshop-activity-catalog.html',
  styleUrl: './workshop-activity-catalog.css'
})
export class WorkshopActivityCatalog {
  readonly icons = {
    calendar: Calendar,
    info: Info
  }

  private readonly router = inject(Router)
  private readonly actividadService = inject(Actividad)

  paginatorOptions = {
    pageSizeOptions: [6, 12, 24],
    pageSize: 6,
    pageLength: 0,
  };

  // Estado de la aplicación
  searchQuery = signal('');
  filters = signal({
    category: 'all',
    difficulty: 'all',
    timeSlot: 'all',
    availability: 'all',
  });
  sortBy = signal('popularity');
  isFilterPanelOpen = signal(false);
  showMyEnrollments = signal(false);
  selectedActivity = signal<any | null>(null);
  isDetailModalOpen = signal(false);
  loading = signal(false);
  displayedActivities = signal<any[]>([]);
  hasMore = signal(true);
  isAuthenticated = signal(false);
  userEnrollments = signal<number[]>([]);
  enrollmentMessage = signal<string | null>(null);

  

  // Datos simulados (como en el original)
  readonly mockActivities = [
    {
      id: 1, title: "Desarrollo Web con React y Node.js", description: "Aprende a crear aplicaciones web modernas utilizando React para el frontend y Node.js para el backend.", fullDescription: `Este taller intensivo te enseñará los fundamentos y técnicas avanzadas para desarrollar aplicaciones web completas. Comenzaremos con los conceptos básicos de React, incluyendo componentes, hooks y gestión de estado, para luego integrar un backend robusto con Node.js y Express.

Durante el taller, construiremos una aplicación completa desde cero, implementando autenticación, bases de datos y APIs RESTful. También cubriremos mejores prácticas de desarrollo, testing y deployment.`, category: "workshop", difficulty: "intermediate", instructor: "Dr. María González", instructorBio: "Doctora en Ingeniería de Software con 10 años de experiencia en desarrollo web y profesora universitaria especializada en tecnologías JavaScript.", date: "15 de Febrero, 2025", startTime: "09:00", endTime: "17:00", duration: "8 horas", location: "Laboratorio de Computación A-201", capacity: 25, enrolled: 18, code: "WS001", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop", learningObjectives: [ "Dominar los conceptos fundamentales de React y sus hooks", "Implementar APIs RESTful con Node.js y Express", "Integrar bases de datos MongoDB con aplicaciones web", "Aplicar mejores prácticas de seguridad y autenticación", "Desplegar aplicaciones en servicios cloud" ], prerequisites: "Conocimientos básicos de JavaScript, HTML y CSS. Experiencia previa con programación orientada a objetos.", materials: [ "Laptop con Node.js instalado", "Editor de código (VS Code recomendado)", "Cuenta en GitHub", "Navegador web moderno" ]
    },
    {
      id: 2, title: "Competencia de Algoritmos y Estructuras de Datos", description: "Demuestra tus habilidades resolviendo problemas algorítmicos complejos en tiempo real.", fullDescription: `Una competencia emocionante donde los participantes pondrán a prueba sus conocimientos en algoritmos y estructuras de datos. Los problemas incluirán desde algoritmos de ordenamiento hasta grafos complejos y programación dinámica.

La competencia se divide en tres rondas: clasificatoria, semifinal y final. Los mejores participantes recibirán premios y reconocimientos especiales.`, category: "competition", difficulty: "advanced", instructor: "Ing. Carlos Rodríguez", instructorBio: "Ingeniero en Sistemas con experiencia en competencias internacionales de programación y mentor de equipos ACM-ICPC.", date: "16 de Febrero, 2025", startTime: "14:00", endTime: "18:00", duration: "4 horas", location: "Auditorio Principal", capacity: 50, enrolled: 35, code: "CP001", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop", learningObjectives: [ "Aplicar algoritmos de ordenamiento y búsqueda eficientemente", "Resolver problemas usando estructuras de datos avanzadas", "Optimizar soluciones para mejorar complejidad temporal", "Desarrollar estrategias de resolución de problemas" ], prerequisites: "Conocimientos sólidos en programación (C++, Java o Python) y estructuras de datos básicas.", materials: [ "Laptop con compilador instalado", "Conocimiento de al menos un lenguaje de programación", "Calculadora (opcional)" ]
    },
    {
      id: 3, title: "Introducción a la Inteligencia Artificial", description: "Explora los fundamentos de la IA y aprende a implementar algoritmos básicos de machine learning.", fullDescription: `Un taller introductorio que cubre los conceptos fundamentales de la inteligencia artificial y el machine learning. Los participantes aprenderán sobre diferentes tipos de algoritmos, desde regresión lineal hasta redes neuronales básicas.

Incluye sesiones prácticas con Python y bibliotecas populares como scikit-learn y TensorFlow. Al final del taller, cada participante habrá creado su primer modelo de machine learning.`, category: "workshop", difficulty: "beginner", instructor: "Dra. Ana Martínez", instructorBio: "Doctora en Inteligencia Artificial con publicaciones en revistas internacionales y experiencia en proyectos de investigación aplicada.", date: "17 de Febrero, 2025", startTime: "10:00", endTime: "16:00", duration: "6 horas", location: "Laboratorio de IA B-105", capacity: 30, enrolled: 28, code: "WS002", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop", learningObjectives: [ "Comprender los conceptos básicos de inteligencia artificial", "Implementar algoritmos de machine learning supervisado", "Utilizar Python y bibliotecas de ML para análisis de datos", "Evaluar y mejorar modelos de machine learning" ], prerequisites: "Conocimientos básicos de matemáticas y programación en Python.", materials: [ "Laptop con Python 3.8+ instalado", "Jupyter Notebook", "Bibliotecas: pandas, numpy, scikit-learn" ]
    },
    {
      id: 4, title: "Networking y Socialización Tecnológica", description: "Conecta con otros estudiantes y profesionales del sector tecnológico en un ambiente relajado.", fullDescription: `Un evento social diseñado para fomentar las conexiones profesionales y personales entre estudiantes, profesores y profesionales de la industria tecnológica. Incluye actividades de networking estructurado, presentaciones cortas de proyectos estudiantiles y tiempo libre para conversaciones informales.

El evento también incluye una sesión de mentoring donde profesionales experimentados comparten consejos de carrera y oportunidades en el sector tecnológico.`, category: "social", difficulty: "beginner", instructor: "Comité Organizador", instructorBio: "Equipo multidisciplinario de estudiantes y profesores comprometidos con el desarrollo de la comunidad tecnológica universitaria.", date: "18 de Febrero, 2025", startTime: "19:00", endTime: "22:00", duration: "3 horas", location: "Cafetería Central", capacity: 100, enrolled: 67, code: "SC001", image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=300&fit=crop", learningObjectives: [ "Establecer conexiones profesionales en el sector tecnológico", "Conocer oportunidades de carrera y proyectos actuales", "Desarrollar habilidades de comunicación y networking", "Intercambiar experiencias con otros estudiantes y profesionales" ], prerequisites: "Ninguno. Abierto a todos los participantes del congreso.", materials: [ "Tarjetas de presentación (opcional)", "Actitud positiva y ganas de conocer gente nueva" ]
    },
    {
      id: 5, title: "Ciberseguridad y Ethical Hacking", description: "Aprende técnicas de seguridad informática y ethical hacking para proteger sistemas y datos.", fullDescription: `Un taller intensivo sobre ciberseguridad que cubre desde conceptos básicos hasta técnicas avanzadas de ethical hacking. Los participantes aprenderán a identificar vulnerabilidades, realizar pruebas de penetración éticas y implementar medidas de seguridad robustas.

El taller incluye laboratorios prácticos con herramientas profesionales y casos de estudio reales de incidentes de seguridad.`, category: "workshop", difficulty: "advanced", instructor: "Ing. Roberto Silva", instructorBio: "Especialista certificado en ciberseguridad con más de 8 años de experiencia en consultoría de seguridad para empresas multinacionales.", date: "19 de Febrero, 2025", startTime: "08:30", endTime: "17:30", duration: "9 horas", location: "Laboratorio de Seguridad C-301", capacity: 20, enrolled: 20, code: "WS003", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&h=300&fit=crop", learningObjectives: [ "Identificar y evaluar vulnerabilidades en sistemas", "Utilizar herramientas de ethical hacking profesionales", "Implementar estrategias de defensa y mitigación", "Comprender marcos de trabajo de ciberseguridad" ], prerequisites: "Conocimientos sólidos en redes, sistemas operativos y programación básica.", materials: [ "Laptop con máquina virtual Linux", "Herramientas de seguridad preinstaladas", "Acceso a laboratorio virtual seguro" ]
    },
    {
      id: 6, title: "Desarrollo de Aplicaciones Móviles con Flutter", description: "Crea aplicaciones móviles multiplataforma usando Flutter y Dart.", fullDescription: `Aprende a desarrollar aplicaciones móviles nativas para iOS y Android utilizando Flutter, el framework de Google. El taller cubre desde la configuración del entorno hasta la publicación en las tiendas de aplicaciones.

Los participantes desarrollarán una aplicación completa durante el taller, incluyendo interfaz de usuario, navegación, gestión de estado y integración con APIs.`, category: "workshop", difficulty: "intermediate", instructor: "Ing. Laura Pérez", instructorBio: "Desarrolladora móvil senior con experiencia en Flutter, React Native y desarrollo nativo. Ha publicado más de 15 aplicaciones en las tiendas.", date: "20 de Febrero, 2025", startTime: "09:00", endTime: "18:00", duration: "9 horas", location: "Laboratorio Móvil D-202", capacity: 25, enrolled: 22, code: "WS004", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop", learningObjectives: [ "Dominar los fundamentos de Flutter y Dart", "Crear interfaces de usuario responsivas y atractivas", "Implementar navegación y gestión de estado", "Integrar APIs y servicios externos", "Preparar aplicaciones para publicación" ], prerequisites: "Conocimientos básicos de programación orientada a objetos. Experiencia con cualquier lenguaje de programación.", materials: [ "Laptop con Flutter SDK instalado", "Android Studio o VS Code", "Dispositivo móvil para pruebas (opcional)" ]
    },
    {
      id: 7, title: "Hackathon: Soluciones Innovadoras para Smart Cities", description: "Competencia de 24 horas para desarrollar soluciones tecnológicas innovadoras para ciudades inteligentes.", fullDescription: `Un hackathon intensivo de 24 horas donde equipos multidisciplinarios trabajarán para crear soluciones innovadoras que aborden desafíos reales de las ciudades inteligentes. Los temas incluyen movilidad urbana, gestión de recursos, sostenibilidad y calidad de vida ciudadana.

Los equipos tendrán acceso a mentores expertos, APIs de datos urbanos reales y herramientas de desarrollo. Al final, presentarán sus prototipos a un panel de jueces de la industria y academia.`, category: "competition", difficulty: "intermediate", instructor: "Equipo de Mentores", instructorBio: "Grupo de profesionales de la industria, investigadores y emprendedores especializados en tecnologías urbanas y smart cities.", date: "21-22 de Febrero, 2025", startTime: "18:00", endTime: "18:00", duration: "24 horas", location: "Centro de Innovación", capacity: 60, enrolled: 45, code: "CP002", image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop", learningObjectives: [ "Desarrollar soluciones tecnológicas bajo presión de tiempo", "Trabajar efectivamente en equipos multidisciplinarios", "Aplicar metodologías ágiles de desarrollo", "Presentar ideas de manera convincente a stakeholders" ], prerequisites: "Conocimientos en programación, diseño o análisis de datos. Experiencia en trabajo en equipo.", materials: [ "Laptop con herramientas de desarrollo", "Extensiones eléctricas y cargadores", "Ropa cómoda para 24 horas", "Snacks y bebidas (se proporcionarán comidas)" ]
    },
    {
      id: 8, title: "Blockchain y Criptomonedas: Fundamentos y Aplicaciones", description: "Explora la tecnología blockchain y sus aplicaciones en criptomonedas y contratos inteligentes.", fullDescription: `Un taller comprehensivo sobre tecnología blockchain que cubre desde los conceptos fundamentales hasta aplicaciones prácticas en criptomonedas, contratos inteligentes y DeFi. Los participantes aprenderán sobre diferentes tipos de blockchain, consenso y desarrollo de aplicaciones descentralizadas.

Incluye sesiones prácticas de desarrollo de smart contracts en Solidity y deployment en redes de prueba.`, category: "workshop", difficulty: "intermediate", instructor: "Dr. Miguel Torres", instructorBio: "Doctor en Criptografía con especialización en blockchain. Consultor para proyectos DeFi y autor de múltiples papers sobre tecnologías distribuidas.", date: "23 de Febrero, 2025", startTime: "10:00", endTime: "17:00", duration: "7 horas", location: "Aula Magna", capacity: 40, enrolled: 32, code: "WS005", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&h=300&fit=crop", learningObjectives: [ "Comprender los fundamentos de la tecnología blockchain", "Desarrollar contratos inteligentes básicos en Solidity", "Analizar casos de uso reales de blockchain", "Evaluar proyectos blockchain y criptomonedas" ], prerequisites: "Conocimientos básicos de programación y criptografía. Familiaridad con conceptos de redes distribuidas.", materials: [ "Laptop con MetaMask instalado", "Editor de código con extensión Solidity", "Acceso a testnet Ethereum" ]
    }
  ];

  // Lógica de filtrado y ordenamiento con computed
  filteredAndSortedActivities = computed(() => {
    let filtered = this.displayedActivities();
    const currentFilters = this.filters();
    const currentSearch = this.searchQuery();
    const currentSort = this.sortBy();
    const userEnrolls = this.userEnrollments();
    const myEnrollments = this.showMyEnrollments();

    // Aplicar filtro de búsqueda
    if (currentSearch) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        activity.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
        activity.instructor.toLowerCase().includes(currentSearch.toLowerCase())
      );
    }

    // Aplicar filtros de categoría, dificultad, etc.
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(activity => activity.category === currentFilters.category);
    }
    if (currentFilters.difficulty !== 'all') {
      filtered = filtered.filter(activity => activity.difficulty === currentFilters.difficulty);
    }
    if (currentFilters.timeSlot !== 'all') {
      filtered = filtered.filter(activity => {
        const startHour = parseInt(activity.startTime.split(':')[0]);
        switch (currentFilters.timeSlot) {
          case 'morning': return startHour >= 8 && startHour < 12;
          case 'afternoon': return startHour >= 13 && startHour < 17;
          case 'evening': return startHour >= 18 && startHour < 21;
          default: return true;
        }
      });
    }
    if (currentFilters.availability !== 'all') {
      filtered = filtered.filter(activity => {
        const spotsLeft = activity.capacity - activity.enrolled;
        switch (currentFilters.availability) {
          case 'available': return spotsLeft > 5;
          case 'waitlist': return spotsLeft > 0 && spotsLeft <= 5;
          case 'full': return spotsLeft <= 0;
          default: return true;
        }
      });
    }

    // Aplicar filtro "Mis inscripciones"
    if (myEnrollments) {
      filtered = filtered.filter(activity => userEnrolls.includes(activity.id));
    }

    // Aplicar ordenamiento
    return filtered.sort((a, b) => {
      switch (currentSort) {
        case 'popularity':
          return b.enrolled - a.enrolled;
        case 'schedule':
          return new Date(`2000-01-01T${a.startTime}`).getTime() - new Date(`2000-01-01T${b.startTime}`).getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        case 'availability':
          const spotsA = a.capacity - a.enrolled;
          const spotsB = b.capacity - b.enrolled;
          return spotsB - spotsA;
        default:
          return 0;
      }
    });
  });

  ngOnInit() {
    // Comprobar estado de autenticación y inscripciones
    const authStatus = localStorage.getItem('isAuthenticated');
    const enrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]');

    this.isAuthenticated.set(authStatus === 'true');
    this.userEnrollments.set(enrollments);

    this.loadInitialActivities();
  }

  // Métodos del componente
  loadInitialActivities() {
    this.loading.set(true);
    setTimeout(() => {
      this.displayedActivities.set(this.mockActivities.slice(0, 6));
      this.hasMore.set(this.mockActivities.length > 6);
      this.loading.set(false);
    }, 1000);
  }

  loadMoreActivities() {
    if (this.loading() || !this.hasMore()) return;

    this.loading.set(true);
    setTimeout(() => {
      const currentLength = this.displayedActivities().length;
      const nextActivities = this.mockActivities.slice(currentLength, currentLength + 3);
      this.displayedActivities.set([...this.displayedActivities(), ...nextActivities]);
      this.hasMore.set(currentLength + nextActivities.length < this.mockActivities.length);
      this.loading.set(false);
    }, 1000);
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }

  setFilters(newFilters: any) {
    this.filters.set(newFilters);
  }

  setSortBy(newSortBy: string) {
    this.sortBy.set(newSortBy);
  }

  handleEnroll(activity: any) {
    if (!this.isAuthenticated()) {
      // Simulación de redirección, ya que no se puede en el entorno de Canvas

      this.router.navigate(['/login-registration']);
      //console.log('Redirigiendo a la página de login...');
      return;
    }

    if (this.userEnrollments().includes(activity.id)) {
      this.enrollmentMessage.set(`Ya estás inscrito en "${activity.title}".`);
      setTimeout(() => this.hideEnrollmentMessage(), 3000);
      return;
    }

    const newEnrollments = [...this.userEnrollments(), activity.id];
    this.userEnrollments.set(newEnrollments);
    localStorage.setItem('userEnrollments', JSON.stringify(newEnrollments));

    // Actualizar conteo de inscripciones en los datos simulados
    const updatedActivities = this.displayedActivities().map(act =>
      act.id === activity.id ? { ...act, enrolled: act.enrolled + 1 } : act
    );
    this.displayedActivities.set(updatedActivities);

    const updatedMockActivities = this.mockActivities.map(act =>
      act.id === activity.id ? { ...act, enrolled: act.enrolled + 1 } : act
    );
    this.mockActivities.splice(0, this.mockActivities.length, ...updatedMockActivities);
    
    // Ocultar modal si la inscripción viene de ahí
    this.isDetailModalOpen.set(false);

    // Mostrar mensaje de éxito
    this.enrollmentMessage.set(`¡Te has inscrito exitosamente en "${activity.title}"!`);
    setTimeout(() => this.hideEnrollmentMessage(), 3000);
  }

  hideEnrollmentMessage() {
    this.enrollmentMessage.set(null);
  }

  handleViewDetails(activity: any) {
    this.selectedActivity.set(activity);
    this.isDetailModalOpen.set(true);
  }

  handleToggleFilterPanel() {
    this.isFilterPanelOpen.update(val => !val);
  }

  handleCloseDetailsModal() {
    this.isDetailModalOpen.set(false);
  }

  handleToggleMyEnrollments() {
    this.showMyEnrollments.update(val => !val);
  }
}

