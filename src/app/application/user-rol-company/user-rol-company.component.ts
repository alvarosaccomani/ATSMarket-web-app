import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { UserRolesCompanyService } from '@services/user-roles-company.service';
import { RolesService } from '@services/roles.service';
import { UsersService } from '@services/users.service';
import { CompaniesService } from '@services/companies.service';
import { MessageService } from '@services/message.service';
import { UserRolCompanyInterface } from '@interfaces/user-rol-company';

@Component({
  selector: 'app-user-rol-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzSelectModule,
    NzCardModule,
    NzAvatarModule,
    NzGridModule
  ],
  templateUrl: './user-rol-company.component.html',
  styleUrl: './user-rol-company.component.scss'
})
export class UserRolCompanyComponent implements OnInit {

  public cmp_uuid: string = '';
  public company: any = null;
  public userRolesList: UserRolCompanyInterface[] = [];
  public roles: any[] = [];
  public users: any[] = [];
  public isLoading: boolean = false;
  
  public assignmentForm!: FormGroup;
  public isSaving: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _location: Location,
    private _fb: FormBuilder,
    private _userRolesCompanyService: UserRolesCompanyService,
    private _rolesService: RolesService,
    private _usersService: UsersService,
    private _companiesService: CompaniesService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    this._route.params.subscribe(params => {
      this.cmp_uuid = params['cmp_uuid'];
      if (this.cmp_uuid) {
        this.loadCompany();
        this.loadUserRoles();
        this.loadRoles();
        this.loadUsers();
      }
    });

    this.initForm();
  }

  private initForm(): void {
    this.assignmentForm = this._fb.group({
      usr_uuid: [null, [Validators.required]],
      rol_uuid: [null, [Validators.required]]
    });
  }

  private loadCompany(): void {
    this._companiesService.getCompanyById(this.cmp_uuid).subscribe({
      next: (res) => this.company = res.data,
      error: (err) => console.error('Error loading company', err)
    });
  }

  public loadUserRoles(): void {
    this.isLoading = true;
    this._userRolesCompanyService.getUserRolesCompany(this.cmp_uuid).subscribe({
      next: (res) => {
        this.userRolesList = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this._messageService.error('Error', 'No se pudieron cargar los roles de la empresa.');
      }
    });
  }

  private loadRoles(): void {
    this._rolesService.getRoles().subscribe({
      next: (res) => this.roles = res.data,
      error: (err) => console.error('Error loading roles', err)
    });
  }

  public loadUsers(filter: string = ''): void {
    this._usersService.getUsers(filter).subscribe({
      next: (res) => this.users = res.data,
      error: (err) => console.error('Error loading users', err)
    });
  }

  public onAddAssignment(): void {
    if (this.assignmentForm.valid) {
      this.isSaving = true;
      const data = {
        ...this.assignmentForm.value,
        cmp_uuid: this.cmp_uuid
      };

      this._userRolesCompanyService.saveUserRolCompany(data).subscribe({
        next: (res) => {
          this.isSaving = false;
          this._messageService.success('¡Éxito!', 'Usuario asignado correctamente.');
          this.assignmentForm.reset();
          this.loadUserRoles();
        },
        error: (err) => {
          this.isSaving = false;
          this._messageService.error('Error', 'No se pudo asignar el usuario.');
        }
      });
    } else {
      Object.values(this.assignmentForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public onDeleteAssignment(item: UserRolCompanyInterface): void {
    if (item.cmp_uuid && item.usr_uuid && item.rol_uuid) {
      this._messageService.confirm(
        '¿Estás seguro?',
        `Esta acción eliminará la asignación del usuario: ${item.usr?.usr_name} ${item.usr?.usr_surname}`,
        () => {
          this._userRolesCompanyService.deleteUserRolCompany(item.cmp_uuid!, item.usr_uuid!, item.rol_uuid!).subscribe({
            next: () => {
              this._messageService.success('¡Eliminado!', 'La asignación ha sido eliminada correctamente.');
              this.loadUserRoles();
            },
            error: (err) => {
              this._messageService.error('Error', 'No se pudo eliminar la asignación.');
              console.error(err);
            }
          });
        }
      );
    }
  }

  public onBack(): void {
    this._location.back();
  }
}
