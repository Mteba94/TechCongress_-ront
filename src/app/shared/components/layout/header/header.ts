import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { 
  LucideAngularModule,
  Zap,
  Home,
  Activity,
  Award,
  ArrowRight
} from 'lucide-angular';


@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  readonly icons = {
    zap: Zap,
    home: Home,
    activity: Activity,
    award: Award,
    arrowRight: ArrowRight
  };
}
