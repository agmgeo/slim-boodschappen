/**
 * Vastgelegde (ingekorte) tekstweergave van https://www.ah.nl/bonus, opgehaald
 * via live browsercontrole op 9 september 2026. Dient als testfixture voor de
 * AhFolderAdapter-parser, zodat de parslogica getest kan worden zonder dat
 * deze sandbox zelf ah.nl hoeft te bereiken (wat hier niet mag/kan).
 *
 * NB: dit is een momentopname. AH ververst hun Bonus-pagina wekelijks; de
 * parser moet dus tegen wisselende inhoud bestand zijn (vandaar: patronen
 * herkennen, geen vaste tekst verwachten).
 */
export const AH_BONUS_PAGE_FIXTURE = `
Deze week in de Bonus

7 t/m 13 sep

Geldig t/m 13 september

Groente, aardappelen
1+1 gratis

AH Paprika rood

1.09

per stuk

per 500 gram 1.09

AH Broccoli

2 voor 2.99

Alle Bonduelle 255-400 gram

2e halve prijs

Alle AH Slamelanges 75-130 gram

2 voor 1.49

AH Maiskolf

1.19

per stuk

voor 0.99

AH Winterpeen

0.99

1.39

1 kg

€1 korting

Alle AH Disney verspakketten

3 voor 6.00

AH Slaverrijkers

Fruit, verse sappen
uitgelicht
1+1 gratis

AH Druiven

2 voor 3.50

Chiquita bananen ready to eat en later lekker 5 stuks

25% korting

AH Mandarijnen groot 1.5 kilo of Orri mandarijnen 750 gram

voor 3.99

AH Blauwe bessen

3.99

4.29

300 g

Vlees
voor 1.79

Unox Knaks

1.79

2.79

400 g

25% korting

Alle AH Hamburgers 2 stuks*

*M.u.v. Biologisch

15% korting

AH Schouderkarbonade of speklap 2 stuks
`;
