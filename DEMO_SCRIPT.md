# StockMind (v2.2) — Five-Minute Live Demonstration Script

**Target Audience:** University Evaluators, Project Guides, and Viva Examiners  
**Estimated Time:** 5–7 Minutes  
**Demonstrators:** StockMind Project Team  
**Architecture:** Java 21/24 (Spring Boot 3.4.0) + Next.js 14 (React 18 + TypeScript) + Supabase PostgreSQL (OAuth2 JWT)

---

## Pre-Demo Checklist (Do 5 Minutes Before Presentation)

1. **Terminal 1 — Backend (Java Spring Boot):**
   ```bash
   cd stockmind
   ./run-backend.sh
   ```
   *Verify:* Output indicates `Started StockMindApplication on port 8080` and `HikariPool - Added connection ... supabase.com`.
2. **Terminal 2 — Frontend (Next.js):**
   ```bash
   cd stockmind/frontend
   npm run dev
   ```
   *Verify:* Output indicates `Ready in localhost:3000`.
3. Open Google Chrome to: `http://localhost:3000`.
4. Ensure you have an active user account or sign up on the login screen (`http://localhost:3000/login`).

---

## 5–7 Minute Live Demonstration Walkthrough

### Step 1: Public Marketing & Architecture Overview (0:00 – 0:45)
- **Action:** Open `http://localhost:3000`. Show the sleek landing page.
- **What to Say:**
  > "Good morning, respected professors and evaluation committee.
  > Today we present **StockMind**, an enterprise inventory intelligence and explainable anomaly detection platform tailored for Indian wholesale and distribution enterprises.
  > 
  > Unlike legacy inventory systems where business logic and calculations are scattered across frontend JavaScript or SQL triggers, **StockMind enforces strict Object-Oriented Programming (OOP) in Java**. 
  > 100% of stock math, invariant validations, and anomaly algorithms are calculated in our Java Spring Boot backend. The React/Next.js frontend is strictly a decoupled presentation layer."
- **Talking Point:**
  - *Clean Architecture & Separation of Concerns:* Decoupled two-tier client-server design communicating over type-safe REST APIs and stateless JWT tokens.

---

### Step 2: Enterprise Authentication & Route Protection (0:45 – 1:15)
- **Action:**
  1. Click **"Login"** in the top navigation bar.
  2. The browser navigates to `/login`.
  3. Attempting to directly type `/app` in the URL bar redirects back to `/login?next=/app` via Next.js Edge Middleware.
  4. Enter your email and password, then click **"Login to Dashboard"**.
- **What to Say:**
  > "Security is implemented end-to-end. Notice that unauthenticated requests to our operational workspace are intercepted by Next.js Edge Middleware.
  > 
  > Once authenticated via Supabase, our frontend acquires a cryptographically signed JWT. Every subsequent request to our Java Spring Boot backend transmits this bearer token, which is verified statelessly by Spring Security's OAuth2 Resource Server using public key cryptography (JWKS). This eliminates stateful HTTP session bottlenecks."
- **Java OOP & Security Talking Point:**
  - *Stateless Token Validation:* Spring Security OAuth2 verifies JWT signatures against Supabase JWKS endpoints without querying the auth database on every request.

---

### Step 3: Operational Dashboard & Valuation Analytics (1:15 – 2:00)
- **Action:**
  1. Show the **Operational Dashboard**.
  2. Point out the top 4 KPI cards: **Total Valuation (₹)**, **Active SKUs**, **Low Stock Alerts**, and **Active Anomalies**.
  3. Interact with the **Live Valuation & Movement Trajectory Chart**:
     - Hover over data points to reveal the pinned interactive tooltip.
     - Switch time horizons: **1W**, **1M**, **3M**, **6M**, **1Y**, **ALL**.
  4. Scroll down to show **Replenishment Priority** (items below reorder level) and **Valuation by Category**.
