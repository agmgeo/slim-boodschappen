/**
 * Vastgelegde (ingekorte) HTML-structuur van https://www.dirk.nl/aanbiedingen,
 * opgehaald via live browsercontrole op 9 september 2026. De echte pagina
 * gebruikt exact dit schema.org @graph/ItemList-patroon voor hun JSON-LD.
 */
export const DIRK_JSONLD_PAGE_FIXTURE = `
<html>
<head>
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[{"@type":"ItemList","itemListElement":[
{"@type":"ListItem","position":1,"item":{"@type":"Product","name":"Bio+ Biologische rode bieten gekookt","sku":9,"image":["https://web-fileserver.dirk.nl/artikelen/100966.png"],"url":"/boodschappen/groente/bio-bieten/9","offers":{"@type":"Offer","price":0.99,"priceCurrency":"EUR"}}},
{"@type":"ListItem","position":2,"item":{"@type":"Product","name":"Dirk Halfvolle melk","sku":42,"image":["https://web-fileserver.dirk.nl/artikelen/100042.png"],"url":"/boodschappen/zuivel/halfvolle-melk/42","offers":{"@type":"Offer","price":1.09,"priceCurrency":"EUR"}}}
]}]}
</script>
</head>
<body>Geldig t/m 13 september</body>
</html>
`;
