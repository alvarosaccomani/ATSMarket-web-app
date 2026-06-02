import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzSpinModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule
  ],
  templateUrl: './barcode-scanner.component.html',
  styleUrl: './barcode-scanner.component.scss'
})
export class BarcodeScannerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() scannerHint: string = 'Encuadre el código de barras del producto';
  @Output() onScan = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('manualInput') manualInputEl!: ElementRef<HTMLInputElement>;

  public isLoading = true;
  public cameraError: string | null = null;
  public manualCode = '';
  public isScanning = false;
  public isDetectorSupported = false;

  private mediaStream: MediaStream | null = null;
  private barcodeDetector: any = null;

  constructor() { }

  ngOnInit() {
    this.isDetectorSupported = 'BarcodeDetector' in window;
    if (this.isDetectorSupported) {
      try {
        this.barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['code_128', 'ean_13', 'code_39', 'qr_code', 'upc_a']
        });
      } catch (e) {
        console.error('Error al inicializar BarcodeDetector:', e);
        this.isDetectorSupported = false;
      }
    }
  }

  ngAfterViewInit() {
    this.startCamera();
    this.focusInput();
  }

  public focusInput(): void {
    setTimeout(() => {
      this.manualInputEl?.nativeElement?.focus();
    }, 400);
  }

  public async startCamera() {
    try {
      this.isLoading = true;
      this.cameraError = null;
      if (this.mediaStream) this.stopCamera();

      // Solicitar video de cámara trasera con enfoque ideal
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      this.mediaStream = stream;

      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = stream;
        await this.videoElement.nativeElement.play();
        this.isLoading = false;
        
        if (this.isDetectorSupported && this.barcodeDetector) {
          this.startScanningLoop();
        }
      }
    } catch (error) {
      console.error('Error al iniciar la cámara:', error);
      this.isLoading = false;
      this.cameraError = 'No se pudo acceder a la cámara trasera. Podés usar la entrada manual abajo.';
    }
  }

  private startScanningLoop(): void {
    if (!this.barcodeDetector) return;
    const video = this.videoElement?.nativeElement;
    if (!video) return;

    this.isScanning = true;

    const scanFrame = async () => {
      if (!this.isScanning || !this.mediaStream) return;
      try {
        const barcodes = await this.barcodeDetector.detect(video);
        if (barcodes && barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          this.handleScannedCode(code);
          return; // Detener loop tras el primer escaneo exitoso
        }
      } catch (err) {
        // Ignorar fallos de frames individuales
      }

      if (this.isScanning) {
        setTimeout(() => {
          requestAnimationFrame(scanFrame);
        }, 200); // 5 escaneos por segundo para optimizar CPU y batería
      }
    };

    requestAnimationFrame(scanFrame);
  }

  private handleScannedCode(code: string): void {
    if (!code || !code.trim()) return;
    this.playBeep();
    this.onScan.emit(code.trim());
  }

  public onManualSubmit(): void {
    if (this.manualCode && this.manualCode.trim()) {
      const code = this.manualCode.trim();
      this.manualCode = '';
      this.handleScannedCode(code);
      this.focusInput();
    }
  }

  private playBeep(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // Tono de beep limpio y premium
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // Volumen óptimo

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12); // Duración de 120ms
    } catch (e) {
      console.warn('AudioContext bloqueado o no disponible:', e);
    }
  }

  public stopCamera(): void {
    this.isScanning = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
