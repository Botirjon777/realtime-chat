import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  constructor(private readonly configService: ConfigService) {
    this.ollamaUrl =
      this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    this.model =
      this.configService.get<string>('OLLAMA_MODEL') || 'llama3:8b';
    this.storeName =
      this.configService.get<string>('STORE_NAME') || 'Our Store';
  }

  buildSystemPrompt(topic?: string): string {
    return `You are a helpful and friendly AI support assistant for "${this.storeName}".
Your role is to assist customers with questions about our store, products, orders, services, and policies.

STRICT RULES:
1. ONLY answer questions related to "${this.storeName}" — our products, orders, shipping, returns, and support topics.
2. If a customer asks about anything unrelated to our store (e.g. competitors, general knowledge, coding, politics, etc.), politely decline and redirect them to store-related topics.
3. Never mention, recommend, or compare other stores or brands.
4. Be concise, polite, and professional. Keep responses short and to the point.
5. If you do not know a specific product detail or order status, say so honestly and offer to connect the customer with a human operator.
6. If the customer expresses frustration or asks for a human, acknowledge their request and let them know they can click "Talk to operator" in the chat widget.
${topic ? `7. The customer has indicated their topic is: "${topic}". Tailor your greeting and responses to this topic.` : ''}

Start the conversation warmly and ask how you can help.`;
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
        signal: AbortSignal.timeout(60_000), // 60 s timeout
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
      return "I'm having trouble responding right now. You can click \"Talk to operator\" to reach a human support agent.";
    }
  }

  async getGreeting(clientName?: string, topic?: string): Promise<string> {
    const userName = clientName ? `, ${clientName}` : '';
    const userMessages: OllamaMessage[] = [
      {
        role: 'user',
        content: `Hello, I need help${topic ? ` with: ${topic}` : ''}.`,
      },
    ];
    return this.chat(userMessages, this.buildSystemPrompt(topic));
  }
}
