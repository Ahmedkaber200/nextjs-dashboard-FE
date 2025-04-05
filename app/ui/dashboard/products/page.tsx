"use client";
import useSWR from 'swr';
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
            <Link href="/dashboard/products/create">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Create Product
              </button>
            </Link>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {products.map((product) => (
              <div
                key={product.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                  </div>
                  <p className="text-green-600 font-medium">
                    ${product.price}
                  </p>
                </div>
                <div className="pt-4">
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Description
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Price
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <p>{product.name}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="line-clamp-2">{product.description}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium">
                    ${product.price}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link 
                        href={`/product/edit/${product.id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {/* Add delete functionality */}}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}