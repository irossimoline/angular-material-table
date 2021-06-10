/* tslint:disable:max-line-length */
import {Component} from '@angular/core';
import {Person} from './example-source-code/person-list.validator';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

  personList: Person[] = [
    {name: 'Ignacio Rossi', age: 25},
    {name: 'Benoit Lavenier', age: 40}
  ];

  personListChanged(personList) {
    // console.info('New person list:', personList);
  }
}
