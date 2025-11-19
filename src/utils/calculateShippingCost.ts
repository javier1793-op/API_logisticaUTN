interface ProductDetail {
  id: string;
  quantity: number;
  weight_kg: number;
  dimensions_cm: {
    width: number;
    height: number;
    length: number;
  };
}


export const calculateShippingCost = (products: ProductDetail[]): number => {
  
  // Calcular la cantidad total de artículos
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

  //  Definir un precio base simulado por artículo
  const BASE_PRICE_PER_ITEM = 500; 
  const IVA_RATE = 0.21; 

  // costo base
  const baseCost = totalQuantity * BASE_PRICE_PER_ITEM;

  // IVA
  const taxAmount = baseCost * IVA_RATE;

  // total
  const totalCost = baseCost + taxAmount;

  return parseFloat(totalCost.toFixed(2));
};