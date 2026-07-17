const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const optimizeCloudinaryUrl = (url) => {
  if (typeof url !== 'string' || !url.includes('cloudinary.com/') || url.includes('e_trim')) return url;
  if (url.match(/\/v\d+\//)) return url.replace(/\/(v\d+\/)/, '/e_trim/$1');
  return url.replace('/upload/', '/upload/e_trim/');
};

/**
 * Fetches the inventory list.
 * For now, this still returns a mock list, but in a real scenario
 * it would fetch the full inventory from the database.
 */
export const fetchInventory = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/inventory`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error("Failed to fetch inventory");
    const data = await res.json();
    return data.map(car => ({
      ...car,
      frames: (car.frames || []).map(optimizeCloudinaryUrl)
    }));
    } catch (err) {
      console.error("Failed to load inventory:", err);
      return [];
    }
  };
  
  export const fetchFeaturedCars = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/featured`, { next: { revalidate: 30 } });
      if (!res.ok) throw new Error("Failed to fetch featured inventory");
      const data = await res.json();
      return data.map(car => ({
        ...car,
        frames: (car.frames || []).map(optimizeCloudinaryUrl)
      }));
    } catch (err) {
      console.error("Failed to load featured inventory:", err);
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
export const initCar = async (newCar) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCar),
    });
    if (!res.ok) throw new Error("Failed to initialize car");
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateCar = async (carId, updatedCar) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cars/${carId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCar),
    });
    if (!res.ok) throw new Error("Failed to update car");
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteCar = async (carId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/inventory/${carId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete car");
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const toggleFeaturedCar = async (carId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/inventory/${carId}/featured`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to toggle featured status");
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const uploadFrames = async (carId, formData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cars/${carId}/frames`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload frames");
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const publishCar = async (carId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cars/${carId}/publish`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to publish car");
    return await res.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Uploads a bulk models Excel/CSV file to the FastAPI backend.
 */
export const uploadBulkModels = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE_URL}/api/models/bulk`, {
      method: "POST",
      body: formData
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to bulk upload models");
    }
    
    return await res.json();
  } catch (err) {
    console.error("Failed to upload bulk models:", err);
    throw err;
  }
};

/**
 * Fetches CMS dashboard metrics and recent activity.
 */
export const fetchCmsDashboard = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/dashboard`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error("Failed to fetch dashboard data");
    return await res.json();
  } catch (err) {
    console.error("Failed to load dashboard:", err);
    return {
      stats: { totalInventory: 0, pendingCerts: 0, newEnquiries: 0, monthlySales: 0 },
      recentActivity: [],
      tasks: []
    };
  }
};

/**
 * Fetches CMS inventory with all details for management.
 */
export const fetchCmsInventory = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/inventory`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error("Failed to fetch CMS inventory");
    const data = await res.json();
    return data.map(car => ({
      ...car,
      frames: (car.frames || []).map(optimizeCloudinaryUrl)
    }));
  } catch (err) {
    console.error("Failed to load CMS inventory:", err);
    return [];
  }
};

export const fetchCmsEnquiries = async (leadType) => {
  try {
    const url = leadType
      ? `${API_BASE_URL}/api/cms/enquiries?lead_type=${leadType}`
      : `${API_BASE_URL}/api/cms/enquiries`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch enquiries");
    return await res.json();
  } catch (err) {
    console.error("Failed to load enquiries:", err);
    return [];
  }
};

export const createEnquiry = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/enquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create enquiry");
    return await res.json();
  } catch (err) {
    console.error("Failed to create enquiry:", err);
    throw err;
  }
};

export const fetchCmsCertifications = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/certifications`, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error("Failed to fetch certifications");
    return await res.json();
  } catch (err) {
    console.error("Failed to load certifications:", err);
    return [];
  }
};

export const createCertification = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/certifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create certification");
    return await res.json();
  } catch (err) {
    console.error("Failed to create certification:", err);
    throw err;
  }
};

export const updateCertification = async (certId, payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/certifications/${certId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update certification");
    return await res.json();
  } catch (err) {
    console.error("Failed to update certification:", err);
    throw err;
  }
};

export const deleteEnquiry = async (enquiryId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cms/enquiries/${enquiryId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete enquiry");
    return await res.json();
  } catch (err) {
    console.error("Failed to delete enquiry:", err);
    throw err;
  }
};

export const fetchFormSchema = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/form-schema`);
    if (!res.ok) throw new Error("Failed to fetch form schema");
    return await res.json();
  } catch (err) {
    console.error(err);
    return { customFields: [], competitors: [], features: [] };
  }
};

export const updateFormSchema = async (schema) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/form-schema`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schema)
    });
    if (!res.ok) throw new Error("Failed to update form schema");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addSingleModel = async (modelData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelData)
    });
    if (!res.ok) throw new Error("Failed to add model");
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

