# CoreInventory — Cursor Implementation Prompt

You are working on **CoreInventory**, a web-based Inventory Management System. The project uses **Next.js (App Router) + TypeScript + TailwindCSS** on the frontend and **FastAPI + PostgreSQL (Supabase)** on the backend. Authentication is handled via **Supabase Auth with Google OAuth**.

Your task is to **refactor and rebuild the existing frontend code** to match the structure, pages, and UI behavior described below — exactly. Do not deviate from the page structures, navigation, or component layouts described here.

---

## Design System — Follow This Exactly

All pages must use the following design tokens. Define them as CSS variables in `globals.css`:

```css
:root {
  --primary: #00B5AD;
  --primary-hover: #009993;
  --text-main: #1F2937;
  --text-muted: #6B7280;
  --bg-page: #F9FAFB;
  --bg-card: #FFFFFF;
  --border: #E5E7EB;
  --success: #10B981;
  --error: #EF4444;
}
```

**Typography:**
- Font: `Plus Jakarta Sans` (import from Google Fonts)
- Headings: weight 600–700, letter-spacing `-0.02em`
- Body: weight 400, line-height `1.6`

**Form Inputs:**
- Height: `50px`, padding: `14px 16px`
- Border: `1px solid var(--border)`, border-radius: `12px`
- Focus: border `var(--primary)` + `box-shadow: 0 0 0 3px rgba(0,181,173,0.1)`
- Transition: `0.2s` on all state changes

**Buttons:**
- Height: `50px`, border-radius: `12px`, font-weight: `600`
- Primary: bg `var(--primary)`, text white. Hover: `var(--primary-hover)` + `translateY(-1px)`
- Secondary/OAuth: bg white, border `var(--border)`, text `var(--text-main)`

**Cards & Modals:**
- Border-radius: `24px`
- Shadow: `box-shadow: 0 10px 30px rgba(0,0,0,0.05)`
- Padding: `24px–48px`

---

## Layout Structure

### Auth Pages (Login / Signup / Reset Password)
Split-screen layout:
- **Left (60%):** Full-height panel with diagonal teal gradient (`#00B5AD` → `#009993`). Show the CoreInventory logo and tagline centered.
- **Right (40%):** Off-white `var(--bg-page)` background. Center a floating white card (`max-width: 450px`, border-radius `24px`, shadow as above) containing the form.
- **Mobile (<900px):** Collapse to single column, show only the form card.

### Main App Layout (all authenticated pages)
- **Sidebar (fixed, 280px wide):** Background `var(--bg-card)`, `1px solid var(--border)` right border.
  - Top: CoreInventory logo
  - Navigation links (top-aligned): Dashboard, Operations (Receipts, Delivery, Move History), Products, Settings (Warehouse)
  - Bottom-aligned: Profile (My Profile, Logout)
  - Active link style: background `var(--primary)`, text white, border-radius `8px`
- **Content Area:** Remaining flex space, background `var(--bg-page)`, padding `40px`

---

## Pages to Build

---

### 1. Login / Signup Page (`/login`, `/signup`)

**Fields (Signup):**
- Full Name
- Email Address
- Password
- Confirm Password
- Submit button: "Create Account"
- Google OAuth button (secondary style with Google SVG icon, left-aligned)
- Link to Login page

**Fields (Login):**
- Email Address
- Password
- "Forgot Password?" link → OTP Reset flow
- Submit button: "Sign In"
- Google OAuth button
- Link to Signup page

**Behavior:**
- On successful auth → redirect to `/dashboard`
- On failure → show inline error below the relevant field
- Supabase Auth handles the session; store and read the JWT for API calls

---

### 2. OTP Password Reset (`/reset-password`)

Three-step flow on the same page (use step state):
1. **Enter Email** → send OTP
2. **Enter OTP** → verify
3. **Set New Password** → confirm and update

All steps use the same split-screen auth layout.

---

### 3. Dashboard (`/dashboard`)

**KPI Cards Row (CSS Grid, 4 columns):**

| Card | Fields |
|---|---|
| Receipt | Count "X to receive", count "X waiting", count "X late" |
| Delivery | Count "X to deliver", count "X waiting", count "X operations" |

Each KPI card: white bg, `24px` border-radius, teal accent on the count, shadow, padding `24px`.

**Default data shown:**
- Lots: schedule date = today's date
- Operations: schedule date = today's date
- Waiting: waiting for the checks

**Navigation shortcuts from Dashboard:**
- Click "Operations" → expand sub-menu:
  - 1. Receipts
  - 2. Delivery
  - 3. Adjustment (display only in sidebar)
  - 4. Move History

