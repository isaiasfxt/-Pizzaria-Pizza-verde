/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from './types.ts';

export const COLORS = {
  primary: '#00A86B',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#F5F5F5',
};

export const PIZZARIA_CONFIG = {
  name: 'Pizza Verde',
  phone: '5511999999999', // Exemplo de número
  deliveryFee: 5.00,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Calabresa Tradicional',
    description: 'Molho de tomate pelado, mussarela, calabresa fatiada, cebola e orégano.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop',
    category: 'pizzas_tradicionais',
    sizes: ['P', 'M', 'G'],
    extras: [
      { name: 'Borda Recheada Catupiry', price: 10.00 },
      { name: 'Borda Recheada Cheddar', price: 10.00 },
      { name: 'Extra Queijo', price: 5.00 },
    ],
  },
  {
    id: 'p2',
    name: 'Mussarela',
    description: 'Molho de tomate, mussarela e orégano de alta qualidade.',
    price: 40.00,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800&auto=format&fit=crop',
    category: 'pizzas_tradicionais',
    sizes: ['P', 'M', 'G'],
    extras: [
      { name: 'Borda Recheada Catupiry', price: 10.00 },
    ],
  },
  {
    id: 'p3',
    name: 'Portuguesa Especial',
    description: 'Mussarela, presunto, ovos, cebola, ervilha e palmito.',
    price: 55.00,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
    category: 'pizzas_especiais',
    sizes: ['P', 'M', 'G'],
    extras: [
      { name: 'Borda Recheada Catupiry', price: 12.00 },
    ],
  },
  {
    id: 'p4',
    name: 'Coca-Cola 2L',
    description: 'Garrafa pet de 2 litros gelada.',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&auto=format&fit=crop',
    category: 'bebidas',
  },
  {
    id: 'p5',
    name: 'Suco de Laranja 500ml',
    description: 'Suco natural feito na hora.',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1621506289937-4c44a0e235d6?w=800&auto=format&fit=crop',
    category: 'bebidas',
  },
  {
    id: 'c1',
    name: 'Combo Família 1',
    description: '1 Pizza G Calabresa + 1 Pizza G Mussarela + Coca 2L.',
    price: 95.00,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&auto=format&fit=crop',
    category: 'combos',
  },
];
