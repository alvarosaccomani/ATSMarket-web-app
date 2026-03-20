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

import { MessageService } from '@services/message.service';

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
    NzGridModule
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanyComponent implements OnInit {

  public companyForm!: FormGroup;
  public logoFileList: NzUploadFile[] = [];
  public bannerFileList: NzUploadFile[] = [];
  public isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private location: Location,
    private _messageService: MessageService
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
      cmp_status: ['active', Validators.required]
    });

    this._route.params.subscribe(params => {
      const cmp_uuid = params['cmp_uuid'];
      if (cmp_uuid && cmp_uuid !== 'new') {
        this.isEditing = true;
        // Mock load temporal de la data real
        this.companyForm.patchValue({
          cmp_uuid: cmp_uuid,
          cmp_name: 'Empresa',
          cmp_slug: 'empresa',
          cmp_status: 'active'
        });
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
      console.log('Guardando empresa:', this.companyForm.value);
      this._messageService.success('¡Éxito!', 'Los datos de la empresa han sido guardados.', () => {
        this.location.back();
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
}
