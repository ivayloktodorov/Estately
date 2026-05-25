import bg from '../../../estately-web/locales/bg/common.json';
import en from '../../../estately-web/locales/en/common.json';

type Dictionary = typeof en;
type TranslationKey = keyof Dictionary;

const dictionaries = { bg, en } satisfies Record<string, Dictionary>;

const locale = 'en';

export function t(key: TranslationKey): string {
  return dictionaries[locale][key] ?? dictionaries.en[key];
}
