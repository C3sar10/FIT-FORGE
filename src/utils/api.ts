// utils/api.ts
export async function getActivePlan(): Promise<any | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`, {
      method: "GET",
      credentials: "include", // sends cookies if using them
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`, 
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Failed to fetch active plan:", err);
    return null;
  }
}

// utils/api.ts
export async function createPlan(planData: any) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(planData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create plan");
    }

    return await res.json();
  } catch (err) {
    console.error("Failed to create plan:", err);
    throw err;
  }
}

export async function deletePlan() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to delete plan");
    }

    return await res.json();
  } catch (err) {
    console.error("Failed to delete plan:", err);
    throw err;
  }
}