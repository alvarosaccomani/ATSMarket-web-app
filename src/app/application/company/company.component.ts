import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSwitchModule } from 'ng-zorro-antd/switch';

import { MessageService } from '@services/message.service';
import { CompaniesService } from '@services/companies.service';

@Component({
  selector: 'app-company',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzSpaceModule,
    NzIconModule,
    NzUploadModule,
    NzGridModule,
    NzSwitchModule
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanyComponent implements OnInit {

  public companyForm!: FormGroup;
  public logoFileList: NzUploadFile[] = [];
  public bannerFileList: NzUploadFile[] = [];
  public isEditing: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private location: Location,
    private _messageService: MessageService,
    private _companiesService: CompaniesService
  ) { }

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      cmp_uuid: [''],
      cmp_name: ['', [Validators.required, Validators.minLength(3)]],
      cmp_slug: ['', Validators.required],
      cmp_address: [''],
      cmp_phone: [''],
      cmp_email: ['', [Validators.email]],
      cmp_description: [''],
      cmp_status: ['active', Validators.required],
      // Nuevos campos migrados desde settings
      cmp_currency: ['ARS', Validators.required],
      cmp_whatsapp: [''],
      cmp_instagram: [''],
      cmp_facebook: [''],
      cmp_allowbackorders: [true],
      cmp_primarycolor: ['#1890ff']
    });

    this._route.params.subscribe(params => {
      const cmp_uuid = params['cmp_uuid'];
      if (cmp_uuid && cmp_uuid !== 'new') {
        this.isEditing = true;
        this.getCompanyById(cmp_uuid);
      }
    });

    // Auto-generate slug from name si es nuevo
    this.companyForm.get('cmp_name')?.valueChanges.subscribe(val => {
      if (!this.isEditing && val) {
        const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        this.companyForm.patchValue({ cmp_slug: slug }, { emitEvent: false });
      }
    });
  }

  private getCompanyById(cmp_uuid: string): void {
    this.isLoading = true;
    this._companiesService.getCompanyById(cmp_uuid).subscribe({
      next: (res) => {
        if (res.data) {
          const company = res.data;
          this.companyForm.patchValue(company);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this._messageService.error('Error', 'No se pudo cargar la información de la empresa.');
        this.isLoading = false;
      }
    });
  }

  public beforeUploadLogo = (file: NzUploadFile): boolean => {
    this.logoFileList = [file];
    return false;
  };

  public beforeUploadBanner = (file: NzUploadFile): boolean => {
    this.bannerFileList = [file];
    return false;
  };

  public onSave(): void {
    if (this.companyForm.valid) {
      const cmp_uuid = this.companyForm.get('cmp_uuid')?.value;
      const data = this.companyForm.value;

      this.isLoading = true;
      if (this.isEditing) {
        this._companiesService.updateCompany(cmp_uuid, data).subscribe({
          next: () => {
            this._messageService.success('¡Éxito!', 'Los datos de la empresa han sido actualizados.', () => {
              this.location.back();
            });
            this.isLoading = false;
          },
          error: (err) => {
            this._messageService.error('Error', 'Hubo un problema al guardar los cambios.');
            this.isLoading = false;
          }
        });
      } else {
        // Lógica para crear nueva empresa (pendiente si se requiere)
        console.log('Crear nueva empresa:', data);
        this.isLoading = false;
      }
    } else {
      Object.values(this.companyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public onCancel(): void {
    this.location.back();
  }
}
