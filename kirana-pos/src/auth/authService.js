import {
  saveUser,
  getUserByUsername,
  saveSession,
  clearSession,
  getSession,
  saveShopSettings,
  getShopSettings
} from "../services/db";

import { ROLES } from "./roles";
import { logAudit } from "../services/auditLog";
import { API_BASE } from "../config";


// Simple hashing for local auth
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* -------------------------------------------------------
   Try to obtain a backend JWT and store it in settings.
   Works for BOTH new and old accounts.
   Fails silently if backend is offline.
------------------------------------------------------- */
async function tryBackendLogin(username, password) {
  try {
    if (!navigator.onLine || !API_BASE) return;

    const settings = await getShopSettings();
    const ownerPhone = settings?.ownerPhone || username;
    if (!ownerPhone) return;

    let loginRes = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerphone: ownerPhone, password }),
      signal: AbortSignal.timeout(5000)
    });

    if (!loginRes.ok && loginRes.status === 400) {
      const user = await getUserByUsername(username);

      const regRes = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopname: (user?.name || username) + "'s Shop",
          ownername: user?.name || username,
          ownerphone: ownerPhone,
          password
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (!regRes.ok && regRes.status !== 409) {
        console.warn("[Auth] Backend registration failed:", regRes.status);
        return;
      }

      loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerphone: ownerPhone, password }),
        signal: AbortSignal.timeout(5000)
      });
    }

    if (!loginRes.ok) return;

    const data = await loginRes.json();

    if (data.token) {
      const shopId = data.shop?.id || null;
      await saveShopSettings({
        ...(settings || {}),
        ownerPhone,
        backendToken: data.token,
        backendShopId: shopId
      });
      console.log("[Auth] Backend token obtained - sync enabled");
    }
  } catch (e) {
    console.warn("[Auth] Backend login failed (offline?):", e.message);
  }
}

export async function createOwnerAccount({
  name,
  username,
  password,
  phone,
  email,
  shopName
}) {
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // 1. Try to register on backend FIRST to get the real Shop ID
  let shopId = null;
  let backendToken = null;

  if (navigator.onLine && API_BASE) {
    try {
      const ownerPhone = phone || username;
      const regRes = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopname: shopName || `${name}'s Shop`,
          ownername: name,
          ownerphone: ownerPhone,
          owneremail: email || null,
          password
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (regRes.ok || regRes.status === 409) {
        const loginRes = await fetch(`${API_BASE}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ownerphone: ownerPhone, password }),
          signal: AbortSignal.timeout(5000)
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          shopId = data.shop?.id;
          backendToken = data.token;
        }
      }
    } catch (e) {
      console.warn("Backend registration skipped (offline):", e.message);
    }
  }

  // 2. Set the DB namespace BEFORE saving anything!
  if (shopId) {
    localStorage.setItem("kirana_db_name", `kirana_pos_${shopId}`);
  } else {
    // If offline, generate a random offline namespace so they don't share
    const offlineId = crypto.randomUUID().split('-')[0];
    localStorage.setItem("kirana_db_name", `kirana_pos_offline_${offlineId}`);
  }

  // 3. Now we can safely check if user exists in this isolated DB
  const existing = await getUserByUsername(username);
  if (existing) {
    throw new Error("An account with this phone number already exists");
  }

  // 4. Save the user locally into the isolated DB
  const hashed = await hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    name,
    username,
    password: hashed,
    role: ROLES.OWNER,
    email: email || null,
    createdAt: Date.now()
  };

  await saveUser(user);

  // 5. Save settings into the isolated DB
  await saveShopSettings({
    ownerPhone: phone || username,
    ownerName: name,
    shopName: shopName || `${name}'s Shop`,
    ownerEmail: email || null,
    backendToken: backendToken || null,
    backendShopId: shopId || null
  });
}

// tryBackendRegisterAndLogin logic merged into createOwnerAccount

export async function login(username, password) {
  let backendData = null;

  // If user is logging into an existing cloud account on a new device,
  // we must get the shopId FIRST to switch to their isolated namespace.
  if (navigator.onLine && API_BASE) {
    try {
      const loginRes = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerphone: username, password }),
        signal: AbortSignal.timeout(5000)
      });
      if (loginRes.ok) {
        backendData = await loginRes.json();
        if (backendData.shop?.id) {
          localStorage.setItem("kirana_db_name", `kirana_pos_${backendData.shop.id}`);
        }
      }
    } catch (e) {
      console.warn("Backend login check failed:", e.message);
    }
  }

  let user = await getUserByUsername(username);

  // If still not found locally but backend succeeded, we must recreate the local user
  if (!user && backendData) {
    try {
      const hashed = await hashPassword(password);
      const ownerName = backendData.shop?.owner_name || "Shop Owner";
      
      user = {
        id: crypto.randomUUID(),
        name: ownerName,
        username,
        password: hashed,
        role: ROLES.OWNER,
        createdAt: Date.now()
      };
      await saveUser(user);
      
      await saveShopSettings({
        ownerPhone: username,
        ownerName: ownerName,
        shopName: backendData.shop?.shop_name || `${ownerName}'s Shop`,
        backendToken: backendData.token || null,
        backendShopId: backendData.shop?.id || null
      });
    } catch(e) {}
  }

  if (!user) {
    throw new Error("User not found locally or on cloud");
  }

  const hashed = await hashPassword(password);
  if (hashed !== user.password) {
    throw new Error("Invalid password");
  }

  await saveSession({
    id: "current",
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      upiId: user.upiId || null
    },
    loginTime: Date.now()
  });

  await logAudit({
    action: "USER_LOGIN",
    module: "auth",
    metadata: { username }
  });

  tryBackendLogin(username, password);

  return user;
}

export async function logout() {
  // Clear backend token from settings so the next account gets a fresh token
  try {
    const current = await getShopSettings();
    if (current) {
      await saveShopSettings({
        ...current,
        backendToken: null,
        backendShopId: null,
        backendPhone: null
      });
    }
  } catch (e) {
    console.warn("[Auth] Could not clear backend token on logout:", e.message);
  }
  // Remember this shop ID so customers logging in on the same device don't need a special URL
  const dbName = localStorage.getItem("kirana_db_name");
  if (dbName && dbName.startsWith("kirana_pos_")) {
    localStorage.setItem("last_shop_db", dbName);
  }
  localStorage.removeItem("kirana_db_name");
  await clearSession();
  sessionStorage.removeItem("customer_session");
  sessionStorage.removeItem("session");
  location.hash = "";
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}