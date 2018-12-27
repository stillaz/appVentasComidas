import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'udpCurrency'
})
export class UdpCurrencyPipe implements PipeTransform {

  transform(value: any): any {
    if (!value) {
      return null;
    }
    const res = parseInt(value.replace(/[^\d]/g, ""));
    if (!isNaN(res)) {
      return res.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumSignificantDigits: 8,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).replace("$", "$ ").replace(/,/g, ".");
    }

    return null;
  }

}
