import { Pipe, PipeTransform } from '@angular/core';

export interface PersonLike {
  firstName?: string;
  lastName?: string;
  organisationName?: string;
}

export function displayName(person: PersonLike) {
  let name = '';

  if (person.firstName) {
    name = person.firstName.charAt(0).toUpperCase() + person.firstName.slice(1).toLowerCase();
  }
  if (person.lastName) {
    name += ' ' + person.lastName.toUpperCase();
  }
  if (person.organisationName) {
    name += ' ' + person.organisationName;
  }
  return name.trim();
}

@Pipe({ name: 'displayName' })
export class DisplayNamePipe implements PipeTransform {
  transform(person: PersonLike): string {
    return displayName(person);
  }
}
