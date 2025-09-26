import { Component, signal } from '@angular/core';
import { Award, LucideAngularModule, Trophy, Users, Zap } from 'lucide-angular';

@Component({
  selector: 'app-congress-highlights',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './congress-highlights.html',
  styleUrl: './congress-highlights.css'
})
export class CongressHighlights {
  readonly icons = {
    zap: Zap
  }
  readonly highlights = signal([
    {
      icon: Users,
      title: 'Más de 2,000 Participantes',
      description: 'Estudiantes de toda la región se unen para aprender y competir'
    },
    {
      icon: Award,
      title: 'Certificaciones Oficiales',
      description: 'Obtén certificados reconocidos por la industria tecnológica'
    },
    {
      icon: Zap,
      title: 'Talleres Prácticos',
      description: 'Aprende tecnologías emergentes con expertos del sector'
    },
    {
      icon: Trophy,
      title: 'Competencias Técnicas',
      description: 'Demuestra tus habilidades y gana premios increíbles'
    }
  ]);

  readonly testimonials = signal([
    {
      name: 'María Fernanda López',
      role: 'Estudiante de Bachillerato',
      school: 'Colegio San Patricio',
      content: `El TechCongress cambió mi perspectiva sobre la ingeniería de sistemas. Los talleres fueron increíbles y ahora tengo claro que quiero estudiar esta carrera.`,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Carlos Andrés Ruiz',
      role: 'Estudiante Universitario',
      school: 'Universidad Nacional',
      content: `Participar en las competencias me ayudó a aplicar lo aprendido en clase. Fue una experiencia enriquecedora que recomiendo a todos.`,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ]);
}
