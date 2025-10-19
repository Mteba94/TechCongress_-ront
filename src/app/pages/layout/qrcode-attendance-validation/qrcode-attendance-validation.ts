import { Component, effect, signal } from '@angular/core';
import { AlertCircle, AlertTriangle, CameraOff, CheckCircle, Info, LucideAngularModule, Pause, QrCode, Upload, WifiOff } from 'lucide-angular';
import { Button } from '../../../shared/components/reusables/button/button';
import { QRScanner } from '../../qrcode-attendance-validation/components/qrscanner/qrscanner';

export type ScanStep = 'scanner' | 'verification' | 'confirmation' | 'error';
export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'blocked' | 'not_supported';

export interface ActivityData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  schedule: {
    date: string;
    startTime: string;
    endTime: string;
    room: string;
  };
  validationWindow: {
    start: string;
    end: string;
  };
}

export interface ScanResult {
  activityId: string;
  sessionId: string;
  timestamp: string;
  // Propiedades opcionales de la entrada manual/simulada
  validationMethod?: 'qr_scan' | 'manual_entry';
}

export interface AttendanceRecord extends ScanResult {
  id: string;
  email: string;
  timestamp: string;
  activity: ActivityData;
  offline?: boolean; // Para marcar registros no sincronizados
}

export interface AttendanceError {
  type: string;
  message: string;
  originalError?: any;
}

// Datos Mock (similar a tu mockActivity)
export const MOCK_ACTIVITY: ActivityData = {
  id: 'act_001',
  title: 'React Avanzado - Hooks y Context',
  description: 'Taller intensivo sobre hooks personalizados y manejo de estado global',
  instructor: 'Ana García',
  schedule: { date: '2025-02-15', startTime: '10:00', endTime: '14:00', room: 'Sala A' },
  validationWindow: { start: '09:45', end: '14:15' }
};

@Component({
  selector: 'app-qrcode-attendance-validation',
  imports: [
    LucideAngularModule,
    Button,
    QRScanner
  ],
  templateUrl: './qrcode-attendance-validation.html',
  styleUrl: './qrcode-attendance-validation.css'
})
export class QRCodeAttendanceValidation {
  // --- Estado Persistente (Offline Queue) ---
  offlineQueue = signal<AttendanceRecord[]>([]);
  isOffline = signal<boolean>(!navigator.onLine);

  step = signal<ScanStep>('scanner');
  cameraSupported = signal<boolean>(true);
  permissionStatus = signal<PermissionStatus>('unknown');
  showManualEntry = signal<boolean>(false);
  error = signal<AttendanceError | null>(null);
  
  readonly icons = {
    QrCode,
    WifiOff,
    Upload,
    CheckCircle,
    AlertTriangle,
    CameraOff,
    AlertCircle,
    Info,
    Pause
  }

  // El effect se sincroniza automáticamente con localStorage cada vez que offlineQueue cambia
  private readonly queueEffect = effect(() => {
    localStorage.setItem('attendanceOfflineQueue', JSON.stringify(this.offlineQueue()));
  });
  
  // Dependencia simulada (puedes reemplazarla con un HttpClient en la vida real)
  // private api = inject(AttendanceApi); 

  constructor() {
    this.loadOfflineQueue();
    // No necesitamos manejar listeners de online/offline aquí, 
    // el componente lo hará y llamará a syncOfflineData.
  }

  // --- Inicialización ---

  private loadOfflineQueue(): void {
    const savedQueue = localStorage.getItem('attendanceOfflineQueue');
    if (savedQueue) {
      this.offlineQueue.set(JSON.parse(savedQueue));
    }
  }

  forceManualEntry(): void {
    // 🏆 Método requerido por el HTML 🏆
    this.error.set(null);
    this.showManualEntry.set(true);
    // Si la entrada manual requiere que el paso sea 'verification' para mostrar el formulario, se puede establecer:
    // this.step.set('verification');
    console.log('Forcing manual entry.');
  }

  resetScanner(): void {
    this.step.set('scanner');
    this.error.set(null);
    this.showManualEntry.set(false);
  }

  handleScanError(errorInfo: AttendanceError): void {
    console.error('Scan error received in Parent:', errorInfo);
    
    // Si el error es una solicitud explícita de entrada manual desde el escáner
    if (errorInfo.type === 'manual_entry_requested') {
      this.forceManualEntry(); // Llama al método para cambiar de vista
      return;
    }

    // El componente escáner (QRScannerComponent) ya debe haber determinado
    // el tipo de error (permiso, no_camera, etc.) y su mensaje.
    //this.setError(errorInfo);
    this.step.set('error'); // Muestra la pantalla de error centralizada
  }

  handleScanSuccess(scan: string){
    //this.setError(null);
    try {
      //const qrData: { activityId?: string, sessionId?: string } = JSON.parse(result);

      // if (!qrData?.activityId || !qrData?.sessionId) {
      //   throw new Error('QR data incomplete');
      // }

      // 1. Validar ventana de tiempo
      const now = new Date();
      // Nota: Esta validación es susceptible a la hora local del dispositivo.
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // if (currentTime < this.mockActivity.validationWindow.start ||
      //     currentTime > this.mockActivity.validationWindow.end) {
      //   this.setError({
      //     type: 'time_window',
      //     message: `La validación solo está disponible entre ${this.mockActivity.validationWindow.start} y ${this.mockActivity.validationWindow.end}.`
      //   });
      //   this.step.set('error');
      //   return;
      // }

      //this.scanResult.set(qrData as ScanResult);
      this.step.set('verification');

    } catch (e) {
      this.handleScanError({ type: 'scan_error', message: 'Error al procesar el código QR. Intenta escanearlo nuevamente.' });
    }
  }

