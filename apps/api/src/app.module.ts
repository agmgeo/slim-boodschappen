import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from './common/cache/cache.module';
import { DatabaseModule } from './database/database.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ShoppingListsModule } from './modules/shopping-lists/shopping-lists.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductMatchingModule } from './modules/product-matching/product-matching.module';
import { SupermarketsModule } from './modules/supermarkets/supermarkets.module';
import { StoresModule } from './modules/stores/stores.module';
import { FoldersModule } from './modules/folders/folders.module';
import { OffersModule } from './modules/offers/offers.module';
import { PricesModule } from './modules/prices/prices.module';
import { PriceComparisonModule } from './modules/price-comparison/price-comparison.module';
import { ShoppingOptimizationModule } from './modules/shopping-optimization/shopping-optimization.module';
import { BarcodeScannerModule } from './modules/barcode-scanner/barcode-scanner.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { HealthScoringModule } from './modules/health-scoring/health-scoring.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ScanHistoryModule } from './modules/scan-history/scan-history.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { PantryModule } from './modules/pantry/pantry.module';
import { FolderImportModule } from './modules/folder-import/folder-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule,
    DatabaseModule,

    // Auth & users
    AuthModule,
    UsersModule,
    SettingsModule,

    // Boodschappenlijst & producten
    ShoppingListsModule,
    ProductsModule,
    ProductMatchingModule,

    // Supermarkten, filialen, folders, aanbiedingen, prijzen
    SupermarketsModule,
    StoresModule,
    FoldersModule,
    OffersModule,
    PricesModule,

    // Vergelijken & optimaliseren
    PriceComparisonModule,
    ShoppingOptimizationModule,

    // Scannen, voeding & gezondheid
    BarcodeScannerModule,
    NutritionModule,
    HealthScoringModule,

    // Persoonlijk
    FavoritesModule,
    ScanHistoryModule,

    // Internationalisatie
    I18nModule,

    // Voorraadbeheer
    PantryModule,

    // Automatische folder-import per supermarkt
    FolderImportModule,
  ],
})
export class AppModule {}
