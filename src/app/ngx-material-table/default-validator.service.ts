import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ValidatorService } from './validator.service';

@Injectable()
export class DefaultValidatorService implements ValidatorService {

  getRowValidator(): FormGroup {
    return null;
  }
}
