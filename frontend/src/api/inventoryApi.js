const API_BASE_URL = 'http://localhost:8000'; // FastAPI backend

/**
 * Fetches the inventory list.
 * For now, this still returns a mock list, but in a real scenario
 * it would fetch the full inventory from the database.
 */
export const fetchInventory = async () => {
  try {
    // We could fetch from /api/cars later. Using mock data for display.
    return [
      { id: "hilux", name: "HILUX REVO", desc: "Toyota Hilux Revo 2021", specs: "2.8L Prerunner", price: "₹ 30,00,000", scale: 1.2, frames: [] },
      { id: "fortuner", name: "FORTUNER", desc: "Toyota Fortuner 2021", specs: "2.8L Diesel | 201 BHP", price: "₹ 35,50,000", scale: 1.2, frames: [] },
      { id: "corolla", name: "COROLLA", desc: "Toyota Corolla e170", specs: "1.8L Hybrid | 121 BHP", price: "₹ 18,20,000", scale: 1.0, frames: [] },
      { id: "land-cruiser", name: "LAND CRUISER", desc: "Toyota Land Cruiser LC300", specs: "3.3L Twin-Turbo V6", price: "₹ 2,10,00,000", scale: 1.0, frames: [] },
      { id: "supra", name: "GR SUPRA", desc: "Toyota GR Supra", specs: "3.0L Turbo Inline-6", price: "₹ 85,00,000", scale: 1.1, frames: [] }
    ];
  } catch (err) {
    console.error("Failed to load inventory:", err);
    return [];
  }
};

/**
 * Fetches car models for the dropdown.
 */
export const fetchModels = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/models`);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    return data.models;
  } catch (err) {
    console.error("Failed to load models:", err);
    return [];
  }
}

/**
 * Publishes a new car to the inventory by calling the FastAPI backend.
 * @param {Object} newCar - The car object containing details and 360 frames.
 */
export const publishCar = async (newCar) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCar)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to publish car");
    }
    
    const data = await res.json();
    return data.car;
  } catch (err) {
    console.error("Failed to publish car to API:", err);
    throw err;
  }
};
