import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  AfterViewInit, 
  OnDestroy, 
  NgZone, 
  ChangeDetectorRef,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MercadopagoService } from '../../../core/services/mercadopago.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-mp-payment-brick',
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule
  ],
  templateUrl: './mp-payment-brick.component.html',
  styleUrl: './mp-payment-brick.component.scss'
})
export class MpPaymentBrickComponent implements AfterViewInit, OnDestroy {

  @Input() publicKey: string = '';
  @Input() amount: number = 0;
  @Input() payerEmail: string = '';
  @Input() preferenceId?: string;

  @Output() paymentSubmit = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();
  @Output() paymentReady = new EventEmitter<void>();

  @ViewChild('brickContainer', { static: false }) brickContainer!: ElementRef<HTMLDivElement>;

  public isLoading = true;
  public errorMessage = '';
  private brickController: any = null;

  constructor(
    private mpService: MercadopagoService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (this.publicKey && this.amount > 0) {
      this.initBrick();
    } else {
      this.isLoading = false;
      this.errorMessage = 'Faltan parámetros configurables (Clave pública o monto total).';
      this.cdr.detectChanges();
    }
  }

  private async initBrick(): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();

      const mp = await this.mpService.getInstance(this.publicKey);
      const bricksBuilder = mp.bricks();

      const renderOptions: any = {
        initialization: {
          amount: Math.round(this.amount),
          payer: {
            email: this.payerEmail || 'cliente@atsmarket.com'
          }
        },
        customization: {
          visual: {
            style: {
              theme: 'default' // 'default' | 'dark' | 'bootstrap' | 'flat'
            }
          },
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            ticket: 'all',
            bankTransfer: 'all',
            mercadoPago: 'all',
            maxInstallments: 12
          }
        },
        callbacks: {
          onReady: () => {
            this.ngZone.run(() => {
              this.isLoading = false;
              this.paymentReady.emit();
              this.cdr.detectChanges();
              console.log('✅ [Payment Brick] Componente renderizado y listo.');
            });
          },
          onSubmit: ({ selectedPaymentMethod, formData }: any) => {
            return new Promise<void>((resolve, reject) => {
              this.ngZone.run(() => {
                console.log('💳 [Payment Brick] Submit disparado:', { selectedPaymentMethod, formData });
                this.paymentSubmit.emit({ selectedPaymentMethod, formData });
                resolve();
              });
            });
          },
          onError: (error: any) => {
            this.ngZone.run(() => {
              console.error('❌ [Payment Brick] Error en el Brick:', error);
              this.isLoading = false;
              this.errorMessage = 'Ocurrió un error al cargar el formulario de pago.';
              this.paymentError.emit(error);
              this.cdr.detectChanges();
            });
          }
        }
      };

      if (this.preferenceId) {
        renderOptions.initialization.preferenceId = this.preferenceId;
      }

      // Desmontar instancia previa si existiera
      if (this.brickController) {
        await this.brickController.unmount();
      }

      // Renderizar el Payment Brick en el DOM
      this.brickController = await bricksBuilder.create('payment', 'paymentBrick_container', renderOptions);

    } catch (error: any) {
      this.ngZone.run(() => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'No se pudo inicializar Mercado Pago Bricks.';
        console.error('❌ [Payment Brick] Error en inicialización:', error);
        this.cdr.detectChanges();
      });
    }
  }

  async ngOnDestroy(): Promise<void> {
    if (this.brickController) {
      try {
        await this.brickController.unmount();
        console.log('🧹 [Payment Brick] Instancia desmonada del DOM limpiamente.');
      } catch (err) {
        console.warn('⚠️ [Payment Brick] Advertencia al desmontar el Brick:', err);
      }
      this.brickController = null;
    }
  }
}
