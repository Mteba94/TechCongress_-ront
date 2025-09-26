import { Component } from '@angular/core';
import { Clock, Facebook, Instagram, Linkedin, LucideAngularModule, Mail, MapPin, Phone, Send, Twitter, Youtube, Zap } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
   readonly icons = {
    zap: Zap,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
    youtube: Youtube,
    mapPin: MapPin,
    phone: Phone,
    mail: Mail,
    clock: Clock,
    send: Send
  }
  public currentYear = () => new Date().getFullYear();

  public quickLinks = [
    { label: "Inicio", path: "/congress-homepage" },
    { label: "Actividades", path: "/workshop-activity-catalog" },
    { label: "Resultados", path: "/competition-results-winners" },
    { label: "Mi Panel", path: "/user-dashboard" }
  ];

  public supportLinks = [
    { label: "Preguntas Frecuentes", path: "#faq" },
    { label: "Contacto", path: "#contact" },
    { label: "Soporte Técnico", path: "#support" },
    { label: "Términos y Condiciones", path: "#terms" }
  ];

  public socialLinks = [
    { name: "Facebook", icon: "facebook", url: "https://facebook.com/techcongress" },
    { name: "Twitter", icon: "twitter", url: "https://twitter.com/techcongress" },
    { name: "LinkedIn", icon: "linkedin", url: "https://linkedin.com/company/techcongress" },
    { name: "Instagram", icon: "instagram", url: "https://instagram.com/techcongress" },
    { name: "YouTube", icon: "youtube", url: "https://youtube.com/techcongress" }
  ];
  
  public handleNavigation(path: string): void {
    if (path.startsWith('#')) {
      const element = document.getElementById(path.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = path;
    }
  }
}
