import { Component } from '@angular/core';
import { 
  LucideAngularModule,
  Info,
  CheckCircle,
  Code,
  Trophy,
  Users,
  Award,
  Briefcase,
  Lightbulb,
  LucideIconData
} from 'lucide-angular';

@Component({
  selector: 'app-overview',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class Overview {
  readonly icons = {
    info: Info,
    checkCircle: CheckCircle,
    code: Code,
    trophy: Trophy,
    users: Users,
    award: Award,
    briefcase: Briefcase,
    lightbulb: Lightbulb
  };
  
  iconMap: Record<string, LucideIconData> = {
    info: Info,
    checkCircle: CheckCircle,
    code: Code,
    trophy: Trophy,
    users: Users,
    award: Award,
    briefcase: Briefcase,
    lightbulb: Lightbulb
  };

  features = [
    {
      icon: "code",
      title: "Talleres Especializados",
      description: "Aprende las últimas tecnologías con expertos de la industria en sesiones prácticas y dinámicas."
    },
    {
      icon: "trophy",
      title: "Competencias Técnicas",
      description: "Participa en desafíos de programación, hackathons y concursos de innovación tecnológica."
    },
    {
      icon: "users",
      title: "Networking Profesional",
      description: "Conecta con profesionales, estudiantes y empresas líderes del sector tecnológico."
    },
    {
      icon: "award",
      title: "Certificaciones",
      description: "Obtén certificados que validen tus conocimientos y habilidades adquiridas."
    },
    {
      icon: "briefcase",
      title: "Oportunidades",
      description: "Descubre prácticas profesionales y programas de desarrollo de carrera."
    },
    {
      icon: "lightbulb",
      title: "Innovación",
      description: "Conoce proyectos innovadores, y tendencias del ecosistema tecnológico."
    }
  ];
}
