// Calcula una fecha estimada 
export const calculateDeliveryDate = (transportMethod: string): Date => {
    const deliveryDate = new Date();
    let daysToAdd: number;

    switch (transportMethod.toLowerCase()) {
        case 'express':
        case 'air':
            daysToAdd = 2; // Envío Rápido
            break;
        case 'standard':
        case 'road':
        default:
            daysToAdd = 5; // Envío Estándar/Terrestre
            break;
    }

    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    return deliveryDate;
};

// Mapea la entrada del usuario al valor exacto del ENUM de la DB
export const mapTransportTypeToEnum = (method: string): string => {
    switch (method.toLowerCase()) {
        case 'express':
            return 'air'; 
        case 'standard':
        default:
            return 'road'; 
    }
};

import axios from 'axios';
import  ProductItem  from '../models/ProductItem'; 

// Definición de las estructuras esperadas
interface ProductOrderInput {
    id: number;
    quantity: number;
}

interface StockProductDetails {
    id: number;
    name: string;
    weight: number;
    length: number;
    width: number;
    height: number;
}

/*
export const fetchDetailedProducts = async (productsFromOrder: ProductOrderInput[]): Promise<any[]> => {
    
    const stockApiUrl = process.env.STOCK_API_URL || 'http://localhost:4001';
    
    
    const detailedProducts = await Promise.all(
        productsFromOrder.map(async (p) => {
            
            try {
                
                const response = await axios.get<StockProductDetails>(`${stockApiUrl}/api/stock/product/${p.id}`);
                const stockData = response.data;

                
                return {
                    id: p.id,
                    quantity: p.quantity,
                    name: stockData.name,
                    weight: stockData.weight,
                    length: stockData.length,
                    width: stockData.width,
                    height: stockData.height,
                };
            } catch (error) {
                throw new Error(`Error al obtener detalles del Producto ID ${p.id} desde Stock.`);
            }
        })
    );

    return detailedProducts;
};*/

export const fetchDetailedProducts = async (productsFromOrder: ProductOrderInput[]): Promise<any[]> => {
    
   
    return Promise.resolve(productsFromOrder.map(p => ({
        id: p.id,
        quantity: p.quantity,
        name: `Producto Simulado ${p.id}`,
        weight: 1.5, 
        length: 20,
        width: 15,
        height: 10,
    })));
};