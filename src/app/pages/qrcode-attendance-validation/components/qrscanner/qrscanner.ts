import { Component, ElementRef, inject, output, signal, ViewChild } from '@angular/core';
import { AttendanceError, AttendanceRecord, MOCK_ACTIVITY, PermissionStatus, QRCodeAttendanceValidation, ScanResult, ScanStep } from '../../../layout/qrcode-attendance-validation/qrcode-attendance-validation';
import { Camera, CameraOff, HelpCircle, Info, Lightbulb, LucideAngularModule, Target } from 'lucide-angular';
import { Button } from '../../../../shared/components/reusables/button/button';
import { CommonModule } from '@angular/common';

interface PermissionError {
  type: string;
  message: string;
}

@Component({
  selector: 'app-qrscanner',
  imports: [
    CommonModule,
    LucideAngularModule,
    Button
  ],
  templateUrl: './qrscanner.html',
  styleUrl: './qrscanner.css'
})
export class QRScanner {
  readonly icons ={
    Lightbulb,
    Target,
    HelpCircle,
    Info,
    CameraOff,
    Camera
  }
  // --- Estado Local (Signals) para la Interfaz ---
  // --- Inputs y Outputs (Props) ---
  onScanSuccess = output<string>();
  // El error de la plantilla necesita que el output sea 'onScanError'
  onScanError = output<PermissionError>();

  // --- ViewChild (useRef) ---
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  // --- Estado (useState -> Signals) ---
  // 🏆 PROPIEDAD REQUERIDA POR EL HTML 🏆
  isScanning = signal(false); 
  hasPermission = signal<boolean | null>(null); 
  permissionError = signal<PermissionError | null>(null);
  scanningAnimation = signal(false);
  retryCount = signal(0);
  showPermissionGuide = signal(false);

  // --- Propiedades Internas ---
  scanIntervalRef: any; 
  private stream: MediaStream | null = null; 

  // --- Ciclo de Vida (useEffect) ---

