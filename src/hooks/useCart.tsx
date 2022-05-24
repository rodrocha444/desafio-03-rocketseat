import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}
interface CartItemsAmount {
  [key: number]: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });


  const addProduct = async (productId: number) => {
    try {
      const isAdded = cart.some(product => product.id === productId)
      const itemAmount = cart.find(product => product.id === productId)!
      const produto = await (await api.get('products/' + productId)).data as Product
      const estoque = await (await api.get('stock/' + productId)).data as Stock
      let newCart = [] as Product[];

      if (isAdded) {
        if (itemAmount.amount < estoque.amount) {
          newCart = cart.map(product => {
            if (product.id === productId) product.amount += 1
            return product
          })
          console.log(newCart)
        }
        else{
          throw toast.error('Quantidade solicitada fora de estoque');
        }
      }
      else if (estoque.amount > 0) {
        produto.amount=1;
        newCart = [
          ...cart,
          produto
        ]
        console.log(newCart)
      }
      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na adição do produto');
    }

  };

  const removeProduct = (productId: number) => {
    try {
      if(cart.some(e=>e.id === productId)){
        const cartUpdated = cart.filter(product => product.id !== productId)
  
        setCart(cartUpdated)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdated))
      }
      else{
        throw toast.error('Erro na remoção do produto');
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productStock = await (await api.get('/stock/' + productId)).data
      if (!(amount <= 0) && (amount>=1)) {
        if (amount <= productStock.amount) {
          const novoProduto = cart.map(product => {
            if (product.id === productId) {
              product.amount = amount;
              return product;
            }
            return product;
          })

          setCart(novoProduto)
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(novoProduto))
        }
        else {
          throw toast.error('Quantidade solicitada fora de estoque');
        }
      }
      else {
        //removeProduct(productId)
      }


    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
