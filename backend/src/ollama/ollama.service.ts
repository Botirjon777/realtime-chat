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
      this.configService.get<string>('OLLAMA_MODEL') || 'llama3:8b';
    this.storeName =
      this.configService.get<string>('STORE_NAME') || 'MAINFrame Custom Cables Store';
    this.botName =
      this.configService.get<string>('BOT_NAME') || 'Mainframe AI';
  }

  buildSystemPrompt(topic?: string, productContext?: string): string {
    return `You are ${this.botName}, the AI support assistant for "${this.storeName}".
We specialize in custom cables, cable sleeving, connectors, power supply cables, and PC modding accessories.

STRICT RULES:
1. ONLY answer questions related to "${this.storeName}" — our cables, products, orders, shipping, returns, and support.
2. If a customer asks about anything unrelated to our store or cables (e.g. competitors, general tech questions, coding, etc.), politely decline and offer to help with our products.
3. Never recommend or mention other stores or brands outside our catalog.
4. Be concise, enthusiastic, and professional. Keep responses clear and to the point.
5. When recommending products, always include the SKU, price, and availability status.
6. If a product is out of stock, suggest similar in-stock alternatives if available.
7. If you cannot find a matching product, say so honestly and offer to connect the customer with a human operator.
8. If the customer is frustrated or requests a human, tell them to click the "Talk to operator" button.
${topic ? `9. The customer's topic is: "${topic}". Tailor your response accordingly.` : ''}

${productContext ? `LIVE PRODUCT DATA FROM OUR DATABASE:\n${productContext}\n\nIMPORTANT: Use ONLY the products listed above when making recommendations. Do not invent product names, prices, or SKUs.` : 'No specific product matches found yet. Ask the customer what type of cable or product they need.'}`;
  }

  async chat(
    messages: OllamaMessage[],
    systemPrompt?: string,
  ): Promise<string> {
    const url = `${this.ollamaUrl}/api/chat`;

    const payload = {
      model: this.model,
      stream: false,
      messages: [
        {
          role: 'system',
          content: systemPrompt || this.buildSystemPrompt(),
        },
        ...messages,
      ],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(90_000), // 90 s timeout for larger models
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama returned ${response.status}: ${errText}`);
      }

      const data = (await response.json()) as {
        message?: { content?: string };
        error?: string;
      };

      if (data.error) throw new Error(`Ollama error: ${data.error}`);

      return data.message?.content?.trim() || 'I am here to help!';
    } catch (err: any) {
      this.logger.error(`Ollama chat failed: ${err.message}`);
      return `I'm having trouble responding right now. Please click "Talk to operator" to reach our support team.`;
    }
  }

  /**
   * Chat with product search — searches the DB first, then injects results as context.
   */
  async chatWithProductContext(
    userMessage: string,
    history: OllamaMessage[],
    topic?: string,
  ): Promise<string> {
    // Search products relevant to the user's message
    const products = await this.productsService.searchProducts(userMessage);
    const productContext = this.productsService.formatProductsForPrompt(products);

    const systemPrompt = this.buildSystemPrompt(topic, productContext);

    // Build full message list: history + current user message
    const messages: OllamaMessage[] = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    this.logger.debug(`Product search for "${userMessage}" found ${products.length} results`);

    return this.chat(messages, systemPrompt);
  }

  async getGreeting(clientName?: string, topic?: string): Promise<string> {
    const userMessages: OllamaMessage[] = [
      {
        role: 'user',
        content: `Hello${clientName ? `, I'm ${clientName}` : ''}. I need help${topic ? ` with: ${topic}` : ''}.`,
      },
    ];
    // Greeting — no product search needed yet, just a warm welcome
    return this.chat(userMessages, this.buildSystemPrompt(topic));
  }
}
