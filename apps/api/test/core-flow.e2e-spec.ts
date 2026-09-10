import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Kernflow (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const uniqueSuffix = Date.now();

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registreert een nieuwe gebruiker en geeft een JWT terug', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: `e2e-${uniqueSuffix}@example.com`, password: 'password123', name: 'E2E Test' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(`e2e-${uniqueSuffix}@example.com`);
    token = res.body.accessToken;
  });

  it('weigert dubbele registratie met hetzelfde e-mailadres', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: `e2e-${uniqueSuffix}@example.com`, password: 'password123' })
      .expect(409);
  });

  it('weigert onbeveiligde toegang zonder token', async () => {
    await request(app.getHttpServer()).get('/api/shopping-lists').expect(401);
  });

  it('doorloopt de volledige kernflow: supermarkten, product, prijzen, lijst, vergelijking, advies', async () => {
    const server = app.getHttpServer();

    const sm1 = await request(server)
      .post('/api/supermarkets')
      .send({ name: `AH E2E ${uniqueSuffix}` })
      .expect(201);
    const sm2 = await request(server)
      .post('/api/supermarkets')
      .send({ name: `Jumbo E2E ${uniqueSuffix}` })
      .expect(201);

    const product = await request(server)
      .post('/api/products')
      .send({ nameNl: `E2E Testmelk ${uniqueSuffix}`, nameEn: 'E2E Test milk', category: 'DAIRY', unit: '1L' })
      .expect(201);
    const productId = product.body.id;

    await request(server)
      .post('/api/prices')
      .send({ productId, supermarketId: sm1.body.id, regularPrice: 1.5 })
      .expect(201);
    await request(server)
      .post('/api/prices')
      .send({ productId, supermarketId: sm2.body.id, regularPrice: 1.1 })
      .expect(201);

    const list = await request(server)
      .post('/api/shopping-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E lijst' })
      .expect(201);
    const listId = list.body.id;

    const item = await request(server)
      .post(`/api/shopping-lists/${listId}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rawText: `e2e testmelk ${uniqueSuffix}`, quantity: 1 })
      .expect(201);

    // Exacte match (zelfde naam), dus moet direct EXACT matchen met hoge confidence.
    expect(item.body.matchedProductId).toBe(productId);
    expect(item.body.matchMethod).toBe('EXACT');

    const comparison = await request(server)
      .get(`/api/price-comparison/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    // NB: filteren op onze eigen supermarkten, want deze (dev-)database kan
    // ook data van andere tests/sessies bevatten.
    const ownResults = comparison.body.filter((r: { supermarketId: string }) =>
      [sm1.body.id, sm2.body.id].includes(r.supermarketId),
    );
    expect(ownResults).toHaveLength(2);
    const sm1Result = ownResults.find((r: { supermarketId: string }) => r.supermarketId === sm1.body.id);
    const sm2Result = ownResults.find((r: { supermarketId: string }) => r.supermarketId === sm2.body.id);
    expect(sm1Result.totalPrice).toBeCloseTo(1.5, 2);
    expect(sm2Result.totalPrice).toBeCloseTo(1.1, 2);

    const cheapest = await request(server)
      .get(`/api/shopping-optimization/${listId}?strategy=CHEAPEST`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(cheapest.body.recommendation.supermarketId).toBe(sm2.body.id); // Jumbo is goedkoper
    expect(cheapest.body.recommendation.totalPrice).toBeCloseTo(1.1, 2);
  });

  it('berekent een gezondheidsscore en geeft die als A-E terug', async () => {
    const server = app.getHttpServer();

    const product = await request(server)
      .post('/api/products')
      .send({ nameNl: `E2E Groente ${uniqueSuffix}`, nameEn: 'E2E Vegetable', category: 'VEGETABLES', unit: '500g' })
      .expect(201);

    await request(server)
      .post('/api/nutrition')
      .send({
        productId: product.body.id,
        energyKcal: 25,
        fat: 0.2,
        saturatedFat: 0,
        carbohydrates: 4,
        sugars: 2,
        fiber: 3,
        protein: 2,
        salt: 0.05,
      })
      .expect(201);

    const score = await request(server).post(`/api/health-scoring/${product.body.id}/compute`).expect(201);
    expect(['A', 'B', 'C', 'D', 'E']).toContain(score.body.grade);
    expect(score.body.grade).toBe('A'); // groente-achtige waarden -> beste score
  });

  it('houdt voorraad bij en vult automatisch de boodschappenlijst aan bij lage voorraad', async () => {
    const server = app.getHttpServer();

    const product = await request(server)
      .post('/api/products')
      .send({ nameNl: `E2E Pantry Product ${uniqueSuffix}`, nameEn: 'E2E Pantry Product', category: 'OTHER', unit: 'stuk' })
      .expect(201);
    const productId = product.body.id;

    const upserted = await request(server)
      .post('/api/pantry')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, quantity: 1, lowStockThreshold: 1 })
      .expect(201);
    expect(upserted.body.quantity).toBe(1);

    const pantry = await request(server).get('/api/pantry').set('Authorization', `Bearer ${token}`).expect(200);
    const ownEntry = pantry.body.find((p: { productId: string }) => p.productId === productId);
    expect(ownEntry.status).toBe('LOW');

    await request(server)
      .post('/api/pantry/adjust')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId, delta: -1 })
      .expect(201);

    const lowStock = await request(server)
      .get('/api/pantry/low-stock')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(lowStock.body.some((p: { productId: string }) => p.productId === productId)).toBe(true);

    const list = await request(server)
      .post('/api/shopping-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E pantry-lijst' })
      .expect(201);

    const added = await request(server)
      .post(`/api/pantry/low-stock/add-to-list/${list.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    expect(added.body.some((item: { matchedProductId: string }) => item.matchedProductId === productId)).toBe(true);
  });

  it('sluit producten die al voldoende op voorraad zijn uit van de vergelijking wanneer considerPantry=true', async () => {
    const server = app.getHttpServer();

    const inStockProduct = await request(server)
      .post('/api/products')
      .send({ nameNl: `E2E Op voorraad ${uniqueSuffix}`, nameEn: 'E2E In stock', category: 'OTHER', unit: 'stuk' })
      .expect(201);
    const otherProduct = await request(server)
      .post('/api/products')
      .send({ nameNl: `E2E Nog nodig ${uniqueSuffix}`, nameEn: 'E2E Still needed', category: 'OTHER', unit: 'stuk' })
      .expect(201);

    const supermarket = await request(server)
      .post('/api/supermarkets')
      .send({ name: `E2E Pantry SM ${uniqueSuffix}` })
      .expect(201);

    await request(server)
      .post('/api/prices')
      .send({ productId: inStockProduct.body.id, supermarketId: supermarket.body.id, regularPrice: 2 })
      .expect(201);
    await request(server)
      .post('/api/prices')
      .send({ productId: otherProduct.body.id, supermarketId: supermarket.body.id, regularPrice: 3 })
      .expect(201);

    // Ruim op voorraad -> status OK
    await request(server)
      .post('/api/pantry')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: inStockProduct.body.id, quantity: 10, lowStockThreshold: 1 })
      .expect(201);

    const list = await request(server)
      .post('/api/shopping-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E pantry-vergelijking' })
      .expect(201);

    await request(server)
      .post(`/api/shopping-lists/${list.body.id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rawText: `e2e op voorraad ${uniqueSuffix}`, quantity: 1 })
      .expect(201);
    await request(server)
      .post(`/api/shopping-lists/${list.body.id}/items`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rawText: `e2e nog nodig ${uniqueSuffix}`, quantity: 1 })
      .expect(201);

    const withoutPantry = await request(server)
      .get(`/api/shopping-optimization/${list.body.id}?strategy=CHEAPEST`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(withoutPantry.body.recommendation.totalPrice).toBeCloseTo(5, 2); // beide producten

    const withPantry = await request(server)
      .get(`/api/shopping-optimization/${list.body.id}?strategy=CHEAPEST&considerPantry=true`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(withPantry.body.recommendation.totalPrice).toBeCloseTo(3, 2); // alleen het product dat nog nodig is
    expect(withPantry.body.excludedForStock).toContain(inStockProduct.body.id);
  });
});
