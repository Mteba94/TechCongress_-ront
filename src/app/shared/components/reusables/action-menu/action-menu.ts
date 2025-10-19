import { Component, ElementRef, HostListener, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MoreVertical } from 'lucide-angular';
import { Button } from '../button/button';

@Component({
  selector: 'app-action-menu',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, Button],
  templateUrl: './action-menu.html',
  styleUrls: ['./action-menu.css']
})
export class ActionMenu {
  isOpen = signal(false);

  readonly icons = {
    moreVertical: MoreVertical
  };

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggle(): void {
    this.isOpen.update(open => !open);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
