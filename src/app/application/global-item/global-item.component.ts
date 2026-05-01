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

import { MessageService } from '@services/message.service';
import { GlobalItemsService } from '@services/global-items.service';

@Component({
  selector: 'app-global-item',
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
    NzBreadCrumbModule
  ],
  templateUrl: './global-item.component.html',
  styleUrl: './global-item.component.scss'
})
export class GlobalItemComponent implements OnInit {

  public globalItemForm!: FormGroup;
  public isEditing: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private location: Location,
    private _messageService: MessageService,
    private _globalItemsService: GlobalItemsService
  ) { }

  ngOnInit(): void {
    this.globalItemForm = this.fb.group({
      gitm_uuid: [''],
      gitm_name: ['', [Validators.required, Validators.minLength(2)]],
      gitm_description: [''],
      gitm_image: ['']
    });

    this._route.params.subscribe(params => {
      const gitm_uuid = params['gitm_uuid'];
      if (gitm_uuid && gitm_uuid !== 'new') {
        this.isEditing = true;
        this.getGlobalItemById(gitm_uuid);
      }
    });
  }

  private getGlobalItemById(gitm_uuid: string): void {
    this.isLoading = true;
    this._globalItemsService.getGlobalItemById(gitm_uuid).subscribe({
      next: (res) => {
        if (res.data) {
          this.globalItemForm.patchValue(res.data);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this._messageService.error('Error', 'No se pudo cargar la información del rubro global.');
        this.isLoading = false;
      }
    });
  }

  public onSave(): void {
    if (this.globalItemForm.valid) {
      const data = this.globalItemForm.value;
      const gitm_uuid = data.gitm_uuid;

      this.isLoading = true;

      const request$ = this.isEditing
        ? this._globalItemsService.updateGlobalItem(gitm_uuid, data)
        : this._globalItemsService.saveGlobalItem(data);

      request$.subscribe({
        next: () => {
          const successMsg = this.isEditing
            ? 'El rubro global ha sido actualizado.'
            : 'El rubro global ha sido creado exitosamente.';

          this._messageService.success('¡Éxito!', successMsg, () => {
            this.location.back();
          });
          this.isLoading = false;
        },
        error: (err) => {
          this._messageService.error('Error', err.error?.error || 'Hubo un problema al guardar el rubro global.');
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.globalItemForm.controls).forEach(control => {
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
