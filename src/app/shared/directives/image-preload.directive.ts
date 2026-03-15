import { Directive, Input, HostBinding } from '@angular/core';

@Directive({
  standalone: true,
  selector: 'img[default]',
  host: {
    '(error)': 'updateUrl()',
    '(load)': 'load()',
    '[src]': 'src'
  }
})
export class ImagePreloadDirective {

  @Input() src!: string;
  @Input() default!: string;
  @HostBinding('class') className!: string;

  constructor() { }

  updateUrl() {
    this.src = this.default;
  }
  load() {
    this.className = 'image-loaded';
  }

}
