import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

// NG-ZORRO
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { UserRolCompanyResults } from '@interfaces/user-rol-company';

import { SessionService } from '@services/session.service';
import { UserRolesCompanyService } from '@services/user-roles-company.service';

@Component({
  selector: 'app-my-companies',
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzAvatarModule,
    NzEmptyModule,
    NzToolTipModule
  ],
  templateUrl: './my-companies.component.html',
  styleUrl: './my-companies.component.scss'
})
export class MyCompaniesComponent implements OnInit {

  public selectedCompany!: any;
  public userRolesCompany$!: Observable<UserRolCompanyResults>;
  public userRolesCompany!: any;

  constructor(
    private _sessionService: SessionService,
    private _userRolesCompanyService: UserRolesCompanyService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    const identity = this._sessionService.getIdentity();

    if (identity) {
      this.userRolesCompany$ = this._userRolesCompanyService.getUserRolesCompanyByUser(identity.usr_uuid!);
      this.userRolesCompany$.subscribe((userRolesCompany: any) => {
        this.userRolesCompany = this.groupByCompany(userRolesCompany.data);
        console.log(this.userRolesCompany);
        if (this.userRolesCompany.length === 1) {
          let company = this.userRolesCompany[0];
          this.selectCompany(company);
        }
        // //Obtengo Company Items
        // this.companyItems$ = this._companyItemsService.getCompanyItems(userRolesCompany.data[0].cmp.cmp_uuid!);
        // this.companyItems$.subscribe((companyItems: any) => {
        //   this._sessionService.setCompanyItems(companyItems.data);
        // });

        // if (!this.selectedCompany) {
        //   this._router.navigate(['/admin/user/no-company']);
        // } else {
        //   // Inicializar el menú con los datos del usuario
        //   this._menuService.initialize(
        //     this.userRolesCompany[0].roles.map((item: any) => item.rol_name),
        //     this.selectedCompany
        //   );
        //   if (this._route.getCurrentRoute() === '/admin/user/dashboard' || this._route.getCurrentRoute() === '/admin/user/no-company') {
        //     this._router.navigate(['/admin/user/dashboard']);
        //   }
        // }
      });
    }
  }

  public groupByCompany(data: any[]): any[] {
    const grouped = new Map();

    data.forEach((item) => {
      const cmpUuid = item.cmp.cmp_uuid;

      if (!grouped.has(cmpUuid)) {
        grouped.set(cmpUuid, {
          cmp_uuid: item.cmp.cmp_uuid,
          cmp_name: item.cmp.cmp_name,
          roles: [],
        });
      }

      grouped.get(cmpUuid).roles.push({
        rol_uuid: item.rol.rol_uuid,
        rol_name: item.rol.rol_name,
        rolpers: item.rolpers.map((e: any) => e.per.per_slug)
      });
    });

    return Array.from(grouped.values());
  }

  public selectCompany(company: any): void {
    this.selectedCompany = company.cmp_uuid;
    this._sessionService.setCompany(JSON.stringify(company));

    this._router.navigate(['/application/products']);
  }

  public isAdmin(roles: any[]): boolean {
    if (!roles) return false;
    return roles.some((r: any) => r.rol_name === 'admin' || r.rol_name === 'administrador' || r.rol_name === 'owner');
  }

  public createNewCompany(): void {
    this._router.navigate(['/application/company/new']);
  }

  public editCompany(cmp_uuid: string): void {
    this._router.navigate(['/application/company', cmp_uuid]);
  }
}
