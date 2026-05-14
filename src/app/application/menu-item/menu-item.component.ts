import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// NG-ZORRO
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

import { AppMenusService } from '@services/app-menus.service';
import { MessageService } from '@services/message.service';
import { MenuInterface } from '@interfaces/menu';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzSelectModule,
    NzCardModule,
    NzInputModule,
    NzSwitchModule,
    NzGridModule,
    NzInputNumberModule
  ],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent implements OnInit {

  public mnu_uuid: string = '';
  public menu: MenuInterface | null = null;
  public parentMenus: MenuInterface[] = [];
  public menuForm!: FormGroup;
  public isSaving: boolean = false;
  public isNew: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _fb: FormBuilder,
    private _appMmenusService: AppMenusService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.mnu_uuid = params['mnu_uuid'];
      this.isNew = this.mnu_uuid === 'new';
      
      this.initForm();
      this.loadParentMenus();

      if (!this.isNew) {
        this.loadMenu();
      }
    });
  }

  private initForm(): void {
    this.menuForm = this._fb.group({
      mnu_title: [null, [Validators.required]],
      mnu_description: [null],
      mnu_icon: [null],
      mnu_route: [null],
      mnu_order: [0, [Validators.required]],
      mnu_parent_uuid: [null],
      mnu_showifcompanyactive: [false],
      mnu_itemactive: [true],
      mnu_active: [true]
    });
  }

  private loadMenu(): void {
    this._appMmenusService.getMenuById(this.mnu_uuid).subscribe({
      next: (res) => {
        this.menu = res.data;
        this.menuForm.patchValue(res.data);
      },
      error: (err) => {
        this._messageService.error('Error', 'No se pudo cargar el ítem de menú.');
        console.error(err);
      }
    });
  }

  private loadParentMenus(): void {
    this._appMmenusService.getMenus().subscribe({
      next: (res) => {
        // Filtramos para no ponerse a sí mismo como padre si estamos editando
        this.parentMenus = res.data.filter(m => m.mnu_uuid !== this.mnu_uuid);
      },
      error: (err) => console.error('Error loading parent menus', err)
    });
  }

  public onSave(): void {
    if (this.menuForm.valid) {
      this.isSaving = true;
      const data = this.menuForm.value;

      if (this.isNew) {
        this._appMmenusService.saveMenu(data).subscribe({
          next: (res) => {
            this.isSaving = false;
            this._messageService.success('¡Éxito!', 'Ítem de menú creado correctamente.');
            this._router.navigate(['/application/menu-items']);
          },
          error: (err) => {
            this.isSaving = false;
            this._messageService.error('Error', 'No se pudo crear el ítem de menú.');
          }
        });
      } else {
        this._appMmenusService.updateMenu(this.mnu_uuid, data).subscribe({
          next: (res) => {
            this.isSaving = false;
            this._messageService.success('¡Éxito!', 'Ítem de menú actualizado correctamente.');
            this._router.navigate(['/application/menu-items']);
          },
          error: (err) => {
            this.isSaving = false;
            this._messageService.error('Error', 'No se pudo actualizar el ítem de menú.');
          }
        });
      }
    } else {
      Object.values(this.menuForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public onBack(): void {
    this._location.back();
  }
}
