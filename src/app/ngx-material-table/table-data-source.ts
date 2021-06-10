import {CollectionViewer, DataSource, ListRange} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {TableElementFactory} from './table-element.factory';
import {ValidatorService} from './validator.service';
import {TableElement} from './table-element';
import {DefaultValidatorService} from './default-validator.service';
import {map} from 'rxjs/operators';
import {moveItemInArray} from '@angular/cdk/drag-drop';

/**
 * TableDataSourceOptions:
 * prependNewElements: if true, the new row is prepended to all other rows; otherwise it is appended
 * suppressErrors: if true, no error log
 * keepOriginalDataAfterConfirm: if true, a modified row always keeps its first original data;
 *                               otherwise the original data is erased every edition start
 */
export interface TableDataSourceOptions {
  prependNewElements?: boolean;
  suppressErrors?: boolean;
  keepOriginalDataAfterConfirm?: boolean;
}

export class TableDataSource<T> extends DataSource<TableElement<T>> {

  protected rowsSubject: BehaviorSubject<TableElement<T>[]>;
  datasourceSubject: Subject<T[]>;

  protected dataConstructor: new () => T;
  protected dataKeys: any[];
  protected connectedViewers: {
    viewer: CollectionViewer;
    subscription: Subscription;
    range: ListRange;
  }[] = [];

  protected currentData: any;
  private readonly _config: TableDataSourceOptions;

  get config(): TableDataSourceOptions {
    return this._config;
  }

  /**
   * Creates a new TableDataSource instance, that can be used as datasource of `@angular/cdk` data-table.
   * @param data Array containing the initial values for the TableDataSource. If not specified, then `dataType` must be specified.
   * @param dataType Type of data contained by the Table. If not specified, then `data` with at least one element must be specified.
   * @param validatorService Service that create instances of the FormGroup used to validate row fields.
   * @param config Additional configuration for table.
   */
  constructor(
    data: T[],
    dataType?: new () => T,
    private readonly validatorService?: ValidatorService,
    config?: TableDataSourceOptions) {
    super();

    this._config = {
      prependNewElements: false,
      suppressErrors: false,
      keepOriginalDataAfterConfirm: false,
      ... config
    };

    if (!validatorService) {
      this.validatorService = new DefaultValidatorService();
    }

    if (dataType) {
      this.dataConstructor = dataType;
    } else {
      if (data && data.length > 0) {
        this.dataKeys = Object.keys(data[0]);
      } else {
        throw new Error('You must define either a non empty array, or an associated class to build the table.');
      }
    }

    this.checkValidatorFields(this.validatorService);

    this.rowsSubject = new BehaviorSubject(this.getRowsFromData(data));
    this.datasourceSubject = new Subject<T[]>();
  }

  protected checkValidatorFields(validatorService: ValidatorService) {
    if (!this._config.suppressErrors) {
      return;
    } // Skip, as error will not be logged
    const formGroup = validatorService.getRowValidator();
    if (formGroup != null) {
      const rowKeys = Object.keys(this.createNewObject());
      const invalidKeys = Object.keys(formGroup.controls).filter(key => !rowKeys.some(x => x === key));
      if (invalidKeys.length > 0) {
        this.logError('Validator form control keys must match row object keys. Invalid keys: ' + invalidKeys.toString());
      }
    }
  }

  protected logError(message: string) {
    if (!this._config.suppressErrors) {
      console.error(message);
    }
  }

  /**
   * Start the creation of a new element, pushing an empty-data row in the table.
   * @param insertAt: insert the new element at specified position
   */
  createNew(insertAt?: number): void {
    const source = this.rowsSubject.getValue();

    if (!this.existsNewElement(source)) {

      const newElement = TableElementFactory.createTableElement({
        id: -1,
        editing: true,
        currentData: this.createNewObject(),
        source: this,
        validator: this.validatorService.getRowValidator()
      });

      if (insertAt) {
        source.splice(insertAt, 0, newElement);
        this.rowsSubject.next(source);
      } else {
        if (this._config.prependNewElements) {
          this.rowsSubject.next([newElement].concat(source));
        } else {
          source.push(newElement);
          this.rowsSubject.next(source);
        }
      }
    }
  }

