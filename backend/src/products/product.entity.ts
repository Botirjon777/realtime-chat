import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products', schema: 'dbo', database: 'test' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  vendor: string;

  @Column({ type: 'float', nullable: true })
  price: number;

  @Column({ type: 'bit', default: 0 })
  sellable: boolean;

  @Column({ nullable: true })
  slug: string;
}
