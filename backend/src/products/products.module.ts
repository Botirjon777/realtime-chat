import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product], 'products')],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
