import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-camera',
  standalone: true,
  imports: [
    CommonModule,
    NzSpinModule,
    NzIconModule
  ],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() existingImage: string | null = null;
  @Output() onPhotoSaved = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  public isCameraActive = true;
  public isLoading = true;
  public capturedImage: string | null = null; // Almacena la captura para previsualización rápida
  public cameraError: string | null = null; // Almacena el mensaje si se niegan los permisos

  private mediaStream: MediaStream | null = null;

  constructor() { }

  ngAfterViewInit() {
    if (this.existingImage) {
      this.capturedImage = this.existingImage;
      this.isCameraActive = false;
      this.isLoading = false;
    } else {
      this.startCamera();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingImage'] && !changes['existingImage'].firstChange) {
      const newImage = changes['existingImage'].currentValue;
      if (newImage) {
        this.capturedImage = newImage;
        this.isCameraActive = false;
      }
    }
  }

  public async startCamera() {
    try {
      this.isLoading = true;
      this.cameraError = null;
      if (this.mediaStream) this.stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 4096 },
          height: { ideal: 2160 }
        }
      });
      this.mediaStream = stream;

      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = stream;
        await this.videoElement.nativeElement.play();
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error cámara:', error);
      this.isLoading = false;
      this.cameraError = 'No se pudo acceder a la cámara. Por favor, verifique los permisos en su navegador.';
    }
  }

  public capturePhoto(): void {
    if (!this.videoElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    // Ajustamos el canvas a la resolución real del stream de video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Extraemos la imagen en formato WebP con calidad 80% (pesa mucho menos que un JPEG sin pérdida visual)
      this.capturedImage = canvas.toDataURL('image/webp', 0.80);
    }

    this.isCameraActive = false;
    this.stopCamera();
  }

  public savePhoto(): void {
    if (this.capturedImage) {
      // Emitimos la imagen original al padre para que él decida 
      // si pasar por OpenCV y el Editor Aislado.
      this.onPhotoSaved.emit(this.capturedImage);
    }
  }

  public retakePhoto(): void {
    this.isCameraActive = true;
    this.capturedImage = null;
    this.startCamera();
  }

  public stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}