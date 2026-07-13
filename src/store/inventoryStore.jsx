import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

const InventoryContext = createContext();

const DEFAULT_CARS = [
  { id: "hilux", name: "HILUX REVO", desc: "Toyota Hilux Revo 2021", specs: "2.8L Prerunner", price: "₹ 30,00,000", scale: 1.2 },
  { id: "fortuner", name: "FORTUNER", desc: "Toyota Fortuner 2021", specs: "2.8L Diesel | 201 BHP", price: "₹ 35,50,000", scale: 1.2 },
  { id: "corolla", name: "COROLLA", desc: "Toyota Corolla e170", specs: "1.8L Hybrid | 121 BHP", price: "₹ 18,20,000", scale: 1.0 },
  { id: "land-cruiser", name: "LAND CRUISER", desc: "Toyota Land Cruiser LC300", specs: "3.3L Twin-Turbo V6", price: "₹ 2,10,00,000", scale: 1.0 },
  { id: "supra", name: "GR SUPRA", desc: "Toyota GR Supra", specs: "3.0L Turbo Inline-6", price: "₹ 85,00,000", scale: 1.1 }
];

export function InventoryProvider({ children }) {
  const [cars, setCars] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadInventory() {
      try {
        const storedCars = await localforage.getItem('custom_cars');
        if (storedCars && Array.isArray(storedCars)) {
          setCars([...DEFAULT_CARS, ...storedCars]);
        } else {
          setCars([...DEFAULT_CARS]);
        }
      } catch (err) {
        console.error("Failed to load inventory:", err);
        setCars([...DEFAULT_CARS]);
      }
      setIsReady(true);
    }
    loadInventory();
  }, []);

  const addCar = async (newCar) => {
    try {
      const storedCars = (await localforage.getItem('custom_cars')) || [];
      const updatedCustom = [...storedCars, newCar];
      await localforage.setItem('custom_cars', updatedCustom);
      setCars([...DEFAULT_CARS, ...updatedCustom]);
    } catch (err) {
      console.error("Failed to add car:", err);
    }
  };

  return (
    <InventoryContext.Provider value={{ cars, addCar, isReady }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