  // --- Lógica de Permisos ---

  public async checkCameraAndPermissions(): Promise<{ supported: boolean, status: PermissionStatus }> {
    const result: { supported: boolean, status: PermissionStatus } = { supported: false, status: 'unknown' };

    if (!navigator?.mediaDevices?.getUserMedia) {
      result.status = 'not_supported';
      return result;
    }

    try {
      if (navigator.permissions) {
        const permissionResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
        result.supported = true;
        result.status = permissionResult.state as PermissionStatus;
        
        // Manejar cambios de permiso, crucial para UX
        permissionResult.onchange = () => {
          // El componente puede reaccionar a este cambio reactivamente
          console.log(`Permission state changed to: ${permissionResult.state}`);
        };
      } else {
        // Fallback: intenta acceder para forzar el prompt
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        result.supported = true;
        result.status = 'granted';
      }
    } catch (error) {
      result.status = 'denied';
      console.error('Camera check failed:', error);
    }
    return result;
  }

  // --- Lógica de Asistencia (Simulación de API) ---

  /** Simula la verificación de registro en el backend. */
  private async validateParticipant(email: string, activityId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const allowedEmails = ['student@university.edu', 'participant@email.com', 'attendee@congress.com'];
    return allowedEmails.includes(email) || email.endsWith('@university.edu');
  }

  /** Simula la verificación de asistencia duplicada. */
  private async checkDuplicateAttendance(email: string, activityId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const localAttendance = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    return localAttendance.some((record: AttendanceRecord) => 
      record.email === email && record.activityId === activityId
    );
  }

  /** Envía el registro de asistencia a la API y lo guarda localmente como backup. */
  private async submitAttendance(record: AttendanceRecord): Promise<void> {
    // Simular llamada de API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Guardar localmente como backup (DRY: reusa esta lógica)
    const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    existingRecords.push(record);
    localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));
    
    console.log(`[SERVER] Asistencia registrada: ${record.id}`);
  }

  // --- Lógica Central de Verificación ---

  /**
   * Procesa la verificación de correo, verifica duplicados y registra la asistencia.
   * Retorna el registro guardado o un error.
   */
  public async handleEmailVerification(email: string, scanData: ScanResult, isOffline: boolean): Promise<AttendanceRecord | AttendanceError> {
    // 1. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { type: 'invalid_email', message: 'Por favor ingresa un correo electrónico válido.' };
    }

    // 2. Verificar registro
    if (!(await this.validateParticipant(email, scanData.activityId))) {
      return { type: 'not_registered', message: 'No estás registrado para esta actividad. Contacta a los organizadores.' };
    }

    // 3. Verificar duplicado
    if (await this.checkDuplicateAttendance(email, scanData.activityId)) {
      return { type: 'duplicate', message: 'Tu asistencia ya fue validada anteriormente para esta actividad.' };
    }

    // 4. Crear registro
    const attendanceRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      email,
      activityId: scanData.activityId,
      sessionId: scanData.sessionId,
      timestamp: new Date().toISOString(),
      activity: MOCK_ACTIVITY, // Usar mock activity por simplicidad
      validationMethod: scanData.validationMethod || 'qr_scan'
    };

    if (isOffline) {
      // Offline: almacenar en la queue
      this.offlineQueue.update(queue => [...queue, { ...attendanceRecord, offline: true }]);
      return { ...attendanceRecord, offline: true };

    } else {
      // Online: enviar al servidor
      try {
        await this.submitAttendance(attendanceRecord);
        return attendanceRecord;
      } catch (error) {
        // Fallback: si falla el servidor, guardar localmente.
        this.offlineQueue.update(queue => [...queue, { ...attendanceRecord, offline: true }]);
        return { 
          type: 'server_error', 
          message: 'Error del servidor. Tu asistencia se guardó localmente y se sincronizará cuando haya conexión.'
        };
      }
    }
  }

  // --- Sincronización ---

  public async syncOfflineData(): Promise<void> {
    const queue = this.offlineQueue();
    if (queue.length === 0) {
      console.log('No hay datos offline para sincronizar.');
      return;
    }

    let successfulSyncs = 0;

    for (const record of queue) {
      try {
        await this.submitAttendance({ ...record, offline: false });
        successfulSyncs++;
      } catch (error) {
        console.warn(`Falló la sincronización del registro ${record.id}. Se mantendrá en la cola.`, error);
        // Si falla, el registro se mantiene en la cola para el próximo intento
      }
    }
    
    // Si hubo sincronizaciones exitosas, limpiamos la cola
    if (successfulSyncs > 0) {
        const remainingQueue = queue.slice(successfulSyncs); // Esto simplifica, asumiendo orden de sincronización
        this.offlineQueue.set(remainingQueue);
        console.log(`Sincronizados ${successfulSyncs} registros. Quedan ${remainingQueue.length} en la cola.`);
    }
    
    // Si todos fallaron o la cola se limpió:
    if (successfulSyncs === queue.length) {
        this.offlineQueue.set([]);
        localStorage.removeItem('attendanceOfflineQueue');
    }
  }

  public getNextSession() {
    return {
      title: 'Competencia de Algoritmos',
      time: '15:30',
      room: 'Aula Magna'
    };
  }
}
