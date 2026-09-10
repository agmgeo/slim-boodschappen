import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { matchProduct, MatchCandidate } from './engines/product-matching.engine';

@Injectable()
export class ProductMatchingService {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Matcht een vrije-tekst boodschappenlijst-regel naar een canoniek product.
   * Gebruikt uitsluitend normale softwarelogica (normalisatie + fuzzy matching).
   * Als de confidence onder de drempel blijft, geeft dit UNMATCHED terug —
   * dát is het punt waar een toekomstige AI-fallback zou kunnen inhaken
   * (nog niet geïmplementeerd, zoals gevraagd).
   */
  async matchText(rawText: string) {
    const withAliases = await this.productsService.getAllWithAliases();
    const candidates: MatchCandidate[] = withAliases.map(({ product, aliases }) => ({
      productId: product.id,
      names: [product.nameNl, product.nameEn, ...aliases],
    }));
    return matchProduct(rawText, candidates);
  }
}
