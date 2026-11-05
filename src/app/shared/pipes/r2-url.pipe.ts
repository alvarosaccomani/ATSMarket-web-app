import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'r2Url'
})
export class R2UrlPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
