import {TableElement} from './table-element';
import {FormGroup} from '@angular/forms';

export class TableElementReactiveForms<T> extends TableElement<T> {

  validator: FormGroup;

  get currentData(): T {
    return this.validator.getRawValue();
  }

  set currentData(data: T) {
    this.validator.patchValue(data);
  }

  get editing(): boolean {
    return this.validator.enabled;
  }

  set editing(value: boolean) {
    if (value) {
      this.validator.enable();
    } else {
      this.validator.disable();
    }
  }

  constructor(init: Partial<TableElementReactiveForms<T>>) {
    super();
    this.validator = init.validator;
    Object.assign(this, init);
  }

  isValid(): boolean {
    if (this.validator.disabled) {
      // Enable temporarily the validator to get the valid status
      this.validator.enable();
      const valid = this.validator.valid;
      this.validator.disable();
      return valid;
    }
    return this.validator.valid;
  }
}
