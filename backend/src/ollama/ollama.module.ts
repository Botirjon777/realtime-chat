import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [OllamaService],
  exports: [OllamaService],
})
export class OllamaModule {}
