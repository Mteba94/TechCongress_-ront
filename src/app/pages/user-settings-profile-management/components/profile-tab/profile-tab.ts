import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Upload, Trash2, User, Loader, AlertTriangle } from 'lucide-angular';
import { InputComponent } from '../../../../shared/components/reusables/input/input';
import { SelectComponent, SelectOption } from '../../../../shared/components/reusables/select-component/select-component';
import { Button } from '../../../../shared/components/reusables/button/button';
import { School } from '../../../login-registration/services/school';
import { NivelAcademico } from '../../../login-registration/services/nivel-academico';
import { Auth } from '../../../login-registration/services/auth';
import { Subject, takeUntil } from 'rxjs';

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  grade?: string;
  bio?: string;
  profileImage?: string | null;
}

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    InputComponent,
    SelectComponent,
    Button
  ],
  templateUrl: './profile-tab.html',
  styleUrl: './profile-tab.css'
})
export class ProfileTab implements OnInit, OnDestroy {
  @Input() user: any;
  @Output() onDataChange = new EventEmitter<void>();

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private readonly schoolService = inject(School);
  private readonly nivelAcademicoService = inject(NivelAcademico);
  private readonly authService = inject(Auth);
  private readonly destroy$ = new Subject<void>();

  readonly icons = {
    Upload: Upload,
    Trash2: Trash2,
    User: User,
    Loader: Loader,
    AlertTriangle: AlertTriangle
  };

  profileData = signal<ProfileData>({
    name: '',
    email: '',
    phone: '',
    institution: '',
    grade: '',
    bio: '',
    profileImage: null
  });
  isUploading = signal(false);

  institutionOptions = signal<SelectOption[]>([]);
  gradeOptions = signal<SelectOption[]>([]);

  ngOnInit(): void {
    this.loadOptions();
    if (this.user) {
      this.profileData.set({
        name: this.user.name || '',
        email: this.user.email || '',
        phone: this.user.phone || '',
        institution: this.user.institution || '',
        grade: this.user.grade || '',
        bio: this.user.bio || '',
        profileImage: this.user.profileImage || null
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOptions(): void {
    this.schoolService.getSelectSchool().pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp.isSuccess) {
        this.institutionOptions.set(resp.data.map(item => ({ value: item.id.toString(), label: item.nombre })));
      }
    });

    this.nivelAcademicoService.getSelectNivelAcademico().pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp.isSuccess) {
        this.gradeOptions.set(resp.data.map(item => ({ value: item.id.toString(), label: item.nombre })));
      }
    });
  }

  handleInputChange(field: keyof ProfileData, value: Event): void {
    this.profileData.update(prev => ({
      ...prev,
      [field]: value
    }));
    this.onDataChange.emit();
  }

  handleSelectChange(field: keyof ProfileData, value: string): void {
    this.profileData.update(prev => ({
      ...prev,
      [field]: value
    }));
    this.onDataChange.emit();
  }

  handleImageUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.isUploading.set(true);
      // Simulate image upload
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file);
        this.profileData.update(prev => ({
          ...prev,
          profileImage: imageUrl
        }));
        this.isUploading.set(false);
        this.onDataChange.emit();
      }, 2000);
    }
  }

  removeImage(): void {
    this.profileData.update(prev => ({
      ...prev,
      profileImage: null
    }));
    this.onDataChange.emit();
  }
}