import localforage from 'localforage';

const DEFAULT_CARS = [
  { id: "hilux", name: "HILUX REVO", desc: "Toyota Hilux Revo 2021", specs: "2.8L Prerunner", price: "₹ 30,00,000", scale: 1.2 },
  { id: "fortuner", name: "FORTUNER", desc: "Toyota Fortuner 2021", specs: "2.8L Diesel | 201 BHP", price: "₹ 35,50,000", scale: 1.2 },
  { id: "corolla", name: "COROLLA", desc: "Toyota Corolla e170", specs: "1.8L Hybrid | 121 BHP", price: "₹ 18,20,000", scale: 1.0 },
  { id: "land-cruiser", name: "LAND CRUISER", desc: "Toyota Land Cruiser LC300", specs: "3.3L Twin-Turbo V6", price: "₹ 2,10,00,000", scale: 1.0 },
  { id: "supra", name: "GR SUPRA", desc: "Toyota GR Supra", specs: "3.0L Turbo Inline-6", price: "₹ 85,00,000", scale: 1.1 }
];

/**
 * Fetches the inventory list.
 * Currently uses localforage to mock a database response.
 */
export const fetchInventory = async () => {
  try {
    const storedCars = await localforage.getItem('custom_cars');
    if (storedCars && Array.isArray(storedCars)) {
      return [...DEFAULT_CARS, ...storedCars];
    }
    return [...DEFAULT_CARS];
  } catch (err) {
    console.error("Failed to load inventory from local DB:", err);
    return [...DEFAULT_CARS];
  }
};

/**
 * Publishes a new car to the inventory.
 * Currently uses localforage to mock saving to a database.
 * @param {Object} newCar - The car object containing details and 360 frames.
 */
export const publishCar = async (newCar) => {
  try {
    const storedCars = (await localforage.getItem('custom_cars')) || [];
    const updatedCustom = [...storedCars, newCar];
    await localforage.setItem('custom_cars', updatedCustom);
    return newCar;
  } catch (err) {
    console.error("Failed to publish car to local DB:", err);
    throw new Error("Failed to publish car");
  }
};