---

### 4. Receipts List Page (`/operations/receipts`)

**Header:** "Receipts" title + search bar (search by reference & contacts) + filter/sort icons (top-right of table)

**Table columns:**
- Reference (e.g. `WH/00/0001`)
- From (source location/supplier)
- To (destination warehouse)
- Product (product name)
- Scheduled Date
- Status badge: `Ready` (teal), `Waiting` (grey), `Done` (green), `Cancelled` (red)

**Notes from mockup:**
- Reference should be auto-generated in format `WH/YYYY/####`
- Populated of "Lots" added to manufacturing orders
- Show "Summary of conditions" as a footer note below the table
- Allow user to sort by button row based on status

**On row click:** Navigate to individual Receipt detail page.

---

### 5. Receipt Detail Page (`/operations/receipts/[id]`)

**Header row:** `← Back` | Receipt reference number | Status badge | Action buttons: `Validate`, `Print`, `Cancel` | Secondary button: `Draft 1 Ready > Done`

**Two-column layout:**

**Left column:**
- Scheduled Date (date input)
- Source Location (text input)
- Responsible (user select)

**Right column:**
- (empty or notes field)

**Products section (below the two-col):**
- Table with columns: Product | Quantity
- "+ Add Product" button at bottom
- "New Product" row appended inline

**Footer:** "Jobs: Fill with the current logged-in name"

**Behavior:**
- `Validate` button → changes status from `Ready` to `Done`, triggers stock +qty in inventory, creates ledger entry
- Status flow: `Draft` → `Ready` → `Done` (or `Cancelled`)
- After validate: show success toast. If product is out of stock, show warning.

---

### 6. Delivery Orders List Page (`/operations/deliveries`)

**Header:** "Delivery" title + search bar (search by reference & contacts) + filter/sort icons

**Table columns:**
- Reference
- From (source warehouse)
- To (destination / customer)
- Product
- Scheduled Date
- Status badge

**Notes from mockup:**
- "Populated of delivery orders"
- Sort by button row based on status

---

### 7. Delivery Detail Page (`/operations/deliveries/[id]`)

**Header row:** `← Back` | Delivery reference | Status badge | Action buttons: `Validate`, `Print`, `Cancel` | Secondary button: `Draft 1 Waiting > Done`

**Two-column layout:**

**Left column:**
- Scheduled Date
- Source Location
- Responsible

**Right column:**
- Delivery Type (select input with options)

**Products section:**
- Table: Product | Demand Qty | Done Qty
- "+ Add Product" / "New Product" inline

**Footer notes:**
- "Draft: Initial stage waiting for the sale of stock product to be in Ready. Ready: for delivery. Done: Delivered"
- After validate: show confirmation & mark the lot if product is in stock

**Behavior:**
- `Validate` → changes status to `Done`, decrements stock qty, creates ledger entry
- If insufficient stock → show inline warning "Insufficient stock for [product]"

---

### 8. Move History Page (`/operations/move-history`)

**Default view:** List View

**Header:** "Move History" title + search bar (search by reference & contacts) + filter/sort icons

**Table columns:**
- Date
- Reference
- From (source)
- To (destination)
- Product
- Quantity
- Status badge

**Notes from mockup:**
- Population of every move between the From–To locations
- If single reference has multiple products → display it in collapse rows
- In each record: display in green, and away should be display in red
- Allow user to switch to Kanban view based on status

---

### 9. Products Page (`/products`)

**Header:** "Products" title + "+ Create Product" button (primary teal)

**Stock Table columns:**
- Product (name)
- Per Unit Cost
- On Hand (current stock qty, editable inline — "User must be able to update the stock from here")
- Free to Use

**Behavior:**
- Inline editing on "On Hand" cell — click to edit, press Enter to save
- On save → triggers a stock adjustment ledger entry automatically
- Show low-stock rows with a red/amber highlight

---

### 10. Warehouse Settings Page (`/settings/warehouses`)

**Note from mockup:** "This page contains the warehouse details & location"

**Warehouse Form:**
- Name (text input)
- Short Code (text input)
- Address (textarea)

**Save/Update button**

Below warehouse form → **Locations sub-section:**

**Location Form:**
- Name (text input)
- Short Code (text input)
- Warehouse (select — linked to saved warehouses)

**Note:** "This holds the multiple locations of warehouses, rooms, etc."

Both forms use the standard input style (50px height, 12px border-radius, teal focus ring).

---

## State Management & Data Flow

