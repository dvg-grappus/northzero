
import React from 'react';
import { StylescapesProvider as Provider } from '@/contexts/StylescapesContext';

export const StylescapesProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <Provider>
      {children}
    </Provider>
  );
};

export default StylescapesProvider;
