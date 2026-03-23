function getApiUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
  if (configuredUrl) return configuredUrl;

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000/api`;
  }

  return "http://localhost:5000/api";
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      cache: "no-store"
    });
  } catch (error) {
    throw new Error(
      "Unable to reach the support server. Make sure the backend is running on port 5000 and the API URL is correct."
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export function sendChatMessage(payload) {
  return request("/chat/message", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function fetchTickets(token, filters = {}) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  const query = params.toString() ? `?${params.toString()}` : "";

  return request(`/tickets${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function assignTicket(token, ticketId, assignedAgent) {
  return request(`/tickets/${ticketId}/assign`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ assignedAgent })
  });
}

export function resolveTicket(token, ticketId) {
  return request(`/tickets/${ticketId}/resolve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