  /**
   * Confirm creation of the row. Save changes and disable editing.
   * If validation active and row data is invalid, it doesn't confirm creation neither disable editing.
   * @param row Row to be confirmed.
   */
  confirmCreate(row: TableElement<T>): boolean {
    if (!row.isValid()) {
      return false;
    }

    const source = this.rowsSubject.getValue();
    row.id = source.length - 1;
    this.rowsSubject.next(source);

    if (this._config.keepOriginalDataAfterConfirm) {
      row.originalData = row.currentData;
    }
    row.editing = false;

    this.updateDatasourceFromRows(source);
    return true;
  }

  /**
   * Confirm edition of the row. Save changes and disable editing.
   * If validation active and row data is invalid, it doesn't confirm editing neither disable editing.
   * @param row Row to be edited.
   */
  confirmEdit(row: TableElement<T>): boolean {
    if (!row.isValid()) {
      return false;
    }

    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(row.id, source);

    source[index] = row;
    this.rowsSubject.next(source);

    if (!this._config.keepOriginalDataAfterConfirm) {
      row.originalData = undefined;
    }
    row.editing = false;

    this.updateDatasourceFromRows(source);
    return true;
  }

  /**
   * Delete the row with the index specified.
   */
  delete(id: number): void {
    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(id, source);

    source.splice(index, 1);
    this.updateRowIds(index, source);

    this.rowsSubject.next(source);

    if (id !== -1) {
      this.updateDatasourceFromRows(source);
    }
  }

  /**
   * Move a row up or down
   * @param id Id of the row
   * @param direction Direction: negative value for up, positive value for down
   */
  move(id: number, direction: number) {
    if (direction === 0) {
      return;
    }

    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(id, source);

    moveItemInArray(source, index, index + direction);
    this.updateRowIds(0, source);

    this.rowsSubject.next(source);

    if (id !== -1) {
      this.updateDatasourceFromRows(source);
    }
  }

  /**
   * Get row from the table.
   * @param id Id of the row to retrieve, -1 returns the current new line.
   */
  getRow(id: number): TableElement<T> {
    const source = this.rowsSubject.getValue();
    const index = this.getIndexFromRowId(id, source);

    return (index >= 0 && index < source.length) ? source[index] : null;
  }

  /**
   * Update the datasource with a new array of data. If the array reference
   * is the same as the previous one, it doesn't trigger an update.
   * @param data Data to update the table datasource.
   * @param options Specify options to update the datasource.
   * If emitEvent is true and the datasource is updated, it emits an event
   * from 'datasourceSubject' with the updated data. If false, it doesn't
   * emit an event. True by default.
   */
  updateDatasource(data: T[], options = {emitEvent: true}): void {
    if (this.currentData !== data) {
      this.currentData = data;
      this.rowsSubject.next(this.getRowsFromData(data));

      if (options.emitEvent) {
        this.datasourceSubject.next(data);
      }
    }
  }


  /**
   * Checks the existence of the a new row (not yet saved).
   * @param source
   */
  protected existsNewElement(source: TableElement<T>[]): boolean {
    return source.length > 0 && this.getNewRowIndex(source) > -1;
  }

  /**
   * Returns the possible index of the new row depending on the insertion type.
   * It doesn't imply that the new row is created, that must be checked.
   * @param source
   */
  protected getNewRowIndex(source: TableElement<T>[]): number {
    return this.getIndexFromRowId(-1, source);
  }