- **What to Say:**
  > "On our live workspace, you see real-time metrics dynamically calculated in Indian Rupees (₹).
  > All inventory valuation figures ($\sum \text{price} \times \text{quantity}$) and category aggregations are compiled inside our Java backend using Java Streams and pure OOP domain models.
  > The interactive trajectory chart visualizes stock inflows versus dispatches across multi-scale timeframes."
- **Java OOP Talking Point:**
  - *Streams API & Encapsulation:* The `ReportService` uses Java Streams to map `Product::getInventoryValuation` across private class fields without exposing mutable internal state.

---

### Step 4: Adding a Specialized Product — Inheritance & Abstraction (2:00 – 2:50)
- **Action:**
  1. Click **Products** in the sidebar.
  2. Click **"+ Add Product"**.
  3. Fill the form with a perishable good:
     - **Product ID:** `DEMO-PER-101`
     - **Name:** `Amul Fresh Organic Paneer 200g`
     - **Category:** `Dairy`
     - **Product Type:** Select `Perishable` *(Notice the Expiration Date field appears)*
     - **Price (₹):** `95.00`
     - **Initial Quantity:** `30`
     - **Unit:** `packets`
     - **Reorder Level:** `15`
     - **Expiry Date:** Select a date 5 days from today
     - **Supplier:** Select `Amul Dairy Cooperative`
  4. Click **"Save Product"**.
- **What to Say:**
  > "Notice how the UI dynamically requested an expiration date when 'Perishable' was selected. 
  > In our Java domain layer, we use **Inheritance and Abstraction**. `Product` is an abstract base class. When we submit this, `ProductService` instantiates a concrete `PerishableProduct` subclass. 
  > If we selected 'Electronic', it would instantiate `ElectronicProduct` with warranty constraints. Each subclass encapsulates domain-specific validation logic and days-to-expiration calculations."
- **Java OOP Talking Point:**
  - *Abstract Class & Subclass Specialization:* `Product` defines common fields (`price`, `quantity`, `reorderLevel`) and abstract contracts `validate()` and `isReplenishmentNeeded()`, polymorphically implemented by `PerishableProduct`, `ElectronicProduct`, and `StandardProduct`.

---

### Step 5: Atomic Transaction & Polymorphic Operations (2:50 – 3:45)
- **Action:**
  1. Click **Stock Movements** in the sidebar.
  2. Select Product: `DEMO-PER-101 (Amul Fresh Organic Paneer 200g)`.
  3. Select Transaction Type: `STOCK_IN`.
  4. Enter Quantity: `20`. Reason: `Morning fresh dairy consignment PO-9912`.
  5. Point to the UI: **Projected Balance:** $30 + 20 = 50 \text{ packets}$.
  6. Click **"Submit Transaction"**. Point to the ledger entry: $30 \rightarrow 50$.
- **What to Say:**
  > "Now we record incoming inventory. Notice the resulting stock is instantly 50 packets.
  > In our code, `InventoryService` avoids hardcoded conditional logic. Instead, it creates a `StockInOperation` implementing our `InventoryOperation` interface and executes `operation.execute(product)`.
  > This is a practical implementation of the **Strategy Pattern and Polymorphism**."
- **Java OOP Talking Point:**
  - *Polymorphism & Strategy Pattern:* `InventoryOperation` decouples the transaction orchestrator from the mutation rules (`StockInOperation`, `StockOutOperation`, `DamageOperation`, `StockAdjustmentOperation`).

---

### Step 6: Invariant Validation & ACID Rollback (3:45 – 4:30)
- **Action:**
  1. In the **Stock Movements** terminal, select `DEMO-PER-101` (balance is 50).
  2. Select Transaction Type: `STOCK_OUT`.
  3. Enter Quantity: `200` *(deliberately exceeding available stock of 50)*.
  4. Point to the live warning: **"Cannot reduce stock below 0. Java engine will reject this operation."**
  5. Click **"Submit Transaction"**.
  6. Show the backend validation error banner: `"Insufficient stock for product DEMO-PER-101. Available: 50, Requested: 200"`.
