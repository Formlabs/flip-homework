# Tasks

---

## 1. Automatic status update for the order page (no manual refresh)

> 📊 **Complexity:** 🟡 Medium to 🔴 High (depending on solution)
> 🎯 **Focus:** Frontend or Fullstack (depending on solution)

### 👤 **Who/What/Why**
- **As a customer**, I want the order page to update automatically in near real-time so I always see the latest status without refreshing.

### 📋 **Background**
- Today, the order page likely fetches once on load and becomes stale. The printer mock can advance an order's state over time, and we want the UI to reflect changes as they happen.

### ✅ **Acceptance Criteria**
- ✔️ Given I've placed an order and I'm on `frontend/src/app/order/[id]/page.tsx`, when the order status changes on the backend, then the visible status updates within a few seconds without manual refresh.
- ✔️ If the network drops, the UI should retry and recover without a full page reload.
- ✔️ A subtle "Live"/"Updating…" indicator communicates background refresh.

---

## 2. Color the 3D model in the preview page

> 📊 **Complexity:** 🟢 Low to Medium  
> 🎯 **Focus:** Frontend

### 👤 **Who/What/Why**
- **As a shopper**, I want the STL preview to reflect the selected color so I can better visualize the printable before purchase.

### 📋 **Background**
- STLs usually don't include material color. The app already has a color concept in the backend (see recent migrations), and the STL viewer (`frontend/src/components/StlViewer.tsx`) renders the model.

### ✅ **Acceptance Criteria**
- ✔️ The 3D preview shows the printable in the currently selected color (e.g., red, green, blue) across printable and order pages.
- ✔️ Changing the color selection updates the model color immediately without reloading the page.
- ✔️ The chosen color is consistent with what's persisted/returned by the API for the printable/order.

---

## 3. Add objective plane and measurement display to the 3D preview

> 📊 **Complexity:** 🟡 Medium  
> 🎯 **Focus:** Frontend

### 👤 **Who/What/Why**
- **As a shopper**, I want a ground plane and size indicators in the 3D preview so I can understand the printable's real-world dimensions.

### 📋 **Background**
- Users struggle to interpret the scale of a floating model. A reference plane and simple dimensions improve spatial understanding.

### ✅ **Acceptance Criteria**
- ✔️ A neutral ground plane (or grid) appears beneath the model and respects model transform.
- ✔️ Visible extents (bounding box) with width/height/depth are shown in the UI (e.g., overlay text or 3D labels).
- ✔️ Measurements are derived from the STL geometry (in mm) and remain correct when the model is scaled.

---

## 4. Persist and serve actual printer progress

> 📊 **Complexity:** 🟡 Medium to 🔴 High
> 🎯 **Focus:** Fullstack

### 👤 **Who/What/Why**
- **As a customer**, I want to see granular print progress (e.g., 0–100%) so I know how far along my order is.

### 📋 **Background**
- The printer mock can simulate progress. Currently the API may only expose coarse statuses (e.g., QUEUED/PRINTING/DONE). Persisting and returning numeric progress enables richer UX and unlocks real-time updates.

### ✅ **Acceptance Criteria**
- ✔️ The backend stores progress updates associated with an order or print job.
- ✔️ An endpoint returns progress as a percentage and timestamp (e.g., GET `/api/orders/{id}/progress/`).
- ✔️ The frontend displays a progress bar on `frontend/src/app/order/[id]/page.tsx` that updates as progress changes.
- ✔️ Progress remains available across page reloads.

---

## 5. Big story: User-uploaded STL creates a new Printable

> 📊 **Complexity:** 🔴 High  
> 🎯 **Focus:** Fullstack

### 👤 **Who/What/Why**
- **As a maker**, I want to upload my own STL to create a Printable so I can order prints of my custom model.

### 📋 **Background**
- This ties together file uploads, backend persistence, and frontend discovery. It's a realistic flow for 3D print services.

### ✅ **Acceptance Criteria**
- ✔️ A new page in the frontend lets me upload an STL and specify basic metadata (name, color).
- ✔️ Submitting creates a Printable in the backend, stores the STL under `printer-api/media/stl/`, and returns the printable id.
- ✔️ I can navigate to `printable/[id]` and see the newly created printable rendered in the STL viewer with the selected color.
- ✔️ Reasonable validations and error handling (file type/size, required fields).

---

## 6. Push notification when order status changes

> 📊 **Complexity:** 🔴 High  
> 🎯 **Focus:** Fullstack (with strong frontend/PWA component)

### 👤 **Who/What/Why**
- **As a customer**, I want a push notification when my order status changes so I don't need to keep checking the site.

### 📋 **Background**
- Browser push requires service workers and user permission. For a homework, a simple end-to-end demo (subscribe + trigger + receive) is sufficient.

### ✅ **Acceptance Criteria**
- ✔️ Users can opt in to notifications from the frontend.
- ✔️ When an order transitions state (e.g., PRINTING → DONE), a push notification is delivered to the browser with the order id and status.
- ✔️ A minimal service worker is implemented in the Next.js app to receive and display notifications.