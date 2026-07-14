const API_URL = import.meta.env.VITE_API_URL;

export const fetchInventory = async () => {
  try {
    const res = await fetch(`${API_URL}/api/inventory`);
    if (!res.ok) throw new Error('Failed to fetch inventory');
    const rawData = await res.json();
    const items = Array.isArray(rawData) ? rawData : rawData.items || [];
    
    // Map backend format to frontend UI format
    return items.map(car => ({
      id: car.id,
      name: car.model || 'Unknown Model',
      desc: car.body_type ? `${car.body_type} ${car.year || ''}` : 'Car',
      specs: car.variant || 'Standard',
      price: car.price ? `₹ ${car.price}` : 'Price on request',
      scale: 1.0,
      status: car.status || 'draft',
      frames: car.frames || null
    }));
  } catch (err) {
    console.error("Failed to fetch inventory:", err);
    return [];
  }
};

export const createListing = async (carDetails) => {
  const payload = {
    name: carDetails.name || 'Unknown',
    desc: 'Car',
    specs: carDetails.specs || '',
    price: carDetails.price || ''
  };

  const res = await fetch(`${API_URL}/api/cars`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error('Failed to create listing');
  }
  return await res.json();
};

export const publishListing = async (listingId) => {
  const res = await fetch(`${API_URL}/api/cars/${listingId}/publish`, {
    method: 'POST'
  });
  
  if (!res.ok) {
    throw new Error('Failed to publish listing');
  }
  return await res.json();
};
