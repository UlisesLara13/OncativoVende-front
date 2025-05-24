import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalFormat',
  standalone: true
})
export class DecimalFormatPipe implements PipeTransform {

  transform(value: number | string): string {
    if (value === null || value === undefined || value === '') {
      return ''; 
    }

    let parsedValue = parseFloat(value as string); 

    if (isNaN(parsedValue)) {
      return ''; 
    }

    return parsedValue.toLocaleString('es-AR', { 
      maximumFractionDigits: 0  
    });
  }
}