- **What to Say:**
  > "Here we test data integrity. We attempt to dispatch 200 packets when only 50 exist.
  > The Java backend throws a custom `InsufficientStockException`. Because the method is annotated with `@Transactional`, the database transaction immediately rolls back. 
  > Leaky arithmetic can never corrupt our inventory balance."
- **Java OOP Talking Point:**
  - *Custom Exception Hierarchy & Transactional Integrity:* Custom checked exceptions subclassed from `StockMindException` trigger automatic Spring rollback, preserving database ACID properties.

---

### Step 7: Explainable Anomaly Detection (4:30 – 5:20)
- **Action:**
  1. In **Stock Movements**, select `DEMO-PER-101` (current stock: 50).
  2. Select Transaction Type: `DAMAGE`.
  3. Enter Quantity: `40` (80% of total stock damaged in one go).
  4. Reason: `Refrigeration unit failure in Cold Storage Room B`.
  5. Click **"Submit Transaction"**.
  6. Navigate to **Anomaly Alerts** in the sidebar.
  7. Show the newly generated alert: Point out the severity badge (`CRITICAL`), the plain-English explanation, and the mathematical formula.
- **What to Say:**
  > "Now observe our explainable anomaly detection engine. We wrote off 80% of our stock due to refrigeration failure.
  > The system immediately flagged a Critical Anomaly Alert.
  > Unlike opaque machine learning 'black boxes', our Java engine combines **Layer A (Deterministic Rule Heuristics)** with **Layer B (Statistical Z-Score Analysis)**. 
  > It produces human-readable mathematical rationales that warehouse managers and auditors can instantly verify."
- **Java OOP Talking Point:**
  - *Composite Pattern:* `CompositeAnomalyDetector` evaluates a chain of `AnomalyDetector` components (`RuleBasedAnomalyDetector` and `StatisticalAnomalyDetector`), returning structured `AnomalyReport` records.

---

### Step 8: Bulk CSV Operations, Data Portability & Logout (5:20 – 6:00)
- **Action:**
  1. Navigate to **Data & Settings**.
  2. Show the **Idempotent Demo Data Seeder** button (seeds 40+ products, 5 suppliers, and transaction histories safely without duplicates).
  3. Show the **Bulk CSV Importer** with row-level validation diagnostics.
  4. Click the **Logout** button at the bottom of the sidebar. Show the smooth redirect to `/login`.
- **What to Say:**
  > "Finally, StockMind offers full enterprise data portability with RFC 4180 streaming CSV imports and idempotent database seeding.
  > Logging out clears the Supabase session and secures the terminal.
  > 
  > In conclusion, StockMind demonstrates how core Object-Oriented principles — Encapsulation, Abstraction, Inheritance, and Polymorphism — directly solve real-world industrial data corruption and auditing problems.
  > We are now ready for your questions. Thank you!"

---

## Quick Reference — Evaluator Q&A Cheat Sheet

| Question | Short Answer |
| :--- | :--- |
| **Where is Encapsulation?** | Private fields in `Product.java`, mutator validations (`price >= 0`), quantity can only mutate via `InventoryOperation`. |
| **Where is Abstraction?** | `public abstract class Product`, `public interface InventoryOperation`, `public interface AnomalyDetector`. |
| **Where is Inheritance?** | `PerishableProduct`, `ElectronicProduct`, and `StandardProduct` extend `Product`. |
| **Where is Polymorphism?** | Dynamic dispatch in `InventoryService` executing `operation.execute(product)`. |
| **Why no ML library for anomalies?** | Enterprise auditability. Rule heuristics + Z-Score ($Z \ge 2.8$) provide transparent, deterministic formulas that auditors can verify without opaque black boxes. |
| **How is authentication secured?** | Supabase Auth issues JWT tokens; Next.js Middleware protects `/app`; Spring Security statelessly validates tokens using public keys from Supabase JWKS. |
| **How is currency formatted?** | Localized to Indian Rupees (`₹`) using standard metric units (`L`, `kg`, `packets`, `boxes`, `pcs`, `cases`, `sets`, `tubs`). |
