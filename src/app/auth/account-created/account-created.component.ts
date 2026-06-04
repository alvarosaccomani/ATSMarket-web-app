import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';

@Component({
  selector: 'app-account-created',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzAlertModule
  ],
  templateUrl: './account-created.component.html',
  styleUrl: './account-created.component.scss'
})
export class AccountCreatedComponent implements OnInit {
  usr_email: string = '';

  constructor(private _route: ActivatedRoute) { }

  ngOnInit(): void {
    this.usr_email = this._route.snapshot.params['usr_email'] || '';
  }
}
