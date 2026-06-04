import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, map, combineLatest, BehaviorSubject, switchMap } from 'rxjs';

// NG-ZORRO
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { ItemInterface } from '@interfaces/item';
import { GlobalItemInterface } from '@interfaces/global-item';
import { SessionService } from '@services/session.service';
import { ItemsService } from '@services/items.service';
import { GlobalItemsService } from '@services/global-items.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NzTableModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzDividerModule,
    NzDescriptionsModule,
    NzTagModule,
    NzInputModule,
    NzAvatarModule,
    NzFormModule,
    NzSpinModule,
    NzSelectModule
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent implements OnInit {

  public cmp_uuid!: string;
  public itemForm!: FormGroup;
  
  // Reactive streams
  private searchTerm$ = new BehaviorSubject<string>('');
  private refreshData$ = new BehaviorSubject<void>(undefined);
  public filteredItems$!: Observable<ItemInterface[]>;

  // Drawer Control
  public selectedItem: ItemInterface | null = null;
  public isDrawerVisible = false;
  public isEditing = false;
  public isLoading = false;
  public globalItems: GlobalItemInterface[] = [];

  constructor(
    private fb: FormBuilder,
    private _sessionService: SessionService,
    private _itemsService: ItemsService,
    private _globalItemsService: GlobalItemsService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;
    this.getGlobalItems();

    // Form Initialization
    this.itemForm = this.fb.group({
      cmp_uuid: [this.cmp_uuid],
      itm_uuid: [''],
      gitm_uuid: [null, [Validators.required]],
      itm_name: ['', [Validators.required, Validators.minLength(2)]],
      itm_description: ['']
    });

    // Reactive table search and list reload
    this.filteredItems$ = combineLatest([
      this.refreshData$.pipe(
        switchMap(() => this._itemsService.getItems(this.cmp_uuid))
      ),
      this.searchTerm$.asObservable()
    ]).pipe(
      map(([results, term]) => {
        const items = results.data || [];
        if (!term.trim()) return items;
        
        const lowTerm = term.toLowerCase();
        return items.filter(itm => 
          itm.itm_name.toLowerCase().includes(lowTerm) || 
          (itm.itm_description && itm.itm_description.toLowerCase().includes(lowTerm))
        );
      })
    );
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openCreateDrawer(): void {
    this.selectedItem = null;
    this.isEditing = true;
    this.itemForm.reset({
      cmp_uuid: this.cmp_uuid,
      itm_uuid: '',
      gitm_uuid: null,
      itm_name: '',
      itm_description: ''
    });
    this.isDrawerVisible = true;
  }

  public openItemDetail(item: ItemInterface): void {
    this.selectedItem = item;
    this.isEditing = false;
    this.itemForm.patchValue(item);
    this.isDrawerVisible = true;
  }

  public enableEditing(): void {
    this.isEditing = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => {
      this.selectedItem = null;
      this.isEditing = false;
    }, 300);
  }

  public onSave(): void {
    if (this.itemForm.valid) {
      const data = this.itemForm.value;
      const itm_uuid = data.itm_uuid;

      this.isLoading = true;

      const request$ = itm_uuid
        ? this._itemsService.updateItem(this.cmp_uuid, itm_uuid, data)
        : this._itemsService.saveItem(data);

      request$.subscribe({
        next: () => {
          const successMsg = itm_uuid
            ? 'El rubro ha sido actualizado correctamente.'
            : 'El rubro ha sido creado exitosamente.';

          this._messageService.success('¡Éxito!', successMsg);
          this.isLoading = false;
          this.closeDrawer();
          this.refreshData$.next(); // Reload table
        },
        error: (err) => {
          console.error(err);
          this._messageService.error('Error', err.error?.error || 'Hubo un problema al guardar el rubro.');
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.itemForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public onDeleteItem(item: ItemInterface): void {
    this._messageService.confirm(
      '¿Estás seguro?',
      `Esta acción eliminará permanentemente el rubro: ${item.itm_name}`,
      () => {
        this.isLoading = true;
        this._itemsService.deleteItem(this.cmp_uuid, item.itm_uuid).subscribe({
          next: () => {
            this._messageService.success('¡Eliminado!', 'El rubro ha sido eliminado correctamente.');
            this.isLoading = false;
            this.closeDrawer();
            this.refreshData$.next(); // Reload table
          },
          error: (err) => {
            console.error(err);
            this._messageService.error('Error', err.error?.error || 'No se pudo eliminar el rubro.');
            this.isLoading = false;
          }
        });
      }
    );
  }

  private getGlobalItems(): void {
    this._globalItemsService.getGlobalItems().subscribe({
      next: (res) => {
        this.globalItems = res.data || [];
      },
      error: (err) => {
        console.error('Error loading global items:', err);
      }
    });
  }

  public getGlobalItemName(gitm_uuid: string): string {
    if (!gitm_uuid) return 'Sin Grupo';
    const found = this.globalItems.find(item => item.gitm_uuid === gitm_uuid);
    return found ? found.gitm_name : 'Sin Grupo';
  }
}
