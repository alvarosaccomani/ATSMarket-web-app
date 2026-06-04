import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Imports de Ng-Zorro (necesarios para standalone)
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { SessionService } from '@services/session.service';
import { UsersService } from '@services/users.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzMessageModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  validateForm!: FormGroup;
  isSubmitting = false;
  public identity: any = null;
  public token: any = null;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _sessionService: SessionService,
    private _usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      usr_user: [null, [Validators.required]],
      usr_password: [null, [Validators.required]]
    });
  }

  public submitForm(): void {
    if (this.validateForm.valid) {
      this.isSubmitting = true;

      this._usersService.login(this.validateForm.value).subscribe(
        response => {
          this.identity = response.data;
          if (!this.identity || !this.identity.usr_uuid) {
            this.message.error('error');
          } else {
            //persist user data
            this._sessionService.setIdentity(JSON.stringify(this.identity));
            //get token
            this.getToken();
          }
          this.isSubmitting = false;
        },
        error => {
          this.isSubmitting = false;
          let errorMessage = <any>error;
          console.log(errorMessage);
          if (errorMessage != null) {
            this.message.error(errorMessage.error.error);
          }
        }
      )
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private getToken(): void {
    this._usersService.login(this.validateForm.value, 'true').subscribe(
      response => {
        this.token = response.data.token;
        if (this.token.length <= 0) {
          this.message.error('error');
        } else {
          //persist user token
          this._sessionService.setToken(this.token);
          // Redirigir dinámicamente si existe un returnUrl query parameter
          const returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/application/my-companies';
          this._router.navigateByUrl(returnUrl);
        }
      },
      error => {
        let errorMessage = <any>error;
        console.log(errorMessage);
        if (errorMessage != null) {
          this.message.error(errorMessage.error.error);
        }
      }
    )
  }
}
