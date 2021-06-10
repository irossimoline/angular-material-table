# Angular material table (Angular 10+)

**Forked from [angular4-material-table](https://github.com/irossimoline/angular4-material-table)**

This project extends `@angular/cdk` data-table, also used in `@angular/material` table.

It extends `@angular/cdk/collections` DataSource in order to include a row structure, allowing row creation, inline row edition, deletion and validation.

Supported angular versions: 
- Angular <= 9: Please use [angular4-material-table](https://github.com/irossimoline/angular4-material-table)
- Angular 10 (v0.10.0)
- Angular 11 (v0.11.0)

![@e-is/ngx-material-table](https://i.imgur.com/ufilXlv.gif)

## Installation

To install the package run:

`npm install @e-is/ngx-material-table`

## Example

Example of using `@e-is/ngx-material-table`:

![@e-is/ngx-material-table](https://i.imgur.com/vncajJG.png)

![Other example](https://i.imgur.com/5ed814s.png)


## Use

### Initial steps

To use this table, first of all you must check [how use angular `@angular/cdk` data-table](https://material.angular.io/guide/cdk-table).

### Useful data and methods

Using this extension, you can set CDK data-table `datasource` with an instance of `TableDataSource`.

Using `TableDataSource` allows you to have some row related methods and data to implement add/edit/remove elements:
```typescript
class TableElement<T> {
  id: number;
  editing: boolean;
  currentData?: T;
  originalData?: T;
  source: TableDataSource<T>;
  validator: FormGroup; // Used only in reactive forms.

  delete(): void;
  confirmEditCreate(): boolean;
  startEdit(): void;
  cancelOrDelete(): void;
  isValid(): boolean; // Used only in reactive forms.
}
```

```typescript
class TableDataSource<T> {

  constructor(
    data: T[],
    dataType?: new () => T,
    validatorService?: ValidatorService,
    config = { prependNewElements: false, suppressErrors: false });

  datasourceSubject: Subject<T[]>;

  updateDatasource(data: T[], options = { emitEvent: true }): void;

  createNew(): void;

  getRow(id: number): TableElement<T>;
}
```

### Angular4 material table example

Angular material table use example:
![Example of @e-is/ngx-material-table use](https://i.imgur.com/ath56FU.png)

[See this package in action](https://stackblitz.com/edit/angular-tj9f6y)

#### Optional libraries
Optional libraries used in the example:
```
"@angular/material": "11.0.1",
"@angular/forms": "11.0.2", // <- For inline validation
"font-awesome": "4.7.0"
```

#### person-list-reactive-forms.component.html


```html
<mat-table [dataSource]="dataSource">
  <ng-container matColumnDef="name">
    <mat-header-cell *matHeaderCellDef> Name </mat-header-cell>
    <mat-cell *matCellDef="let row">
      <mat-form-field floatPlaceholder="{{ row.editing ? 'float' : 'never'}}">
        <input [formControl]="row.validator.controls['name']" placeholder="Name" matInput>
      </mat-form-field>
    </mat-cell>
  </ng-container>
  <ng-container matColumnDef="age">
    <mat-header-cell *matHeaderCellDef> Age </mat-header-cell>
    <mat-cell *matCellDef="let row">
      <mat-form-field floatPlaceholder="{{ row.editing ? 'float' : 'never'}}">
        <input [formControl]="row.validator.controls['age']" type="number" placeholder="Age" matInput>
      </mat-form-field>
    </mat-cell>
  </ng-container>
  <ng-container matColumnDef="actionsColumn">
    <mat-header-cell *matHeaderCellDef>
      <button mat-icon-button color="accent" (click)="dataSource.createNew()"><i class="fa fa-plus mat-icon"></i></button>
    </mat-header-cell>
    <mat-cell *matCellDef="let row">
      <button *ngIf="!row.editing" mat-icon-button color="primary" focusable="false" (click)="row.startEdit()">
            <i class="fa fa-pencil mat-icon"></i>
          </button>
      <button *ngIf="row.editing" mat-icon-button color="primary" focusable="false" (click)="row.confirmEditCreate()">
            <i class="fa fa-check mat-icon"></i>
          </button>
      <button mat-icon-button color="primary" focusable="false" (click)="row.cancelOrDelete()">
            <i class="fa fa-times mat-icon"></i>
          </button>
    </mat-cell>
  </ng-container>

  <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
  <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
</mat-table>
```

#### person-list-template-driven.component.html


```html
<mat-table [dataSource]="dataSource">
  <ng-container matColumnDef="name">
    <mat-header-cell *matHeaderCellDef> Name </mat-header-cell>
    <mat-cell *matCellDef="let row">
      <mat-form-field floatPlaceholder="{{ row.editing ? 'float' : 'never'}}">
        <input [(ngModel)]="row.currentData.name" placeholder="Name" [disabled]="!row.editing" matInput>
      </mat-form-field>
    </mat-cell>
  </ng-container>
  <ng-container matColumnDef="age">
    <mat-header-cell *matHeaderCellDef> Age </mat-header-cell>
    <mat-cell *matCellDef="let row">
      <mat-form-field floatPlaceholder="{{ row.editing ? 'float' : 'never'}}">
        <input type="number" [(ngModel)]="row.currentData.age" placeholder="Age"  [disabled]="!row.editing" matInput>
      </mat-form-field>
    </mat-cell>
  </ng-container>
  <ng-container matColumnDef="actionsColumn">
    <mat-header-cell *matHeaderCellDef>
      <button mat-icon-button color="accent" (click)="dataSource.createNew()"><i class="fa fa-plus mat-icon"></i></button>
    </mat-header-cell>
    <mat-cell *matCellDef="let row">
      <button *ngIf="!row.editing" mat-icon-button color="primary" focusable="false" (click)="row.startEdit()">
            <i class="fa fa-pencil mat-icon"></i>
          </button>
      <button *ngIf="row.editing" mat-icon-button color="primary" focusable="false" (click)="row.confirmEditCreate()">
            <i class="fa fa-check mat-icon"></i>
          </button>
      <button mat-icon-button color="primary" focusable="false" (click)="row.cancelOrDelete()">
            <i class="fa fa-times mat-icon"></i>
          </button>
    </mat-cell>
  </ng-container>

  <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
  <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
</mat-table>
```

#### person-list.component.ts
```typescript
@Component({
  selector: 'app-person-list',
  providers: [
    {provide: ValidatorService, useClass: PersonValidatorService }
  ],
  templateUrl: './person-list.component.html',
})
export class PersonListComponent implements OnInit {

  constructor(private personValidator: ValidatorService) { }

  displayedColumns = ['name', 'age', 'actionsColumn'];

  @Input() personList;
  @Output() personListChange = new EventEmitter<Person[]>();

  dataSource: TableDataSource<Person>;


  ngOnInit() {
    this.dataSource = new TableDataSource<any>(this.personList, Person, this.personValidator);

    this.dataSource.datasourceSubject.subscribe(personList => this.personListChange.emit(personList));
  }
}

class Person {
  name: string;
  age: number;
}

@Injectable()
class PersonValidatorService implements ValidatorService {
  getRowValidator(): FormGroup {
    return new FormGroup({
      'name': new FormControl(null, Validators.required),
      'age': new FormControl(),
      });
  }
}

```

## Contributions

Any suggestion or contribution will be appreciated.




