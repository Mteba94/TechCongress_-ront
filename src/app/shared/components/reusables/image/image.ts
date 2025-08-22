import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image',
  imports: [],
  templateUrl: './image.html',
  styleUrl: './image.css'
})
export class Image {
  @Input() src!: string;
  @Input() alt: string = 'Image Name';
  @Input() className: string = '';

  public currentSrc: string = '';

  // Usar ngOnChanges para manejar los cambios de la propiedad src
  // de manera reactiva y actualizar el valor
  ngOnChanges(): void {
    this.currentSrc = this.src;
  }

  // Manejador para el evento de error de la imagen
  handleImageError(event: Event): void {
    // Al producirse un error de carga, se cambia la URL a la imagen de respaldo
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/no_image.png';
  }
}
