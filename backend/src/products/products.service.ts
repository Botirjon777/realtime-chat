import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Product } from './product.entity';

export interface ProductResult {
  id: number;
  sku: string;
  title: string;
  vendor: string;
  price: number;
  available: boolean;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product, 'products')
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Full-text search on title, sku, vendor.
   * Splits the query into keywords and ORs them together.
   * Returns up to 10 most relevant products.
   */
  async searchProducts(query: string): Promise<ProductResult[]> {
    if (!query?.trim()) return [];

    // Extract meaningful keywords (filter short stop-words)
    const stopWords = new Set(['do', 'you', 'have', 'i', 'a', 'the', 'is', 'are', 'any', 'can', 'me', 'show', 'what', 'need', 'want', 'looking', 'for', 'please', 'some', 'give']);
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    if (keywords.length === 0) return [];

    try {
      // Build dynamic OR conditions for each keyword
      const conditions = keywords.flatMap(kw => [
        { title: ILike(`%${kw}%`) },
        { sku: ILike(`%${kw}%`) },
        { vendor: ILike(`%${kw}%`) },
      ]);

      const products = await this.productRepository.find({
        where: conditions,
        take: 10,
        order: { sellable: 'DESC', title: 'ASC' },
      });

      return products.map(p => ({
        id: p.id,
        sku: p.sku || '',
        title: p.title || 'Unknown Product',
        vendor: p.vendor || '',
        price: p.price || 0,
        available: Boolean(p.sellable),
      }));
    } catch (err: any) {
      this.logger.error(`Product search failed: ${err.message}`);
      return [];
    }
  }

  /**
   * Format found products into a human-readable context block for Ollama.
   */
  formatProductsForPrompt(products: ProductResult[]): string {
    if (products.length === 0) {
      return 'No matching products found in the catalog for this query.';
    }

    const lines = products.map(p => {
      const availability = p.available ? '✅ In Stock' : '❌ Out of Stock';
      return `  • [${p.sku}] ${p.title} — Vendor: ${p.vendor} — Price: $${p.price.toFixed(2)} — ${availability}`;
    });

    return `Matching products from MAINFrame Custom Cables Store catalog:\n${lines.join('\n')}`;
  }
}
