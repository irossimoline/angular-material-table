import { TableElementReactiveForms } from './table-element-reactive-forms';
import { TableElementTemplateDriven } from './table-element-template-driven';

export class TableElementFactory {

  public static createTableElement(newElement: any): any {
    if (this.isValidatorDefined(newElement)) {
      // Create reactive forms element here.
      return new TableElementReactiveForms(newElement);
    } else {
      // Default is the one without validator.
      return new TableElementTemplateDriven(newElement);
    }
  }

  static isValidatorDefined(newElement: any) {
    return newElement.validator !== undefined && newElement.validator !== null;
  }
}