- Use **React Context or Zustand** for auth state (user session, JWT token)
- All API calls go to the FastAPI backend at `process.env.NEXT_PUBLIC_API_URL`
- Every request includes `Authorization: Bearer <supabase_jwt>` header
- Use **SWR or React Query** for data fetching with loading/error states on all list pages
- After any `Validate` action → invalidate and refetch the relevant list + dashboard KPIs

---

## API Integration Points

| Page | Method | Endpoint |
|---|---|---|
| Dashboard KPIs | GET | `/api/v1/dashboard/kpis` |
| Receipts List | GET | `/api/v1/operations/receipts` |
| Receipt Detail | GET | `/api/v1/operations/receipts/{id}` |
| Validate Receipt | POST | `/api/v1/operations/receipts/{id}/validate` |
| Deliveries List | GET | `/api/v1/operations/deliveries` |
| Delivery Detail | GET | `/api/v1/operations/deliveries/{id}` |
| Validate Delivery | POST | `/api/v1/operations/deliveries/{id}/validate` |
| Move History | GET | `/api/v1/operations/move-history` |
| Products List | GET | `/api/v1/products` |
| Update Stock (inline) | PATCH | `/api/v1/products/{id}/stock` |
| Warehouses | GET/POST | `/api/v1/warehouses` |
| Locations | GET/POST | `/api/v1/locations` |

---

## Component File Structure

Create the following component files:

```
components/
├── layout/
│   ├── Sidebar.tsx          # Fixed sidebar with nav links, active state, logout
│   ├── AppLayout.tsx        # Sidebar + content wrapper
│   └── AuthLayout.tsx       # Split-screen auth wrapper
├── ui/
│   ├── Button.tsx           # Primary, secondary, ghost variants
│   ├── Input.tsx            # Styled input with focus ring
│   ├── Badge.tsx            # Status badge (Ready/Waiting/Done/Cancelled)
│   ├── KPICard.tsx          # Dashboard summary card
│   ├── DataTable.tsx        # Reusable sortable table
│   └── Toast.tsx            # Success/error toast notifications
└── forms/
    ├── ReceiptForm.tsx
    ├── DeliveryForm.tsx
    └── ProductInlineEdit.tsx
```

---

## Key Behaviors & Rules

1. **Reference numbers** auto-generate in format `WH/YYYY/####` on the backend. Frontend displays them read-only.
2. **Status badge colors:** `Ready` = teal (`var(--primary)`), `Waiting` = grey, `Done` = green (`var(--success)`), `Cancelled` = red (`var(--error)`), `Draft` = light grey.
3. **Validate flow** is always: Draft → Ready → Done. Cancelled is a terminal state reachable from Draft or Ready only.
4. **Stock changes** only happen on `Validate` — never on save/draft.
5. **Move History** records every stock movement (Receipts, Deliveries, Transfers, Adjustments) in one unified view.
6. **Products page** allows inline stock editing — this creates a Stock Adjustment entry on the backend automatically.
7. **Sidebar active state**: highlight the current route's nav item with `var(--primary)` background and white text.
8. **All list pages** must support search by reference number and filter by status.
9. **Mobile responsiveness**: auth pages collapse at 900px; main layout collapses sidebar to icon-only at 768px.
10. **Loading states**: show skeleton loaders (not spinners) on all table/list pages while data fetches.

---

## Do Not Change

- Supabase Auth configuration and Google OAuth setup already in `lib/supabaseClient.ts`
- The JWT verification logic on the backend
- The existing `.env.local` variable names (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`)
- The existing Git branch structure (`main`, `frontend/setup`, `backend/setup`)

---

## Start Here

Begin with these files in order:

1. `app/globals.css` — add all CSS variables and Plus Jakarta Sans import
2. `components/layout/AuthLayout.tsx` — split-screen wrapper
3. `components/layout/Sidebar.tsx` — fixed sidebar with all nav links
4. `components/layout/AppLayout.tsx` — main authenticated layout wrapper
5. `components/ui/Button.tsx`, `Input.tsx`, `Badge.tsx` — base UI components
6. `app/(auth)/login/page.tsx` — login page using AuthLayout
7. `app/(auth)/signup/page.tsx` — signup page
8. `app/dashboard/page.tsx` — dashboard with KPI cards
9. `app/operations/receipts/page.tsx` — receipts list
10. `app/operations/receipts/[id]/page.tsx` — receipt detail + validate
11. `app/operations/deliveries/page.tsx` — deliveries list
12. `app/operations/deliveries/[id]/page.tsx` — delivery detail + validate
13. `app/operations/move-history/page.tsx` — move history
14. `app/products/page.tsx` — products with inline stock edit
15. `app/settings/warehouses/page.tsx` — warehouse + location forms
