import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';

import { MessageService } from '@services/message.service';
import { GlobalMaterialsService } from '@services/global-materials.service';

@Component({
  selector: 'app-global-material',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSpaceModule,
    NzIconModule,
    NzGridModule,
    NzBreadCrumbModule,
    NzUploadModule
  ],
  templateUrl: './global-material.component.html',
  styleUrl: './global-material.component.scss'
})
export class GlobalMaterialComponent implements OnInit {

  public globalMaterialForm!: FormGroup;
  public isEditing: boolean = false;
  public isLoading: boolean = false;
  public fileList: NzUploadFile[] = [];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private location: Location,
    private _messageService: MessageService,
    private _globalMaterialsService: GlobalMaterialsService
  ) { }

  ngOnInit(): void {
    this.globalMaterialForm = this.fb.group({
      gmat_uuid: [''],
      gmat_name: ['', [Validators.required, Validators.minLength(2)]],
      gmat_description: [''],
      gmat_image: ['']
    });

    this._route.params.subscribe(params => {
      const gmat_uuid = params['gmat_uuid'];
      if (gmat_uuid && gmat_uuid !== 'new') {
        this.isEditing = true;
        this.getGlobalMaterialById(gmat_uuid);
      }
    });
  }

  private getGlobalMaterialById(gmat_uuid: string): void {
    this.isLoading = true;
    this._globalMaterialsService.getGlobalMaterialById(gmat_uuid).subscribe({
      next: (res) => {
        if (res.data) {
          this.globalMaterialForm.patchValue(res.data);
          if (res.data.gmat_image) {
            this.fileList = [{
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: res.data.gmat_image
            }];
          }
        }
        this.isLoading = false;
      },
      error: (err) => {
        this._messageService.error('Error', 'No se pudo cargar la información del material global.');
        this.isLoading = false;
      }
    });
  }

  public beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = [file];
    return false;
  };

  public onSave(): void {
    if (this.globalMaterialForm.valid) {
      const data = this.globalMaterialForm.value;
      const gmat_uuid = data.gmat_uuid;

      this.isLoading = true;

      const request$ = this.isEditing
        ? this._globalMaterialsService.updateGlobalMaterial(gmat_uuid, data)
        : this._globalMaterialsService.saveGlobalMaterial(data);

      request$.subscribe({
        next: () => {
          const successMsg = this.isEditing
            ? 'El material global ha sido actualizado.'
            : 'El material global ha sido creado exitosamente.';

          this._messageService.success('¡Éxito!', successMsg, () => {
            this.location.back();
          });
          this.isLoading = false;
        },
        error: (err) => {
          this._messageService.error('Error', err.error?.error || 'Hubo un problema al guardar el material global.');
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.globalMaterialForm.controls).forEach(control => {
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
