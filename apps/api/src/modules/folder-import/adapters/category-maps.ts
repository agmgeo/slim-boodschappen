import { ProductCategory } from '@app/shared';

const C = ProductCategory;

/**
 * Elke supermarkt gebruikt net andere afdelingsnamen. Onbekende/nieuwe
 * afdelingen vallen terug op OTHER (in folder-page-parser.engine.ts) i.p.v.
 * te crashen — dus deze lijsten hoeven niet 100% compleet te zijn om bruikbaar
 * te zijn, alleen "goed genoeg" en uit te breiden wanneer iets opvalt in de
 * `unrecognized`-log.
 */

export const AH_CATEGORY_HEADERS: Record<string, ProductCategory> = {
  'Groente, aardappelen': C.VEGETABLES,
  'Fruit, verse sappen': C.FRUIT,
  'Maaltijden, salades': C.OTHER,
  Vlees: C.MEAT,
  Vis: C.FISH,
  'Vegetarisch, vegan en plantaardig': C.OTHER,
  Vleeswaren: C.MEAT,
  Kaas: C.DAIRY,
  'Zuivel, eieren': C.DAIRY,
  Bakkerij: C.BAKERY,
  Glutenvrij: C.OTHER,
  'Borrel, chips, snacks': C.SNACKS,
  'Pasta, rijst, wereldkeuken': C.PANTRY,
  'Soepen, sauzen, kruiden, olie': C.PANTRY,
  'Koek, snoep, chocolade': C.SNACKS,
  'Ontbijtgranen, beleg': C.PANTRY,
  Diepvries: C.FROZEN,
  'Koffie, thee': C.DRINKS,
  'Frisdrank, sappen, water': C.DRINKS,
  'Bier, wijn, aperitieven': C.DRINKS,
  Drogisterij: C.PERSONAL_CARE,
  'Gezondheid en sport': C.PERSONAL_CARE,
  Huishouden: C.HOUSEHOLD,
  'Baby en kind': C.OTHER,
  Huisdier: C.OTHER,
  'Koken, tafelen, vrije tijd': C.HOUSEHOLD,
};

export const JUMBO_CATEGORY_HEADERS: Record<string, ProductCategory> = {
  'Aardappels, groente en fruit': C.VEGETABLES,
  Vlees: C.MEAT,
  'Vis, schaal- en schelpdieren': C.FISH,
  'Vega, tofu en vleesvervangers': C.OTHER,
  'Kaas, vleeswaren en tapas': C.DAIRY,
  'Zuivel, eieren, boter': C.DAIRY,
  'Brood en gebak': C.BAKERY,
  'Ontbijtgranen en beleg': C.PANTRY,
  'Snoep, koek en chocolade': C.SNACKS,
  'Chips, popcorn en noten': C.SNACKS,
  'Pasta, rijst en wereldkeuken': C.PANTRY,
  'Soepen, sauzen, kruiden en olie': C.PANTRY,
  Diepvries: C.FROZEN,
  'Koffie en thee': C.DRINKS,
  'Frisdrank, sappen en water': C.DRINKS,
  'Bier, wijn en aperitief': C.DRINKS,
  'Drogisterij en parfumerie': C.PERSONAL_CARE,
  'Huishouden en huisdier': C.HOUSEHOLD,
  'Baby, kind en zwanger': C.OTHER,
};

export const LIDL_CATEGORY_HEADERS: Record<string, ProductCategory> = {
  'Groente & fruit': C.VEGETABLES,
  'Vlees & vis': C.MEAT,
  'Zuivel & eieren': C.DAIRY,
  'Brood & bakkerij': C.BAKERY,
  Diepvries: C.FROZEN,
  'Dranken & sappen': C.DRINKS,
  'Snoep & snacks': C.SNACKS,
  'Wonen & huishouden': C.HOUSEHOLD,
  Drogisterij: C.PERSONAL_CARE,
};

export const ALDI_CATEGORY_HEADERS: Record<string, ProductCategory> = {
  'Groente & fruit': C.VEGETABLES,
  'Vlees & vis': C.MEAT,
  'Zuivel & eieren': C.DAIRY,
  Brood: C.BAKERY,
  Diepvries: C.FROZEN,
  Dranken: C.DRINKS,
  Snacks: C.SNACKS,
  Huishouden: C.HOUSEHOLD,
};

export const DEKAMARKT_CATEGORY_HEADERS: Record<string, ProductCategory> = {
  'Groente en fruit': C.VEGETABLES,
  Vlees: C.MEAT,
  Vis: C.FISH,
  'Zuivel en eieren': C.DAIRY,
  Brood: C.BAKERY,
  Diepvries: C.FROZEN,
  Dranken: C.DRINKS,
  Snoep: C.SNACKS,
  Huishouden: C.HOUSEHOLD,
};

export const VOMAR_CATEGORY_HEADERS: Record<string, ProductCategory> = {
  'Groente en fruit': C.VEGETABLES,
  Vlees: C.MEAT,
  Zuivel: C.DAIRY,
  Brood: C.BAKERY,
  Diepvries: C.FROZEN,
  Dranken: C.DRINKS,
  Huishouden: C.HOUSEHOLD,
};

export const EKOPLAZA_CATEGORY_HEADERS: Record<string, ProductCategory> = {
  'Groente & fruit': C.VEGETABLES,
  Vlees: C.MEAT,
  Zuivel: C.DAIRY,
  Brood: C.BAKERY,
  Diepvries: C.FROZEN,
  Dranken: C.DRINKS,
  Huishouden: C.HOUSEHOLD,
};

export const AMAZING_ORIENTAL_CATEGORY_HEADERS: Record<string, ProductCategory> = {
  'Groente & fruit': C.VEGETABLES,
  Vlees: C.MEAT,
  Vis: C.FISH,
  'Sauzen & kruiden': C.PANTRY,
  'Rijst & noedels': C.PANTRY,
  Snacks: C.SNACKS,
  Dranken: C.DRINKS,
  Diepvries: C.FROZEN,
};
