import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsService } from '../products/products.service';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollamaUrl: string;
  private readonly model: string;
  private readonly storeName: string;
  private readonly botName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly productsService: ProductsService,
  ) {
    this.ollamaUrl =
      this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    this.model =
      this.configService.get<string>('OLLAMA_MODEL') || 'qwen2.5:3b';
    this.storeName =
      this.configService.get<string>('STORE_NAME') || 'MAINFrame Custom Cables Store';
    this.botName =
      this.configService.get<string>('BOT_NAME') || 'Mainframe AI';
  }

  buildSystemPrompt(topic?: string, productContext?: string): string {
    return `You are ${this.botName}, the AI support assistant for "${this.storeName}".
We specialize in custom cables, cable sleeving, connectors, power supply cables, and PC modding accessories.

RULES:
1. ONLY answer questions related to "${this.storeName}" — cables, products, orders, shipping, returns.
2. If a customer asks about unrelated topics, politely redirect to our products.
3. Never recommend other stores or brands.
4. Be concise and friendly. Keep responses short and to the point.
5. When recommending products, include SKU, price, and availability.
6. If out of stock, suggest in-stock alternatives if available.
7. If no match found, say so and offer to connect with a human operator.
8. If customer asks for a human, tell them to click "Talk to operator".
${topic ? `9. Customer topic: "${topic}".` : ''}

${productContext
  ? `LIVE PRODUCT DATA FROM OUR DATABASE:\n${productContext}\n\nIMPORTANT: Use ONLY the products listed above. Do not invent SKUs, prices, or product names.`
  : 'No product matches yet. Ask what type of cable or product they need.'}`;
  }

  /**
   * Streaming chat — calls Ollama with stream:true and invokes onChunk for each token.
   * Returns the full assembled reply when done.
   */
  async chatStream(
    messages: OllamaMessage[],
    systemPrompt: string,
    onChunk: (chunk: string) => void,
  ): Promise<string> {
    const url = `${this.ollamaUrl}/api/chat`;
    const payload = {
      model: this.model,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120_000),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Ollama ${response.status}: ${await response.text()}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // Ollama streams NDJSON — one JSON object per line
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // keep incomplete last line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line) as {
              message?: { content?: string };
              done?: boolean;
              error?: string;
            };
            if (data.error) throw new Error(data.error);
            const chunk = data.message?.content ?? '';
            if (chunk) {
              fullText += chunk;
              onChunk(chunk);
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }

      return fullText.trim() || 'I am here to help!';
    } catch (err: any) {
      this.logger.error(`Ollama stream failed: ${err.message}`);
      const fallback = `I'm having trouble responding right now. Please click "Talk to operator" to reach our support team.`;
      onChunk(fallback);
      return fallback;
    }
  }

  /**
   * Search products DB → inject context → stream reply.
   * onStep fires at each named stage so the gateway can relay progress to the client.
   */
  async chatWithProductContextStream(
    userMessage: string,
    history: OllamaMessage[],
    topic: string | undefined,
    onChunk: (chunk: string) => void,
    onStep?: (step: number, text: string) => void,
  ): Promise<string> {
    onStep?.(1, 'Analyzing your question…');

    // Limit to 5 products to keep the prompt compact → faster generation
    const products = await this.productsService.searchProducts(userMessage);
    const topProducts = products.slice(0, 5);

    onStep?.(2, `Searching our product catalog${topProducts.length ? ` — found ${topProducts.length} match${topProducts.length > 1 ? 'es' : ''}` : ' — no exact matches'}…`);

    const productContext = this.productsService.formatProductsForPrompt(topProducts);
    const systemPrompt = this.buildSystemPrompt(topic, productContext);
    const messages: OllamaMessage[] = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    this.logger.debug(`Product search for "${userMessage}" → ${topProducts.length} results — streaming reply`);
    return this.chatStream(messages, systemPrompt, onChunk);
  }
}
