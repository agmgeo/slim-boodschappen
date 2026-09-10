import { Injectable, NotFoundException } from '@nestjs/common';
import * as nl from './locales/nl.json';
import * as en from './locales/en.json';

// Nieuwe taal toevoegen (DE/PL/TR/FR/ES) = nieuw JSON-bestand + regel hieronder.
const DICTIONARIES: Record<string, Record<string, string>> = { nl, en };

@Injectable()
export class I18nService {
  getDictionary(locale: string) {
    const dict = DICTIONARIES[locale.toLowerCase()];
    if (!dict) {
      throw new NotFoundException(`Taal "${locale}" wordt nog niet ondersteund.`);
    }
    return dict;
  }

  getSupportedLocales() {
    return Object.keys(DICTIONARIES);
  }
}
