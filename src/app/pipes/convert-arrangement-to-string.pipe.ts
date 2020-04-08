import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'convertArrangementToString'
})
export class ConvertArrangementToStringPipe implements PipeTransform {
  str;
  transform(value: any, frequencies): any {
    // console.log(value);

    if (value.active) {
      this.str = `<p>The defendant agreed to pay `;
    } else {
      this.str = `<p>`;
    }
    if (parseInt(value.first_amount, 10) > 0 && value.first_date) {
      this.str += `initial payment of <strong>&pound;${value.first_amount}</strong> due on <strong>${moment(value.first_date).format('YYYY-MM-DD')}</strong> followed by `;
    }
    this.str += `<strong>&pound;${value.amount}</strong> with a <strong>${frequencies[value.freq]}</strong> on <strong>${moment(value.start).format('YYYY-MM-DD')}</strong>.</p > `;
    // if (value.active) {
    //   this.str += `<p>$totalPayments payments scheduled (created on ${value.created})</p>`;
    // }
    // if (paid > 0 || un_paid > 0 && value.active !== 0) {
    //   this.str += `<p>${paid} payments received - ${un_paid} payments missing</p>`;
    // }
    // how many payments set...
    // if there are payed print number of payed
    if (value.active === 1) {
      // next payment due.
      this.str += '<p></p>';
    }
    return this.str;
  }

}
