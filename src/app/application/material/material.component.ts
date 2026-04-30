import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import { MessageService } from '@services/message.service';
import { MaterialsService } from '@services/materials.service';
import { GlobalMaterialsService } from '@services/global-materials.service';
import { SessionService } from '@services/session.service';
import { GlobalMaterialInterface } from '@interfaces/global-material';

@Component({
  selector: 'app-material',
  standalone: true,
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
    NzGridModule,
    NzBreadCrumbModule,
    RouterModule
  ],
  templateUrl: './material.component.html',
  styleUrl: './material.component.scss'
})
export class MaterialComponent implements OnInit {

  public materialForm!: FormGroup;
  public isEditing: boolean = false;
  public isLoading: boolean = false;
  public globalMaterials: GlobalMaterialInterface[] = [];
  private cmp_uuid!: string;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private location: Location,
    private _messageService: MessageService,
    private _materialsService: MaterialsService,
    private _globalMaterialsService: GlobalMaterialsService,
    private _sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.getGlobalMaterials();

    this.materialForm = this.fb.group({
      cmp_uuid: [this.cmp_uuid],
      mat_uuid: [''],
      gmat_uuid: [null, [Validators.required]],
      mat_name: ['', [Validators.required, Validators.minLength(2)]],
      mat_description: ['']
    });

    this._route.params.subscribe(params => {
      const mat_uuid = params['mat_uuid'];
      if (mat_uuid && mat_uuid !== 'new') {
        this.isEditing = true;
        this.getMaterialById(mat_uuid);
      }
    });
  }

  private getGlobalMaterials(): void {
    this._globalMaterialsService.getGlobalMaterials().subscribe({
      next: (res) => {
        this.globalMaterials = res.data;
      },
      error: (err) => {
        console.error('Error loading global materials:', err);
      }
    });
  }

  private getMaterialById(mat_uuid: string): void {
    this.isLoading = true;
    this._materialsService.getMaterialById(this.cmp_uuid, mat_uuid).subscribe({
      next: (res) => {
        if (res.data) {
          this.materialForm.patchValue(res.data);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this._messageService.error('Error', 'No se pudo cargar la información del material.');
        this.isLoading = false;
      }
    });
  }

  public onSave(): void {
    if (this.materialForm.valid) {
      const data = this.materialForm.value;
      const mat_uuid = data.mat_uuid;

      this.isLoading = true;

      const request$ = this.isEditing
        ? this._materialsService.updateMaterial(this.cmp_uuid, mat_uuid, data)
        : this._materialsService.saveMaterial(data);

      request$.subscribe({
        next: () => {
          const successMsg = this.isEditing
            ? 'El material ha sido actualizado.'
            : 'El material ha sido creado exitosamente.';

          this._messageService.success('¡Éxito!', successMsg, () => {
            this.location.back();
          });
          this.isLoading = false;
        },
        error: (err) => {
          this._messageService.error('Error', err.error.error);
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.materialForm.controls).forEach(control => {
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
