import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, map, combineLatest, BehaviorSubject, switchMap, of, Subject, takeUntil } from 'rxjs';

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

// Interfaces and Services
import { CategoryInterface } from '@interfaces/category';
import { ItemInterface } from '@interfaces/item';
import { GlobalCategoryInterface } from '@interfaces/global-category';
import { SessionService } from '@services/session.service';
import { CategoriesService } from '@services/categories.service';
import { ItemsService } from '@services/items.service';
import { GlobalCategoriesService } from '@services/global-categories.service';
import { MessageService } from '@services/message.service';

@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit, OnDestroy {

  public cmp_uuid!: string;
  public categoryForm!: FormGroup;
  
  // Lists
  public itemsList: ItemInterface[] = [];
  public globalCategories: GlobalCategoryInterface[] = [];
  
  // Selection
  public selectedItmUuid: string | null = null;

  // Reactive streams
  private selectedItmUuid$ = new BehaviorSubject<string>('');
  private searchTerm$ = new BehaviorSubject<string>('');
  private refreshData$ = new BehaviorSubject<void>(undefined);
  public filteredCategories$!: Observable<CategoryInterface[]>;

  // Drawer Control
  public selectedCategory: CategoryInterface | null = null;
  public isDrawerVisible = false;
  public isEditing = false;
  public isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _sessionService: SessionService,
    private _categoriesService: CategoriesService,
    private _itemsService: ItemsService,
    private _globalCategoriesService: GlobalCategoriesService,
    private _messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cmp_uuid = this._sessionService.getCompany().cmp_uuid;

    // Form Initialization
    this.categoryForm = this.fb.group({
      cmp_uuid: [this.cmp_uuid],
      itm_uuid: ['', [Validators.required]],
      cat_uuid: [''],
      gitm_uuid: [null, [Validators.required]],
      gcat_uuid: [null, [Validators.required]],
      cat_name: ['', [Validators.required, Validators.minLength(2)]],
      cat_description: ['']
    });

    // Listen to global category selection changes to auto-map gitm_uuid
    this.categoryForm.get('gcat_uuid')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(gcatUuid => {
        if (gcatUuid) {
          const found = this.globalCategories.find(gc => gc.gcat_uuid === gcatUuid);
          if (found) {
            this.categoryForm.patchValue({ gitm_uuid: found.gitm_uuid }, { emitEvent: false });
          }
        }
      });

    // Pre-load items and global categories
    this.loadInitialData();

    // Reactive categories list stream
    this.filteredCategories$ = combineLatest([
      this.selectedItmUuid$.asObservable(),
      this.refreshData$.asObservable(),
      this.searchTerm$.asObservable()
    ]).pipe(
      switchMap(([itmUuid, _, term]) => {
        if (!itmUuid) return of({ data: [] as CategoryInterface[], term });
        this.isLoading = true;
        return this._categoriesService.getCategories(this.cmp_uuid, itmUuid).pipe(
          map(res => ({ data: res.data || [], term }))
        );
      }),
      map(({ data, term }) => {
        this.isLoading = false;
        if (!term.trim()) return data;
        
        const lowTerm = term.toLowerCase();
        return data.filter(cat => 
          cat.cat_name.toLowerCase().includes(lowTerm) || 
          (cat.cat_description && cat.cat_description.toLowerCase().includes(lowTerm))
        );
      })
    );
  }

  private loadInitialData(): void {
    // Load local items (rubros)
    this._itemsService.getItems(this.cmp_uuid).subscribe({
      next: (res) => {
        this.itemsList = res.data || [];
        if (this.itemsList.length > 0) {
          // Select the first item by default
          this.selectedItmUuid = this.itemsList[0].itm_uuid;
          this.selectedItmUuid$.next(this.selectedItmUuid);
        }
      },
      error: (err) => {
        console.error('Error loading items:', err);
      }
    });

    // Load global categories for mapping
    this._globalCategoriesService.getGlobalCategories().subscribe({
      next: (res) => {
        this.globalCategories = res.data || [];
      },
      error: (err) => {
        console.error('Error loading global categories:', err);
      }
    });
  }

  public onItemChange(itmUuid: string): void {
    this.selectedItmUuid$.next(itmUuid);
    this.refreshData$.next();
  }

  public onSearch(term: string): void {
    this.searchTerm$.next(term);
  }

  public openCreateDrawer(): void {
    if (!this.selectedItmUuid) {
      this._messageService.error('Error', 'Debes seleccionar un rubro antes de crear una categoría.');
      return;
    }
    
    this.selectedCategory = null;
    this.isEditing = true;
    this.categoryForm.reset({
      cmp_uuid: this.cmp_uuid,
      itm_uuid: this.selectedItmUuid,
      cat_uuid: '',
      gitm_uuid: null,
      gcat_uuid: null,
      cat_name: '',
      cat_description: ''
    });
    this.isDrawerVisible = true;
  }

  public openCategoryDetail(category: CategoryInterface): void {
    this.selectedCategory = category;
    this.isEditing = false;
    this.categoryForm.patchValue(category);
    this.isDrawerVisible = true;
  }

  public enableEditing(): void {
    this.isEditing = true;
  }

  public closeDrawer(): void {
    this.isDrawerVisible = false;
    setTimeout(() => {
      this.selectedCategory = null;
      this.isEditing = false;
    }, 300);
  }

  public onSave(): void {
    if (this.categoryForm.valid) {
      const data = this.categoryForm.value;
      const cat_uuid = data.cat_uuid;

      this.isLoading = true;

      const request$ = cat_uuid
        ? this._categoriesService.updateCategory(this.cmp_uuid, this.selectedItmUuid!, cat_uuid, data)
        : this._categoriesService.saveCategory(data);

      request$.subscribe({
        next: () => {
          const successMsg = cat_uuid
            ? 'La categoría ha sido actualizada correctamente.'
            : 'La categoría ha sido creada exitosamente.';

          this._messageService.success('¡Éxito!', successMsg);
          this.isLoading = false;
          this.closeDrawer();
          this.refreshData$.next(); // Reload table
        },
        error: (err) => {
          console.error(err);
          this._messageService.error('Error', err.error?.error || 'Hubo un problema al guardar la categoría.');
          this.isLoading = false;
        }
      });
    } else {
      Object.values(this.categoryForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  public onDeleteCategory(category: CategoryInterface): void {
    this._messageService.confirm(
      '¿Estás seguro?',
      `Esta acción eliminará permanentemente la categoría: ${category.cat_name}`,
      () => {
        this.isLoading = true;
        this._categoriesService.deleteCategory(this.cmp_uuid, category.itm_uuid, category.cat_uuid).subscribe({
          next: () => {
            this._messageService.success('¡Eliminado!', 'La categoría ha sido eliminada correctamente.');
            this.isLoading = false;
            this.closeDrawer();
            this.refreshData$.next(); // Reload table
          },
          error: (err) => {
            console.error(err);
            this._messageService.error('Error', err.error?.error || 'No se pudo eliminar la categoría.');
            this.isLoading = false;
          }
        });
      }
    );
  }

  public getGlobalCategoryName(gcat_uuid: string): string {
    if (!gcat_uuid) return 'Sin Grupo';
    const found = this.globalCategories.find(gc => gc.gcat_uuid === gcat_uuid);
    return found ? found.gcat_name : 'Sin Grupo';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
