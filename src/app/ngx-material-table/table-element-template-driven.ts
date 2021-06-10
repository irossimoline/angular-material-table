import {TableElement} from './table-element';

export class TableElementTemplateDriven<T> extends TableElement<T> {

  _editing: boolean;
  _currentData: T;

  get validator(): any {
    return undefined;
  }

  set validator(value: any) {
  }

  get currentData(): T {
    return this._currentData;
  }

  set currentData(data: T) {
    this._currentData = data;
  }

  get editing(): boolean {
    return this._editing;
  }

  set editing(value: boolean) {
    this._editing = value;
  }

  constructor(init: Partial<TableElementTemplateDriven<T>>) {
    super();
    Object.assign(this, init);
  }

  isValid() {
    return true;
  }
}