  /**
   * Returns the row id from the index specified. It does
   * not consider if the new row is present or not, assumes
   * that new row is not present.
   * @param index Index of the array.
   * @param count Quantity of elements in the array.
   */
  protected getRowIdFromIndex(index: number, count: number): number {
    if (this._config.prependNewElements) {
      return count - 1 - index;
    } else {
      return index;
    }
  }

  /**
   * Returns the index from the row id specified.
   * It takes into account if the new row exists or not.
   * @param id
   * @param source
   */
  protected getIndexFromRowId(id: number, source: TableElement<T>[]): number {
    return source.findIndex(element => element.id === id);
  }

  /**
   * Update rows ids in the array specified, starting in the specified index
   * until the start/end of the array, depending on config.prependNewElements
   * configuration.
   * @param initialIndex Initial index of source to be updated.
   * @param source Array that contains the rows to be updated.
   */
  protected updateRowIds(initialIndex: number, source: TableElement<T>[]): void {

    const delta = this._config.prependNewElements ? -1 : 1;

    for (let index = initialIndex; index < source.length && index >= 0; index += delta) {
      if (source[index].id !== -1) {
        source[index].id = this.getRowIdFromIndex(index, source.length);
      }
    }
  }

  /**
   * Get the data from the rows.
   * @param rows Rows to extract the data.
   */
  protected getDataFromRows(rows: TableElement<T>[]): T[] {
    return rows
      .filter(row => row.id !== -1)
      .map<T>((row) => {
        return !this._config.keepOriginalDataAfterConfirm && row.originalData ? row.originalData : row.currentData;
      });
  }

  /**
   * Update the datasource with the data contained in the specified rows.
   * @param rows Rows that contains the datasource's new data.
   */
  protected updateDatasourceFromRows(rows: TableElement<T>[]): void {
    this.currentData = this.getDataFromRows(rows);
    this.datasourceSubject.next(this.currentData);
  }

  /**
   * From an array of data, it returns rows containing the original data.
   * @param arrayData Data from which create the rows.
   */
  protected getRowsFromData(arrayData: T[]): TableElement<T>[] {
    return arrayData.map<TableElement<T>>((data, index) => {

      return TableElementFactory.createTableElement({
        id: this.getRowIdFromIndex(index, arrayData.length),
        editing: false,
        currentData: data,
        source: this,
        validator: this.validatorService.getRowValidator()
      });
    });
  }

  /**
   * Create a new object with identical structure than the table source data.
   * It uses the object's type constructor if available, otherwise it creates
   * an object with the same keys of the first element contained in the original
   * datasource (used in the constructor).
   */
  protected createNewObject(): T {
    if (this.dataConstructor) {
      return new this.dataConstructor();
    } else {
      return this.dataKeys.reduce((obj, key) => {
        obj[key] = undefined;
        return obj;
      }, {});
    }

  }

  /** Connect function called by the table to retrieve one stream containing
   *  the data to render. */

  /*connect(): Observable<TableElement<T>[]> {
    return this.rowsSubject.asObservable();
  }*/

  connect(collectionViewer: CollectionViewer): Observable<TableElement<T>[] | ReadonlyArray<TableElement<T>>> {
    const range: ListRange = {
      start: 0,
      end: -1
    };
    if (collectionViewer) {
      this.connectedViewers.push({
        viewer: collectionViewer,
        range,
        subscription: collectionViewer.viewChange.subscribe(r => {
          range.start = r.start;
          range.end = r.end;
        })
      });
    }
    return this.rowsSubject.asObservable()
      .pipe(
        map(data => {
          if (range.start > 0) {
            if (range.end > range.start) {
              return data.slice(range.start, range.end);
            }
            return data.slice(range.start);
          }
          return data;
        })
      );
  }

  disconnect(collectionViewer: CollectionViewer) {
    const ref = this.connectedViewers.find(r => r.viewer === collectionViewer);
    if (ref && ref.subscription) {
      ref.subscription.unsubscribe();
    }
  }
}
