import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-icon',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './icon.html',
  styleUrl: './icon.css'
})
export class Icon {
  @Input({ required: true }) iconName!: string;
  @Input() size: string = '1.25rem';
  @Input() color: string = 'currentColor';

  ngOnInit(): void {
    // Aquí puedes añadir validaciones o lógica si es necesario
    // Por ejemplo, verificar si el nombre del icono existe.
  }

}
