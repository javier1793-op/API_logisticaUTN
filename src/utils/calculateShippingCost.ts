export const calculateShippingCost = (
  transport_type: string,
  products: {
    quantity: number;
    weight: number;
    length: number;
    width: number;
    height: number;
  }[]
): number => {
  let baseRate = 0;

  switch (transport_type) {
    case 'air':
      baseRate = 10;
      break;
    case 'sea':
      baseRate = 5;
      break;
    case 'rail':
      baseRate = 7;
      break;
    case 'road':
      baseRate = 8;
      break;
  }

  const total = products.reduce((acc, item) => {
    const volume = item.length * item.width * item.height;
    const weightFactor = item.weight * 0.5;
    const itemCost = (volume * 0.01 + weightFactor) * item.quantity;
    return acc + itemCost;
  }, 0);

  return Math.round(total * baseRate * 100) / 100;
};