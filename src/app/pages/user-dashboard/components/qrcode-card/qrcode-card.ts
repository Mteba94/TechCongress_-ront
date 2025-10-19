import { Component, OnInit, signal, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, QrCode, User, CheckCircle, Info, Download, Share2, Loader } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AsistenciaService } from '../../../activities-workshop-management/services/asistencia.service';
import { firstValueFrom, forkJoin, map } from 'rxjs';
import { Auth } from '../../../login-registration/services/auth';
import { CurrentUser } from '../../../login-registration/models/user-resp.interface';
import { Actividad } from '../../../workshop-activity-catalog/services/actividad';
import { InscripcionService } from '../../../workshop-activity-catalog/services/inscripcion-service';
import { Activity } from '../../../workshop-activity-catalog/models/activity.interface';
import { SelectComponent } from '../../../../shared/components/reusables/select-component/select-component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

interface EnrollmentActivity extends Activity {
  inscripcionId: number;
  esGanador: boolean;
}

interface SelectOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-qrcode-card',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    Button,
    SelectComponent,
    ZXingScannerModule
  ],
  templateUrl: './qrcode-card.html',
  styleUrl: './qrcode-card.css'
})
export class QRCodeCard implements OnInit {
  @Input() user: CurrentUser | null = null; // User data from parent

  qrCodeData = signal<string | null>(null);
  sanitizedQrCodeSvg = signal<SafeHtml | null>(null);
  isDownloading = signal(false);
  isLoadingQr = signal(true);

  private readonly sanitizer = inject(DomSanitizer);
  private readonly asistenciaService = inject(AsistenciaService);
  private readonly authService = inject(Auth);
  private actividadService = inject(Actividad);
  private inscripcionService = inject(InscripcionService);

  readonly icons = {
    QrCode: QrCode,
    User: User,
    CheckCircle: CheckCircle,
    Info: Info,
    Download: Download,
    Share2: Share2,
    Loader: Loader
  };

  loading = signal(false);

  ngOnInit(): void {
    this.loadQrCode();
    this.loadMyEnrollments();
  }

  private async loadQrCode(activityId?: number): Promise<void> {
    this.isLoadingQr.set(true);
  this.qrCodeData.set(null);

  const currentUser = this.authService.currentUserValue;
  if (!currentUser || !currentUser.id) {
    console.error('User not logged in or user ID not available.');
    this.isLoadingQr.set(false);
    return;
  }

  try {
    const response = await firstValueFrom(
      this.asistenciaService.generateQRuser(currentUser.id, activityId) // 👈 enviamos también la actividad
      );

      if (response.isSuccess && response.data) {
        this.qrCodeData.set(response.data.qrCodeBase64Image);
      } else {
        console.error('Error generating QR code:', response.message);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    } finally {
      this.isLoadingQr.set(false);
    }
  }

  selectedActivityId = signal<number | null>(null);
  enrollmentActivities = signal<EnrollmentActivity[]>([]);
  activityOptions = signal<SelectOption[]>([]);

  onActivityChange(value: number) {
    // const target = event.target as HTMLSelectElement;
    // const value = Number(target.value);
    // this.selectedActivityId.set(value);
    //console.log('Actividad seleccionada:', value);

    this.loadQrCode(value);
  }

  async loadMyEnrollments() {
  this.loading.set(true);
  const user = await firstValueFrom(this.authService.currentUser$);
  if (user) {
    try {
      const response = await firstValueFrom(this.inscripcionService.ByUser(user.id));
      this.loading.set(false);

      if (response.isSuccess) {
        const inscriptionResponses = response.data;
        if (inscriptionResponses.length === 0) {
          this.enrollmentActivities.set([]);
          return;
        }

        const activityRequests = inscriptionResponses.map(inscripcion =>
          this.actividadService.getById(inscripcion.actividadId).pipe(
            map(activityResp => ({
              ...activityResp,
              inscripcionId: inscripcion.inscripcionId,
              esGanador: inscripcion.esGanador
            }))
          )
        );

        const activityResponses = await firstValueFrom(forkJoin(activityRequests));

        const enrollmentActivities: EnrollmentActivity[] = activityResponses.map(activityResp => {
          const activity = activityResp.data;
          return {
            ...activity,
            inscripcionId: activityResp.inscripcionId,
            esGanador: activityResp.esGanador,
          } as EnrollmentActivity;
        });

        // Guardamos la lista en la signal
        this.enrollmentActivities.set(enrollmentActivities);

        const options: SelectOption[] = enrollmentActivities.map(a => ({
          label: a.title,
          value: a.id
        }));

        this.activityOptions.set(options);

      }
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
    } finally {
      this.loading.set(false);
    }
  } else {
    this.loading.set(false);
  }
}

  handleDownload(): void {
    const qrCodeSvg = this.sanitizedQrCodeSvg();
    if (qrCodeSvg) {
      const svgString = this.sanitizer.sanitize(1, qrCodeSvg); // BypassSecurityTrustHtml
      if (svgString) {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${this.user?.name || 'participante'}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('Código QR descargado exitosamente');
      }
    }
  }

  handleShare(): void {
    const base64Image = this.qrCodeData();
    if (base64Image && navigator.share) {
      fetch(base64Image)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `qr-code-${this.user?.name || 'participante'}.png`, { type: 'image/png' });
          navigator.share({
            title: 'Mi Código QR - TechCongress 2025',
            text: `Código QR de ${this.user?.name || 'Participante'} para TechCongress 2025`,
            files: [file]
          }).catch(console.error);
        });
    } else if (base64Image) {
      navigator.clipboard.writeText(base64Image).then(() => {
        alert('Código QR copiado al portapapeles');
      });
    }
  }
}
