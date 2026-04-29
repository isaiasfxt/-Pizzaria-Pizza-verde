/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'pizzas_tradicionais' | 'pizzas_especiais' | 'bebidas' | 'combos';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  sizes?: string[];
  extras?: { name: string; price: number }[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  extras?: { name: string; price: number }[];
  observation?: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'Money' | 'Pix' | 'Card';
  items: CartItem[];
  total: number;
  timestamp: string;
}
