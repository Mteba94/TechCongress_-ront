import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LucideAngularModule, X, QrCode, Download, Loader } from 'lucide-angular';

@Component({
  selector: 'app-qr-code-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './qr-code-modal.html',
  styleUrls: ['./qr-code-modal.css']
})
export class QrCodeModal {
  // Inputs & Outputs
  isOpen = input<boolean>(false);
  qrCodeBase64 = input<string | null>(null);
  activityTitle = input<string>('');
  close = output<void>();

  // Icons
  readonly icons = {
    x: X,
    qrCode: QrCode,
    download: Download,
    loader: Loader
  };

  // Writable signal for the sanitized URL
  qrCodeUrl = signal<SafeUrl | null>(null);

  constructor(private sanitizer: DomSanitizer) {
    // Effect to react to input changes
    effect(() => {
      const b64 = this.qrCodeBase64();
      if (b64) {
        this.qrCodeUrl.set(this.sanitizer.bypassSecurityTrustUrl('data:image/png;base64,' + b64));
      } else {
        this.qrCodeUrl.set(null);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  downloadQrCode(): void {
    const url = this.qrCodeUrl();
    if (url) {
      const a = document.createElement('a');
      a.href = this.sanitizer.sanitize(4, url) || ''; // Unwraps the SafeUrl
      a.download = `QR_${this.activityTitle().replace(/ /g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
}
