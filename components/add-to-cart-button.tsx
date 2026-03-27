'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBagIcon, CircleNotchIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { addToCart } from './actions';

export default function AddToCartButton({ product }: { product: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const result = await addToCart(product._id || product.id);
      if (result.success) {
        toast.success(result.message);
        window.dispatchEvent(new Event('cart-updated'));
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button className="w-fit" onClick={handleAddToCart} disabled={isLoading}>
      {isLoading ? (
        <CircleNotchIcon className="mr-2 size-5 animate-spin" />
      ) : (
        <ShoppingBagIcon className="mr-2 size-5" />
      )}
      Add to Bag
    </Button>
  );
}
