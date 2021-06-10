import {FormGroup} from '@angular/forms';
import cloneDeep from 'lodash.clonedeep';

import {TableDataSource} from './table-data-source';

export abstract class TableElement<T> {

  id: number;
  originalData?: T;
  source: TableDataSource<T>;

  abstract get editing(): boolean;
  abstract set editing(editing: boolean);

  abstract get currentData(): T;
  abstract set currentData(currentData: T);

  abstract get validator(): FormGroup;
  abstract set validator(validator: FormGroup);

  delete(): void {
    this.source.delete(this.id);
  }

  confirmEditCreate(): boolean {
    if (this.id === -1) {
      return this.source.confirmCreate(this);
    } else {
      return this.source.confirmEdit(this);
    }
  }

  startEdit(): void {
    if (!this.originalData || !this.source.config.keepOriginalDataAfterConfirm) {
      this.originalData = cloneDeep(this.currentData);
    }
    this.editing = true;
  }

  /**
   * Cancel or delete
   */
  cancelOrDelete() {
    if (this.id === -1 || !this.editing) {
      this.delete();
    } else {
      this.currentData = this.originalData;
      this.editing = false;
    }
  }

  abstract isValid(): boolean;
}
