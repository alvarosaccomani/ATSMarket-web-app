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
import { SessionService } from '@services/session.service';
import { UserRolesCompanyService } from '@services/user-roles-company.service';
import { StorageService } from '@services/storage.service';
import { MapPickerComponent, SelectedLocation } from '../../shared/components/map-picker/map-picker.component';

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
    NzSwitchModule,
    MapPickerComponent
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
  public showMapPicker: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private location: Location,
    private _messageService: MessageService,
    private _companiesService: CompaniesService,
    private _sessionService: SessionService,
    private _userRolesCompanyService: UserRolesCompanyService,
    private _storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      cmp_uuid: [''],
      cmp_name: ['', [Validators.required, Validators.minLength(3)]],
      cmp_slug: ['', Validators.required],
      cmp_address: [''],
      cmp_lat: [null],
      cmp_lng: [null],
      cmp_phone: [''],
      cmp_email: ['', [Validators.email]],
      cmp_description: [''],
      cmp_status: ['active', Validators.required],
      cmp_logo: [''],
      cmp_banner: [''],
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
          const company: any = Array.isArray(res.data) ? res.data[0] : res.data;
          this.companyForm.patchValue(company);

          // Inicializar miniaturas si existen
          if (company.cmp_logo) {
            this.logoFileList = [{
              uid: '-1',
              name: 'logo.webp',
              status: 'done',
              url: company.cmp_logo
            }];
          }
          if (company.cmp_banner) {
            this.bannerFileList = [{
              uid: '-2',
              name: 'banner.webp',
              status: 'done',
              url: company.cmp_banner
            }];
          }
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
    const rawFile: File = (file.originFileObj as File) || (file as any);
    if (!rawFile) return false;

    const usr_uuid = this._sessionService.getIdentity()?.usr_uuid || 'admin';

    // 1. Mostrar estado de carga en la lista de nz-upload
    this.logoFileList = [{
      uid: file.uid,
      name: file.name,
      status: 'uploading',
      percent: 0
    }];

    // 2. Comprimir a WebP al 85% en el cliente y subir directo a Cloudflare R2
    this._storageService.compressToWebpBlob(rawFile, { maxWidth: 800, maxHeight: 800, quality: 0.85 })
      .then(({ blob }) => {
        const previewUrl = URL.createObjectURL(blob);
        const filename = `${file.name.replace(/\.[^/.]+$/, '')}.webp`;

        this._storageService.uploadFile(blob, filename, usr_uuid, {
          bucketType: 'public',
          folder: 'companies/logos',
          contentType: 'image/webp'
        }).subscribe({
          next: (uploadData) => {
            // Guardamos la key limpia en el formulario
            this.companyForm.patchValue({ cmp_logo: uploadData.key });
            this.logoFileList = [{
              uid: file.uid,
              name: filename,
              status: 'done',
              url: previewUrl
            }];
            this._messageService.success('Logo subido', 'La imagen fue procesada y almacenada correctamente.');
          },
          error: (err) => {
            console.error('Error al subir el logo a R2:', err);
            this.logoFileList = [{
              uid: file.uid,
              name: file.name,
              status: 'error'
            }];
            this._messageService.error('Error', 'No se pudo subir el logo a Cloudflare R2.');
          }
        });
      })
      .catch((err) => {
        console.error('Error al comprimir el logo a WebP:', err);
        this.logoFileList = [];
        this._messageService.error('Error', 'No se pudo procesar y convertir el logo a WebP.');
      });

    return false;
  };

  public onRemoveLogo = (): boolean => {
    this.companyForm.patchValue({ cmp_logo: '' });
    this.logoFileList = [];
    return true;
  };

  public beforeUploadBanner = (file: NzUploadFile): boolean => {
    const rawFile: File = (file.originFileObj as File) || (file as any);
    if (!rawFile) return false;

    const usr_uuid = this._sessionService.getIdentity()?.usr_uuid || 'admin';

    this.bannerFileList = [{
      uid: file.uid,
      name: file.name,
      status: 'uploading',
      percent: 0
    }];

    this._storageService.compressToWebpBlob(rawFile, { maxWidth: 1600, maxHeight: 800, quality: 0.85 })
      .then(({ blob }) => {
        const previewUrl = URL.createObjectURL(blob);
        const filename = `${file.name.replace(/\.[^/.]+$/, '')}.webp`;

        this._storageService.uploadFile(blob, filename, usr_uuid, {
          bucketType: 'public',
          folder: 'companies/banners',
          contentType: 'image/webp'
        }).subscribe({
          next: (uploadData) => {
            this.companyForm.patchValue({ cmp_banner: uploadData.key });
            this.bannerFileList = [{
              uid: file.uid,
              name: filename,
              status: 'done',
              url: previewUrl
            }];
            this._messageService.success('Banner subido', 'La imagen fue procesada y almacenada correctamente.');
          },
          error: (err) => {
            console.error('Error al subir el banner a R2:', err);
            this.bannerFileList = [{
              uid: file.uid,
              name: file.name,
              status: 'error'
            }];
            this._messageService.error('Error', 'No se pudo subir el banner a Cloudflare R2.');
          }
        });
      })
      .catch((err) => {
        console.error('Error al comprimir el banner a WebP:', err);
        this.bannerFileList = [];
        this._messageService.error('Error', 'No se pudo procesar y convertir el banner a WebP.');
      });

    return false;
  };

  public onRemoveBanner = (): boolean => {
    this.companyForm.patchValue({ cmp_banner: '' });
    this.bannerFileList = [];
    return true;
  };

  public onSave(): void {
    if (this.companyForm.valid) {
      const cmp_uuid = this.companyForm.get('cmp_uuid')?.value;
      const data = this.companyForm.value;

      this.isLoading = true;

      const request$ = this.isEditing
        ? this._companiesService.updateCompany(cmp_uuid, data)
        : this._companiesService.saveCompany(data);

      request$.subscribe({
        next: (res: any) => {
          if (!this.isEditing) {
            // Si es nueva, asignar rol al usuario actual
            const identity = this._sessionService.getIdentity();
            const roles = this._sessionService.getCompany()?.roles;
            const adminRol = roles?.find((r: any) => 
              r.rol_name.toLowerCase() === 'admin' || 
              r.rol_name.toLowerCase() === 'administrador'
            );

            if (identity && adminRol && res.data) {
              const userRolCompany = {
                cmp_uuid: res.data.cmp_uuid,
                usr_uuid: identity.usr_uuid,
                rol_uuid: adminRol.rol_uuid
              };

              this._userRolesCompanyService.saveUserRolCompany(userRolCompany).subscribe({
                next: () => {
                  this._messageService.success('¡Éxito!', 'Empresa creada y rol asignado correctamente.', () => {
                    this._sessionService.refreshCompanies$.next();
                    this.location.back();
                  });
                },
                error: () => {
                  this._messageService.warning('Advertencia', 'La empresa se creó, pero no se pudo asignar el rol automáticamente.');
                  this.location.back();
                }
              });
            } else {
              this._messageService.success('¡Éxito!', 'La empresa ha sido creada exitosamente.', () => {
                this._sessionService.refreshCompanies$.next();
                this.location.back();
              });
            }
          } else {
            this._messageService.success('¡Éxito!', 'Los datos de la empresa han sido actualizados.', () => {
              this.location.back();
            });
          }
          this.isLoading = false;
        },
        error: (err) => {
          const errorMsg = this.isEditing
            ? 'Hubo un problema al guardar los cambios.'
            : 'Hubo un problema al crear la empresa.';

          this._messageService.error('Error', errorMsg);
          this.isLoading = false;
          console.error(err);
        }
      });
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

  public toggleMapPicker(): void {
    this.showMapPicker = !this.showMapPicker;
  }

  public handleLocationSelected(location: SelectedLocation): void {
    this.companyForm.patchValue({
      cmp_address: location.address,
      cmp_lat: location.lat,
      cmp_lng: location.lng
    });
  }
}
