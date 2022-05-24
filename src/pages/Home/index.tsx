import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();


  useEffect(() => {
    async function loadProducts() {
      const result = await (await api.get('/products')).data
      const data = result.map((value: Product) => {
        return (
          {
            ...value,
            priceFormatted: formatPrice(value.price),
          }
        )
      })
      setProducts(data)
    }
    
    
    loadProducts();
  }, []);

  const cartItemsAmount = cart && cart.reduce((sumAmount, product) => {
    return ({ ...sumAmount, [product.id]: product.amount })
  }, {} as CartItemsAmount)

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  return (
    <ProductList>
      {
        products.map(({ id, image, priceFormatted, title }) => {
          return (
            <li key={id}>
              <img src={image} alt={title} />
              <strong>{title}</strong>
              <span>{priceFormatted}</span>
              <button
                type="button"
                data-testid="add-product-button"
                onClick={() => handleAddProduct(id)}
              >
                <div data-testid="cart-product-quantity">
                  <MdAddShoppingCart size={16} color="#FFF" />
                  {cartItemsAmount[id] || 0} 
                </div>

                <span>ADICIONAR AO CARRINHO</span>
              </button>
            </li>
          )
        })
      }

    </ProductList>
  );
};

export default Home;
