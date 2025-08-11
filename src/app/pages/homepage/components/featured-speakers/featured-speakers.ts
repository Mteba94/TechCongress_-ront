import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { 
  LucideAngularModule,
  Users,
  ArrowRight,
  Linkedin,
  Twitter,
  Github,
  Dribbble
} from 'lucide-angular';

@Component({
  selector: 'app-featured-speakers',
  imports: [
    CommonModule,
    LucideAngularModule,
    RouterLink
  ],
  templateUrl: './featured-speakers.html',
  styleUrl: './featured-speakers.css'
})
export class FeaturedSpeakers {
  readonly icons = {
    users: Users,
    arrowRight: ArrowRight,
    linkedin: Linkedin,
    twitter: Twitter,
    github: Github,
    dribbble: Dribbble
  };

  speakers = [
    {
      id: 1,
      name: "Dr. María González",
      title: "Directora de Innovación",
      company: "TechCorp Solutions",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: ["Inteligencia Artificial", "Machine Learning", "Data Science"],
      bio: "Experta en IA con más de 15 años de experiencia en desarrollo de soluciones empresariales.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      id: 2,
      name: "Ing. Carlos Rodríguez",
      title: "Senior Software Architect",
      company: "Global Tech Inc.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: ["Cloud Computing", "DevOps", "Microservicios"],
      bio: "Arquitecto de software especializado en soluciones escalables y arquitecturas distribuidas.",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 3,
      name: "Ana Martínez",
      title: "UX/UI Design Lead",
      company: "Design Studio Pro",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: ["Diseño UX/UI", "Prototipado", "Design Thinking"],
      bio: "Diseñadora con enfoque en experiencia de usuario y metodologías de diseño centrado en el usuario.",
      social: {
        linkedin: "#",
        dribbble: "#"
      }
    },
    {
      id: 4,
      name: "Dr. Roberto Silva",
      title: "Cybersecurity Expert",
      company: "SecureNet Systems",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: ["Ciberseguridad", "Ethical Hacking", "Blockchain"],
      bio: "Especialista en seguridad informática con certificaciones internacionales y experiencia en consultoría.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      id: 5,
      name: "Laura Fernández",
      title: "Mobile Development Manager",
      company: "AppTech Solutions",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: ["Desarrollo Mobile", "React Native", "Flutter"],
      bio: "Gerente de desarrollo móvil con experiencia en aplicaciones multiplataforma y startups tecnológicas.",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      id: 6,
      name: "Ing. David López",
      title: "IoT Solutions Architect",
      company: "SmartTech Industries",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      expertise: ["Internet of Things", "Embedded Systems", "Industry 4.0"],
      bio: "Arquitecto de soluciones IoT especializado en automatización industrial y ciudades inteligentes.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    }
  ];
}
