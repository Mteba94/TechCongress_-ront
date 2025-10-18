import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Award, Calendar, CheckCircle, Clock, LucideAngularModule, LucideIconData, User, Download, Share2, Trash2, BookOpen, AlertCircle, Shield } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { InscripcionService } from '../../../workshop-activity-catalog/services/inscripcion-service';
import { Auth } from '../../../login-registration/services/auth';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { Actividad } from '../../../workshop-activity-catalog/services/actividad';
import { InscripcionResponse } from '../../../workshop-activity-catalog/models/inscripcion-resp.interface';
import { Activity } from '../../../workshop-activity-catalog/models/activity.interface';
import { NotificacionService } from '../../../../shared/services/notificacion-service';
import { Router } from '@angular/router';
import { NotificationsAlert } from '../../../../shared/components/reusables/notifications-alert/notifications-alert';

interface Certificate extends Activity {
  inscripcionId: number;
  credentialId?: string;
  achievement?: string;
  status: 'available' | 'processing' | 'pending';
  downloadUrl?: string;
  issueDate: string;
}

@Component({
  selector: 'app-certificates-section',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    Button,
  ],
  templateUrl: './certificates-section.html',
  styleUrl: './certificates-section.css'
})
export class CertificatesSection implements OnInit {
  certificates = signal<Certificate[]>([]);
  isDownloading = signal<Record<number, boolean>>({});
  enrollmentMessage = signal<string | null>(null);
  isEnrollmentError = signal<boolean>(false);

  readonly icons = {
    Award: Award,
    User: User,
    Clock: Clock,
    Calendar: Calendar,
    CheckCircle: CheckCircle,
    Download: Download,
    Share2: Share2,
    BookOpen: BookOpen,
    AlertCircle: AlertCircle,
    Shield: Shield
  };

  private inscripcionService = inject(InscripcionService);
  private authService = inject(Auth);
  private actividadService = inject(Actividad);
  private notificationService = inject(NotificacionService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadCertificates();
  }

  async loadCertificates(): Promise<void> {
    const user = await firstValueFrom(this.authService.currentUser$);;
    if (!user) return;

    try {
      const response = await firstValueFrom(this.inscripcionService.ByUser(user.id));
      if (response.isSuccess && response.data) {
        const certificateInscriptions = response.data.filter(insc => insc.esGanador);

        if (certificateInscriptions.length === 0) {
          this.certificates.set([]);
          return;
        }

        const activityRequests = certificateInscriptions.map(inscripcion =>
          this.actividadService.getById(inscripcion.actividadId).pipe(
            map(activityResp => ({
              ...activityResp.data,
              inscripcionId: inscripcion.inscripcionId,
              credentialId: `TC2025-${activityResp.data.code}-${inscripcion.inscripcionId}`,
              achievement: activityResp.data.statusActivity === 'Completado' ? 'Completado' : undefined, // Example achievement
              status: 'available', // Assuming all fetched are available
              issueDate: activityResp.data.date, // Assuming issue date is activity date
              downloadUrl: '', // Will be generated on demand
            }) as Certificate)
          )
        );

        const fetchedCertificates = await firstValueFrom(forkJoin(activityRequests));
        this.certificates.set(fetchedCertificates);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);

      this.enrollmentMessage.set(`Error al cargar los certificados`);
      setTimeout(() => this.hideEnrollmentMessage(), 3000);

      this.notificationService.show('Error al cargar los certificados.', 'error');
    }
  }

  hideEnrollmentMessage() {
    this.enrollmentMessage.set(null);
  }

  get availableCertificates(): Certificate[] {
    return this.certificates().filter(cert => cert.status === 'available');
  }

  get processingCertificates(): Certificate[] {
    return this.certificates().filter(cert => cert.status === 'processing');
  }

  getStatusInfo(status: 'available' | 'processing' | 'pending'): { icon: LucideIconData; color: string; bgColor: string; text: string } {
    switch (status) {
      case 'available':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          text: 'Disponible'
        };
      case 'processing':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          text: 'Procesando'
        };
      case 'pending':
        return {
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          text: 'Pendiente'
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          text: 'Desconocido'
        };
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'Taller':
        return 'bg-blue-100 text-blue-800';
      case 'Competencia':
        return 'bg-red-100 text-red-800';
      case 'Conferencia':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  async handleDownload(certificate: Certificate): Promise<void> {
    this.isDownloading.update(prev => ({ ...prev, [certificate.inscripcionId]: true }));
    try {
      const request = {
        inscripcionId: certificate.inscripcionId,
        nombrePersonalizado: '' // You might want to get this from somewhere else
      };
      const response = await firstValueFrom(this.inscripcionService.GenerateDiploma(request));
      if (response.isSuccess && response.data) {
        this.notificationService.show('Diploma generado exitosamente.', 'success');
        const base64Pdf = response.data;
        const byteCharacters = atob(base64Pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificado-${certificate.credentialId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        this.notificationService.show(response.message || 'Error al generar el diploma.', 'error');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      this.notificationService.show('Error al descargar el certificado.', 'error');
    }
      finally {
      this.isDownloading.update(prev => ({ ...prev, [certificate.inscripcionId]: false }));
    }
  }

  handleShare(certificate: Certificate): void {
    const shareData = {
      title: `Certificado - ${certificate.title}`,
      text: `He completado exitosamente: ${certificate.title} en TechCongress 2025`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(error => console.error('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.text} - ${shareData.url}`;
      navigator.clipboard.writeText(text).then(() => {
        this.notificationService.show('Información del certificado copiada al portapapeles', 'success');
      }).catch(error => {
        console.error('Error copying to clipboard:', error);
        this.notificationService.show('Error al copiar al portapapeles', 'error');
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }
}