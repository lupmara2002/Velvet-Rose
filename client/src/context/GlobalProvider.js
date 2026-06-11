import React from 'react';
import { CartProvider } from './CartContext';
import { OffersProvider } from './OffersContext';

const GlobalProvider = ({ children }) => {
  return (
    <OffersProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </OffersProvider>
  );
};

export default GlobalProvider;
