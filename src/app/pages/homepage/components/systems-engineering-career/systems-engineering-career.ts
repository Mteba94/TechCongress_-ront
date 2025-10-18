import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ArrowUpRight, BarChart3, BookOpen, Building, Cloud, Code, DollarSign, Globe, GraduationCap, Lightbulb, LucideAngularModule, LucideIconData, Shield, TrendingUp, UserPlus, Users } from 'lucide-angular';
import { CommonModule } from '@angular/common';

// Import Auth service
import { Auth } from '../../../login-registration/services/auth';

interface CareerPath {
  title: string;
  description: string;
  icon: LucideIconData;
  opportunities: string[];
}

interface Testimonial {
  name: string;
  role: string;
  year: string;
  image: string;
  quote: string;
}

interface Skill {
  name: string;
  level: number;
}

@Component({
  selector: 'app-systems-engineering-career',
  standalone: true, // Make it standalone
  imports: [
    LucideAngularModule,
    CommonModule // Add CommonModule to imports
  ],
  templateUrl: './systems-engineering-career.html',
  styleUrl: './systems-engineering-career.css'
})
export class SystemsEngineeringCareer implements OnInit {
  // Los datos se definen como señales para un manejo de estado eficiente
  careerPaths = signal<CareerPath[]>([]);
  testimonials = signal<Testimonial[]>([]);
  skills = signal<Skill[]>([]);
  whySection = signal<any[]>([]);

  private readonly router = inject(Router);
  private readonly authService = inject(Auth); // Inject Auth service

  isLoggedIn: boolean = false; // Property to hold auth state

  readonly icons = {
    graduationCap: GraduationCap,
    arrowUpRight: ArrowUpRight,
    userPlus: UserPlus,
    bookOpen: BookOpen,
    code: Code
  };

  constructor() { // Use constructor to set initial auth state
    this.isLoggedIn = this.authService.isAuthenticated;
  }

  ngOnInit() {
    // You can also subscribe to changes if the auth state can change during the component's lifetime
    this.authService.currentUser$.subscribe(() => {
        this.isLoggedIn = this.authService.isAuthenticated;
    });

    // ... rest of the ngOnInit logic from the original file
    // Inicialización de los datos de la sección "Especialidades y Oportunidades"
    this.careerPaths.set([
      {
        title: "Desarrollo de Software",
        description: "Crea aplicaciones, sistemas y plataformas digitales",
        icon: Code,
        opportunities: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer"],
      },
      {
        title: "Arquitectura de Sistemas",
        description: "Diseña y planifica infraestructuras tecnológicas complejas",
        icon: Building,
        opportunities: ["Solutions Architect", "System Architect", "Cloud Architect", "Enterprise Architect"],
      },
      {
        title: "Ciencia de Datos",
        description: "Analiza datos para generar insights y tomar decisiones",
        icon: BarChart3,
        opportunities: ["Data Scientist", "Data Analyst", "ML Engineer", "Business Intelligence"],
      },
      {
        title: "Ciberseguridad",
        description: "Protege sistemas y datos contra amenazas digitales",
        icon: Shield,
        opportunities: ["Security Analyst", "Ethical Hacker", "Security Consultant", "CISO"],
      },
      {
        title: "DevOps & Cloud",
        description: "Automatiza procesos y gestiona infraestructura en la nube",
        icon: Cloud,
        opportunities: ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer", "Platform Engineer"],
      },
      {
        title: "Gestión de Proyectos TI",
        description: "Lidera equipos y proyectos tecnológicos",
        icon: Users,
        opportunities: ["Project Manager", "Scrum Master", "Product Owner", "Technical Lead"],
      }
    ]);
    
    // Inicialización de los datos de los testimonios
    this.testimonials.set([
      {
        name: "Andrea López",
        role: "Software Engineer en Google",
        year: "Graduada 2020",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        quote: "La ingeniería de sistemas me abrió las puertas a trabajar en una de las empresas tecnológicas más importantes del mundo. Las bases que aprendí fueron fundamentales para mi carrera."
      },
      {
        name: "Miguel Rodríguez",
        role: "CTO en Startup Fintech",
        year: "Graduado 2018",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        quote: "Estudiar ingeniería de sistemas me dio la versatilidad para entender tanto la parte técnica como el negocio. Ahora lidero el desarrollo tecnológico de una fintech en crecimiento."
      },
      {
        name: "Carmen Silva",
        role: "Data Scientist en Microsoft",
        year: "Graduada 2019",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
        quote: "La formación integral en sistemas me permitió especializarme en ciencia de datos. Trabajo con algoritmos de machine learning que impactan a millones de usuarios."
      }
    ]);

    // Inicialización de los datos de las habilidades
    this.skills.set([
      { name: "Programación", level: 95 },
      { name: "Análisis de Sistemas", level: 90 },
      { name: "Base de Datos", level: 85 }
    ]);

    // Inicialización de los datos de la sección "Por qué Ingeniería de Sistemas"
    this.whySection.set([
      {
        title: "Alta Demanda Laboral",
        description: "El 85% de los graduados encuentra empleo en los primeros 6 meses. La transformación digital ha creado miles de oportunidades.",
        icon: TrendingUp
      },
      {
        title: "Excelentes Salarios",
        description: "Salarios competitivos desde el inicio, con crecimiento acelerado. Los profesionales senior pueden ganar más de €100,000 anuales.",
        icon: DollarSign
      },
      {
        title: "Trabajo Remoto",
        description: "Flexibilidad para trabajar desde cualquier lugar del mundo. Muchas empresas ofrecen modalidades híbridas o 100% remotas.",
        icon: Globe
      },
      {
        title: "Innovación Constante",
        description: "Trabaja con las últimas tecnologías y participa en proyectos que impactan positivamente la sociedad.",
        icon: Lightbulb
      }
    ]);
  }

  // Use a signal to track which paths are expanded
  expandedPaths = signal<Record<string, boolean>>({});

  // Function to toggle the expansion state for a given path
  toggleExpansion(pathTitle: string) {
    this.expandedPaths.update(paths => ({
      ...paths,
      [pathTitle]: !paths[pathTitle],
    }));
  }

  // Manejador para la redirección, se usó un enlace en el template para esta funcionalidad
  handleLearnMore(): void {
    this.router.navigate(['/workshop-activity-catalog']);
    //console.log('Navegando a /workshop-activity-catalog');
  }
}