  ngOnInit(): void {
    this.checkPermissions();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  // --- Lógica de Permisos ---

  private async checkPermissions(): Promise<void> {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        this.handlePermissionError({
          type: 'not_supported',
          message: 'Tu navegador no soporta acceso a la cámara. Usa la entrada manual.',
        });
        return;
      }

      if (navigator?.permissions?.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        
        if (permissionStatus?.state === 'denied') {
          this.handlePermissionError({
            type: 'permanently_denied',
            message: 'Los permisos de cámara están bloqueados permanentemente.',
          });
          this.showPermissionGuide.set(true);
          return;
        }
      }

      await this.initializeCamera();
    } catch (error) {
      this.handlePermissionError(error as DOMException);
    }
  }

  private async initializeCamera(): Promise<void> {
    try {
      this.permissionError.set(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', 
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      this.hasPermission.set(true);
      this.retryCount.set(0);

      // Usar setTimeout para asegurar que la vista (videoRef) se haya inicializado
      setTimeout(() => {
        const video = this.videoRef.nativeElement;

        if (video) {
          video.srcObject = this.stream;

          video.onloadedmetadata = () => {
            video.play().then(() => {
              this.isScanning.set(true);
              this.startScanning();
            }).catch(error => {
              console.error('Video play error:', error);
              this.handlePermissionError(error as DOMException);
            });
          };
        }
      }, 0); 
    } catch (error) {
      console.error('Camera access error:', error);
      this.handlePermissionError(error as DOMException);
    }
  }

  private handlePermissionError(error: PermissionError | DOMException): void {
    console.error('Camera permission error:', error);

    this.hasPermission.set(false);
    this.isScanning.set(false);

    let errorInfo: PermissionError = {
      type: 'unknown',
      message: 'Error desconocido al acceder a la cámara.'
    };
    
    if ('name' in error) {
      switch (error.name) {
        case 'NotAllowedError':
          errorInfo = { type: 'permission_denied', message: 'Acceso a la cámara denegado. Para escanear códigos QR, necesitas permitir el acceso a la cámara.' };
          this.showPermissionGuide.set(true);
          break;
        case 'NotFoundError':
          errorInfo = { type: 'no_camera', message: 'No se encontró una cámara en tu dispositivo.' };
          break;
        case 'NotSupportedError':
          errorInfo = { type: 'not_supported', message: 'Tu navegador no soporta acceso a la cámara.' };
          break;
        case 'NotReadableError':
          errorInfo = { type: 'camera_busy', message: 'La cámara está siendo usada por otra aplicación.' };
          break;
        case 'OverconstrainedError':
          errorInfo = { type: 'constraints_error', message: 'No se pudo configurar la cámara con las especificaciones requeridas.' };
          break;
        default:
          errorInfo.message = (error as any).message || errorInfo.message;
      }
    } else {
      errorInfo = error;
    }

    this.permissionError.set(errorInfo);
    this.onScanError.emit(errorInfo);
  }
  
  // --- Lógica de Escaneo ---

  private startScanning(): void {
    if (this.scanIntervalRef) return;
    
    this.scanningAnimation.set(true);
    
    this.scanIntervalRef = setInterval(() => {
      this.scanQRCode();
    }, 500);
  }

  private stopScanning(): void {
    if (this.scanIntervalRef) {
      clearInterval(this.scanIntervalRef);
      this.scanIntervalRef = null;
    }
    this.scanningAnimation.set(false);
  }

  private stopCamera(): void {
    this.stopScanning();
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.isScanning.set(false);
  }

  private scanQRCode(): void {
    if (!this.videoRef?.nativeElement || !this.canvasRef?.nativeElement) return;
    
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    
    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      try {
        this.simulateQRDetection();
      } catch (error) {
        console.error('QR scanning error:', error);
      }
    }
  }

  private simulateQRDetection(): void {
    if (Math.random() < 0.1) {
      const mockQRData = JSON.stringify({
        activityId: 'act_001',
        sessionId: 'sess_' + Date.now(),
        timestamp: new Date().toISOString(),
        event: 'congress_2025'
      });
      
      this.stopScanning();
      this.onScanSuccess.emit(mockQRData);
    }
  }

  // --- Métodos de Acción ---

  /** 🏆 MÉTODO REQUERIDO POR EL HTML (handleRetryCamera) 🏆 */
  handleRetryCamera(): void {
    this.retryCount.update(c => c + 1);
    this.permissionError.set(null);
    this.showPermissionGuide.set(false);
    
    this.stopCamera();
    
    setTimeout(() => {
      this.initializeCamera();
    }, 500);
  }

  // Método usado en el HTML para iniciar/pausar
  toggleScanning(): void {
    if (this.isScanning()) {
      this.stopScanning();
    } else {
      this.startScanning();
    }
  }


  getPermissionInstructions() {
    const userAgent = navigator?.userAgent?.toLowerCase();
    
    if (userAgent?.includes('chrome')) {
      return { browser: 'Chrome', steps: ['Haz clic en el ícono de cámara en la barra de direcciones', 'Selecciona "Permitir siempre" para este sitio', 'Recarga la página si es necesario'] };
    }
    if (userAgent?.includes('firefox')) {
      return { browser: 'Firefox', steps: ['Haz clic en el ícono de escudo/cámara en la barra de direcciones', 'Selecciona "Permitir" para el acceso a la cámara', 'Marca "Recordar esta decisión"'] };
    }
    if (userAgent?.includes('safari')) {
      return { browser: 'Safari', steps: ['Ve a Safari > Preferencias > Sitios web', 'Selecciona "Cámara" en la lista lateral', 'Cambia este sitio a "Permitir"'] };
    }
    
    return { browser: 'Tu navegador', steps: ['Busca el ícono de cámara en la barra de direcciones', 'Permite el acceso a la cámara para este sitio', 'Recarga la página si es necesario'] };
  }
}
