"use client";
import useSWR from 'swr';
// import axios from 'axios';
import Link from 'next/link';
// File: products/page.tsx
import { fetcher } from '@/client/api-client'; // Named import

// 1. Product interface define karein
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

export default function ProductsPage() {
  // 3. SWR ko proper types ke saath use karein
const { data: products, error } = useSWR<Product[]>('/products', fetcher); // Notice the leading /

  // 4. Loading aur error states handle karein
  if (error) return <div>Error loading products</div>;
  if (!products) return <div>Loading...</div>;
  
  // 5. Final check - products array hai ya nahi
  if (!Array.isArray(products)) {
    console.error('Expected array but got:', products);
    return <div>Invalid data format</div>;
  }

  return (
    <div>
      <h1>Products</h1>
      <Link href="/product/create">
        <button>Create Product</button>
      </Link>
      
      {/* 6. Safe mapping - TypeScript ko pata hai products array hai */}
      <ul>
        {products.map(product => (
          <li key={product.id}>
            {product.name} - {product.description} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}