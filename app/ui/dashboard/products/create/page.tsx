"use client";
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { fetcher } from '@/client/api-client';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

export default function ProductsPage() {
  const { data: products, error } = useSWR<Product[]>('/products', fetcher);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price)
        }),
      });

      if (response.ok) {
        // Refresh the product list
        mutate('/products');
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: ''
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (error) return <div className="text-red-500">Error loading products</div>;
  if (!products) return <div>Loading...</div>;
  if (!Array.isArray(products)) {
    console.error('Expected array but got:', products);
    return <div>Invalid data format</div>;
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Products</h1>
          </div>
            
          {/* Add Product Form */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add Product
              </button>
            </form>
          </div>

          {/* Products Table */}
          {/* ... (keep your existing table code) ... */}
        </div>
      </div>
    </div>
  );
}