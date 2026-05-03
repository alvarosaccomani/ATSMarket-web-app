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
import { NzSelectModule } from 'ng-zorro-antd/select';

import { MessageService } from '@services/message.service';
import { GlobalCategoriesService } from '@services/global-categories.service';
import { GlobalItemsService } from '@services/global-items.service';
import { GlobalItemInterface } from '@interfaces/global-item';

@Component({
  selector: 'app-global-category',
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
    NzSelectModule
  ],
  templateUrl: './global-category.component.html',
  styleUrl: './global-category.component.scss'
})
export class GlobalCategoryComponent implements OnInit {

  public globalCategoryForm!: FormGroup;
  public isEditing: boolean = false;
  public isLoading: boolean = false;
  public globalItems: GlobalItemInterface[] = [];
  
  private gitm_uuid_route: string = '';
  private gcat_uuid_route: string = '';

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private location: Location,
    private _messageService: MessageService,
    private _globalCategoriesService: GlobalCategoriesService,
    private _globalItemsService: GlobalItemsService
  ) { }

  ngOnInit(): void {
    this.globalCategoryForm = this.fb.group({
      gitm_uuid: ['', [Validators.required]],
      gcat_uuid: [''],
      gcat_name: ['', [Validators.required, Validators.minLength(2)]],
      gcat_description: [''],
      gcat_image: ['']
    });

    this.getGlobalItems();

    this._route.params.subscribe(params => {
      this.gitm_uuid_route = params['gitm_uuid'];
      this.gcat_uuid_route = params['gcat_uuid'];

      if (this.gitm_uuid_route && this.gitm_uuid_route !== 'new' && this.gitm_uuid_route !== 'all') {
        this.globalCategoryForm.patchValue({ gitm_uuid: this.gitm_uuid_route });
      }

      if (this.gcat_uuid_route && this.gcat_uuid_route !== 'new') {
        this.isEditing = true;
        this.getGlobalCategoryById(this.gitm_uuid_route, this.gcat_uuid_route);
      }
    });
  }

  private getGlobalItems(): void {
    this._globalItemsService.getGlobalItems().subscribe({
      next: (res) => {
        this.globalItems = res.data;
      }
    });
  }

  private getGlobalCategoryById(gitm_uuid: string, gcat_uuid: string): void {
    this.isLoading = true;
    this._globalCategoriesService.getGlobalCategoryById(gitm_uuid, gcat_uuid).subscribe({
      next: (res) => {
        if (res.data) {
          this.globalCategoryForm.patchValue(res.data);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this._messageService.error('Error', 'No se pudo cargar la información de la categoría global.');
        this.isLoading = false;
      }
    });
  }

  public onSave(): void {
    if (this.globalCategoryForm.valid) {
      const data = this.globalCategoryForm.value;
      const gitm_uuid = data.gitm_uuid;
      const gcat_uuid = data.gcat_uuid;

      this.isLoading = true;

      const request$ = this.isEditing
        ? this._globalCategoriesService.updateGlobalCategory(gitm_uuid, gcat_uuid, data)
        : this._globalCategoriesService.saveGlobalCategory(data);

      request$.subscribe({
        next: () => {
          const successMsg = this.isEditing
            ? 'La categoría global ha sido actualizada.'
            : 'La categoría global ha sido creada exitosamente.';

          this._messageService.success('¡Éxito!', successMsg, () => {
            this.location.back();
          });
          this.isLoading = false;
        },
        error: (err) => {
          this._messageService.error('Error', err.error?.error || 'Hubo un problema al guardar la categoría global.');
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.globalCategoryForm.controls).forEach(control => {
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
