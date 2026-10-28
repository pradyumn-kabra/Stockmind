# StockMind (v2.0) — Semester 3 Java OOP Viva Defense Guide

**Project:** StockMind — Inventory Monitoring & Anomaly Detection System  
**Course:** Object-Oriented Programming (Java) — Semester 3 Mini Project  
**Architecture:** Decoupled Client-Server (React 18 + TypeScript / Java Spring Boot / Supabase PostgreSQL)  

---

# SECTION A: The Four Pillars of OOP in StockMind

### 1. Encapsulation
- **Definition:** The bundling of data (fields) and the methods that operate on that data into a single unit (class), while restricting direct access to internal state from outside the class.
- **StockMind Implementation:**
  - All domain model fields in [`Product.java`](backend/src/main/java/com/stockmind/model/Product.java), [`StockTransaction.java`](backend/src/main/java/com/stockmind/model/StockTransaction.java), [`Supplier.java`](backend/src/main/java/com/stockmind/model/Supplier.java), and [`AnomalyAlert.java`](backend/src/main/java/com/stockmind/model/AnomalyAlert.java) are marked `private` or `protected`.
  - Invariant validation is enforced inside mutator methods (`setPrice()`, `setQuantity()`, `setReorderLevel()`). For example, in `Product.java`:
    ```java
    public void setPrice(double price) {
        if (price < 0) {
            throw new ValidationException("Product price cannot be negative.");
        }
        this.price = price;
    }
    ```
  - Stock quantity cannot be arbitrarily updated via regular form edits; stock can only mutate through validated transaction operations, protecting data integrity.

### 2. Abstraction
- **Definition:** Hiding complex implementation details and exposing only essential interfaces and behaviors to the caller.
- **StockMind Implementation:**
  - **Abstract Class [`Product.java`](backend/src/main/java/com/stockmind/model/Product.java):** Declares essential shared inventory attributes and abstract behavior contracts:
    ```java
    public abstract void validate() throws ValidationException;
    public abstract boolean isReplenishmentNeeded();
    ```
  - **Interface [`InventoryOperation.java`](backend/src/main/java/com/stockmind/operations/InventoryOperation.java):** Defines the contract for processing stock changes:
    ```java
    public interface InventoryOperation {
        void execute(Product product) throws InsufficientStockException, InvalidTransactionException;
        TransactionType getTransactionType();
        int getQuantity();
        String getReason();
    }
    ```
  - The `InventoryService` interacts with `InventoryOperation` without knowing the mathematical differences between additions, subtractions, write-offs, or reconciliation deltas.
  - **Interface [`AnomalyDetector.java`](backend/src/main/java/com/stockmind/detector/AnomalyDetector.java):** Abstracts anomaly evaluation algorithms behind `analyze(transaction, product, history)`.

### 3. Inheritance
- **Definition:** A mechanism where a child class inherits properties and behaviors from a parent class, facilitating code reuse and hierarchical specialization.
- **StockMind Implementation:**
  - `Product` serves as the abstract parent class.
  - **[`PerishableProduct.java`](backend/src/main/java/com/stockmind/model/PerishableProduct.java):** Inherits common attributes (`id`, `name`, `price`, `quantity`, `reorderLevel`) and extends with perishable-specific state (`expiryDate`, `daysUntilExpiration()`, `isExpired()`).
  - **[`ElectronicProduct.java`](backend/src/main/java/com/stockmind/model/ElectronicProduct.java):** Inherits `Product` and adds warranty tracking (`warrantyMonths`, `isUnderWarranty()`).
  - **[`StandardProduct.java`](backend/src/main/java/com/stockmind/model/StandardProduct.java):** Concrete baseline for general goods without expiration or warranty constraints.

### 4. Polymorphism
- **Definition:** The ability of different classes to respond to the same message or method call in different ways (via dynamic method dispatch at runtime).
- **StockMind Implementation:**
  - **Dynamic Dispatch in Operations:**
    In `InventoryService.processTransaction()`:
    ```java
    InventoryOperation operation = switch (request.getTransactionType()) {
        case STOCK_IN -> new StockInOperation(request.getQuantity(), request.getReason());
        case STOCK_OUT -> new StockOutOperation(request.getQuantity(), request.getReason());
        case DAMAGE -> new DamageOperation(request.getQuantity(), request.getReason());
        case ADJUSTMENT -> new StockAdjustmentOperation(request.getQuantity(), request.getReason());
    };
    operation.execute(product); // Polymorphic call!
    ```
    At runtime, Java invokes the specific `execute()` implementation based on the concrete object instantiated.
  - **Method Overriding in Domain Models:**
    `Product.isReplenishmentNeeded()` returns `true` if `quantity <= reorderLevel`.  
    `PerishableProduct` overrides this method:
    ```java
    @Override
    public boolean isReplenishmentNeeded() {
        return super.isReplenishmentNeeded() || isExpiringSoon(7);
    }
    ```
    It polymorphically triggers replenishment if stock is low OR if the goods are expiring within 7 days!

---

# SECTION B: Additional Core OOP Concepts

### 1. Interfaces vs. Abstract Classes
- **Abstract Class (`Product`):** Used when classes share state (`price`, `quantity`, `supplierId`) and code implementation (`getInventoryValuation()`), but the base class cannot be meaningfully instantiated on its own.
- **Interface (`InventoryOperation`, `AnomalyDetector`):** Used to define a pure behavioral contract without shared state, allowing completely different classes to fulfill the role.

### 2. Composition vs. Association
- **Composition:** `CompositeAnomalyDetector` *owns* `RuleBasedAnomalyDetector` and `StatisticalAnomalyDetector`. If the composite detector is destroyed, the child detector instances are destroyed with it.
- **Association:** A `Product` is *associated* with a `Supplier` via `supplierId`. Both entities have independent lifecycles; deleting or creating a product does not create or destroy the supplier.

### 3. Method Overloading vs. Method Overriding
- **Method Overriding (Runtime Polymorphism):**
  - `PerishableProduct.validate()` overrides `Product.validate()` to add expiration checks.
  - `StatisticalAnomalyDetector.analyze()` overrides `AnomalyDetector.analyze()`.
- **Method Overloading (Compile-Time Polymorphism):**
  - Multiple constructors in `Product`:
    - `public Product()` (default constructor).
    - `public Product(String id, String name, String category, double price, int quantity, int reorderLevel, String supplierId)` (parameterized constructor).
  - Multiple constructors in `StatisticalAnomalyDetector`:
    - `public StatisticalAnomalyDetector()` (defaults to threshold 2.8, minHistory 3).
    - `public StatisticalAnomalyDetector(double zScoreThreshold, int minHistoryRequired)` (custom configuration).

### 4. Constructors & Access Modifiers
- `public`: Accessible from any class (REST controllers, service layer).
- `protected`: Fields in `Product` (`id`, `name`, `price`, `quantity`, `reorderLevel`) are accessible to subclasses (`PerishableProduct`, `ElectronicProduct`) and package classes.
- `private`: Fields in `Supplier`, `StockTransaction`, and `AnomalyAlert` are accessible only inside their respective classes.

### 5. Custom Exception Hierarchy
- Domain exceptions extend `RuntimeException` (unchecked exceptions) to participate in automatic transaction rollbacks under Spring's `@Transactional` proxy:
  - `InsufficientStockException`: Thrown when requested stock-out exceeds available stock.
  - `ValidationException`: Thrown on domain invariant violations (negative values, empty names).
  - `InvalidTransactionException`: Thrown when transaction arguments are missing or invalid.
  - `ProductNotFoundException`, `SupplierNotFoundException`: Resource lookup failures.
  - `DuplicateProductException`: Identity uniqueness violations.

### 6. Java Collections Framework & Streams API
- `List<T>` / `ArrayList<T>`: Used across all repositories and services for dynamic lists of products, transactions, and alerts.
- `Map<K, V>` / `HashMap<K, V>`:
  - Used in `ReportService` for category aggregation:
    ```java
    Map<String, List<Product>> byCategory = activeProducts.stream()
            .collect(Collectors.groupingBy(Product::getCategory));
    ```
  - Used for fast $O(1)$ product ID-to-name resolution:
    ```java
    Map<String, String> productNameMap = activeProducts.stream()
            .collect(Collectors.toMap(Product::getId, Product::getName, (a, b) -> a));
    ```
- `Java Streams`: Used for declarative filtering, mapping, and arithmetic reduction (e.g. `mapToDouble(Product::getInventoryValuation).sum()`).

---

# SECTION C: Architecture & Database

### 1. Why Java Contains 100% of the Business Logic
- The client tier (browser/React) is an untrusted environment where users can inspect source code, modify client state, or issue raw curl requests.
- Keeping stock arithmetic, validation checks, and state transitions strictly inside Java domain models guarantees that no client request can corrupt inventory records, produce negative stock, or bypass anomaly detection.

### 2. Frontend-to-Backend Communication
- React uses the browser `fetch` API (`frontend/src/lib/api.ts`) to make structured HTTP requests (`GET`, `POST`, `PUT`, `DELETE`) to `/api/*`.
- Next.js proxies these calls to the Spring Boot REST API on port `8080`.
- Data is serialized and deserialized using JSON with standard ISO 8601 timestamps.

### 3. Database Persistence in Supabase PostgreSQL
- Supabase provides a hosted, enterprise PostgreSQL 15+ database.
- The Java backend connects to Supabase over JDBC using the official PostgreSQL JDBC Driver (`org.postgresql.Driver`) with SSL encryption (`sslmode=require`).
- Spring Data JPA and Hibernate map Java entities (`ProductEntity`, `StockTransactionEntity`, `SupplierEntity`, `AnomalyAlertEntity`) to relational database tables.

### 4. Transactional Consistency & Rollback
- `InventoryService.processTransaction()` is annotated with `@Transactional`.
- When an operation throws `InsufficientStockException`, Spring's transaction manager intercepts the unchecked exception and issues a database `ROLLBACK`.
- The product stock balance remains intact, and no orphaned transaction record or alert is persisted.

---

# SECTION D: Explainable Anomaly Detection Engine

### 1. Dual-Layer Strategy
StockMind avoids unexplainable "black-box" machine learning. Instead, it combines:
- **Layer A (Deterministic Rule Heuristics):**
  1. *Drastic Depletion:* Stock-out depleting $\ge 80\%$ (Critical) or $\ge 50\%$ (High) of available stock in a single transaction.
  2. *Excessive Damage:* Damage write-offs exceeding $30\%$ of stock or $\ge 20$ units.
  3. *Repeated Adjustments:* $\ge 2$ adjustments recorded on the same product within 24 hours.
- **Layer B (Statistical Z-Score Baseline):**
  Evaluates transaction history of the same movement type:
  $$\text{Mean } \mu = \frac{1}{N}\sum_{i=1}^N q_i$$
  $$\text{Standard Deviation } \sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (q_i - \mu)^2}$$
  $$\text{Z-Score } Z = \frac{|q_{\text{current}} - \mu|}{\sigma}$$
  Flags transactions where $Z \ge 2.8$.

### 2. Mathematical Edge Cases & Defenses
- *Insufficient History:* If historical transactions $< 3$, the statistical detector returns normal (insufficient baseline).
- *Zero Standard Deviation:* If all historical movements are identical (e.g. 10, 10, 10), $\sigma = 0$. The detector clamps $\sigma$ to a minimum of $1.0$, preventing division-by-zero, `NaN`, or infinite values.
- *Distinction between Anomaly and Invalid Transaction:*
  - An *invalid transaction* (e.g. withdrawing 100 units when only 20 are in stock) violates physical inventory constraints and is **rejected immediately with `InsufficientStockException`**.
  - An *anomaly* is a **valid but unusual movement** (e.g. a customer buying 80 out of 100 available units). It is allowed to proceed and recorded, but flagged for managerial review.

---

# SECTION E: 35+ Likely Viva Questions & Technical Answers

#### 1. What is the difference between an abstract class and an interface?
- *Answer:* An abstract class can have instance variables, non-abstract implemented methods, and constructors, but cannot be instantiated. An interface defines a contract of behavior without instance state. In StockMind, `Product` is an abstract class because products share common fields (`price`, `quantity`), whereas `InventoryOperation` is an interface representing pure behavior (`execute()`).

#### 2. Why is `Product` abstract in StockMind?
- *Answer:* Because an abstract product does not exist in isolation in our domain; every item in inventory is either a `PerishableProduct`, an `ElectronicProduct`, or a `StandardProduct`. Declaring `Product` as abstract prevents direct instantiation while defining common properties and enforcing abstract methods like `validate()` and `isReplenishmentNeeded()`.

#### 3. How does StockMind demonstrate Encapsulation?
- *Answer:* By marking all domain fields as `private` or `protected` and providing getter and setter methods that validate data. For example, `setQuantity()` throws a `ValidationException` if a negative integer is passed, ensuring the internal state cannot be corrupted.

#### 4. How does Polymorphism work in StockMind's inventory transactions?
- *Answer:* `InventoryService` interacts with the `InventoryOperation` interface. When processing a transaction, it calls `operation.execute(product)`. Java resolves whether to invoke `StockInOperation`, `StockOutOperation`, `DamageOperation`, or `StockAdjustmentOperation` dynamically at runtime.

#### 5. What is Method Overriding, and where is it used?
- *Answer:* Method overriding occurs when a subclass provides its own specific implementation of a method already defined in its superclass. In StockMind, `PerishableProduct` overrides `isReplenishmentNeeded()` to check both the reorder level threshold and whether the product will expire within 7 days.

#### 6. What is Method Overloading, and where is it used?
- *Answer:* Method overloading occurs when multiple methods in the same class share the same name but have different parameter lists. In StockMind, constructors in `Product` and `StatisticalAnomalyDetector` are overloaded to support default and parameterized instantiation.

#### 7. Why do you use unchecked exceptions instead of checked exceptions for business errors?
- *Answer:* In Spring Boot, transactional rollbacks by default trigger on unchecked exceptions (`RuntimeException`). Custom exceptions like `InsufficientStockException` extend `RuntimeException`, allowing Spring's `@Transactional` proxy to automatically roll back database changes when an exception is thrown.

#### 8. How does `@Transactional` prevent inconsistent stock balances?
- *Answer:* It guarantees ACID properties. If an error occurs after a product quantity is updated in memory but before the audit transaction is written to the database, Spring and the database roll back the entire transaction, leaving the original stock balance unchanged.

#### 9. What is the difference between Composition and Association in StockMind?
- *Answer:* `CompositeAnomalyDetector` has a *composition* relationship with `RuleBasedAnomalyDetector` and `StatisticalAnomalyDetector` because it owns and instantiates them. `Product` has an *association* with `Supplier` via `supplierId`, as both exist independently.

#### 10. How does the explainable anomaly detection engine work?
- *Answer:* It uses a dual-layer strategy: Layer A tests deterministic domain heuristics (sudden >50% drop, >30% damage write-off, repeated adjustments within 24h), while Layer B calculates the mean, standard deviation, and Z-score over historical transactions of the same type.

#### 11. What is a Z-score?
- *Answer:* A Z-score measures how many standard deviations a data point deviates from the mean: $Z = \frac{|x - \mu|}{\sigma}$. A Z-score $\ge 2.8$ indicates a statistically rare occurrence (less than 0.5% probability in a normal distribution).

#### 12. How do you prevent division by zero in the Z-score calculation?
- *Answer:* If historical transactions all have identical quantities, the standard deviation $\sigma$ is 0. Our implementation checks `if (stdDev < 1.0) stdDev = 1.0;`, ensuring the denominator is always $\ge 1.0$ and avoiding `NaN` or `Infinity`.

#### 13. What happens if a product has fewer than 3 historical transactions?
- *Answer:* `StatisticalAnomalyDetector` checks `if (quantities.size() < minHistoryRequired) return AnomalyReport.normal();`. It requires at least 3 transactions to establish a statistical baseline.

#### 14. What is the difference between an anomaly and an invalid transaction?
- *Answer:* An invalid transaction violates physical or business constraints (e.g. issuing 50 units when only 10 exist) and is rejected with an exception. An anomaly is a valid transaction that happens to be unusual (e.g. buying 80 out of 100 available units); it is processed and committed, but flagged for managerial review.

#### 15. Why is business logic implemented in Java instead of TypeScript?
- *Answer:* Client-side code in TypeScript runs in the browser and is untrusted. Any user could tamper with frontend code or send raw HTTP requests to bypass rules. Enforcing all calculations and invariants in Java guarantees absolute data integrity.

#### 16. How does the React frontend talk to the Java backend?
- *Answer:* The frontend sends HTTP requests (`fetch` in `src/lib/api.ts`) with JSON payloads to REST controllers. In Next.js, API rewrites proxy requests from `/api/*` to the Spring Boot backend on `http://localhost:8080/api/*`.

#### 17. How does Spring Boot map JSON to Java objects?
- *Answer:* Using Jackson (`ObjectMapper`). When a request arrives at `@PostMapping`, `@RequestBody` automatically deserializes the JSON string into DTOs like `TransactionRequest`.

#### 18. What is the purpose of Data Transfer Objects (DTOs)?
- *Answer:* DTOs decouple external API contract payloads (`ProductRequest`, `TransactionResponse`) from internal persistent entities (`ProductEntity`) and domain models (`Product`), preventing accidental leakage of internal database structures.

#### 19. What is the role of Spring Data JPA Repositories?
- *Answer:* Repositories (`ProductRepository`, `StockTransactionRepository`) provide standard CRUD methods and custom query derivation (`findByActive`, `findLowStockProducts`) using Spring Data proxies over Hibernate, reducing boilerplate JDBC code.

#### 20. How is Supabase PostgreSQL integrated?
- *Answer:* Supabase provides a hosted PostgreSQL instance. Spring Boot connects via JDBC using HikariCP connection pooling and standard PostgreSQL dialect over SSL (`sslmode=require`).

#### 21. How are database credentials protected?
- *Answer:* Credentials are never hardcoded. They are injected via environment variables (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`), and local credential files are ignored via `.gitignore`.

#### 22. What check constraints exist in the PostgreSQL schema?
- *Answer:* `CHECK (price >= 0)`, `CHECK (quantity >= 0)`, and `CHECK (reorder_level >= 0)` prevent corrupted or negative values directly at the database level.

#### 23. Why do we soft-delete products instead of executing `DELETE`?
- *Answer:* Historical transactions reference the product ID. Deleting a product would violate foreign key constraints (`ON DELETE RESTRICT`) or orphan financial audit records. Setting `active = false` hides the product from active operations while preserving historical integrity.

#### 24. What collection classes are used in StockMind, and why?
- *Answer:* `ArrayList` is used for indexed, ordered sequences of products and transactions. `HashMap` is used in `ReportService` for grouping products by category and for $O(1)$ product ID-to-name lookups.

#### 25. How do you calculate total inventory valuation in Java?
- *Answer:* Using Java Streams:
  ```java
  double valuation = activeProducts.stream()
          .mapToDouble(Product::getInventoryValuation)
          .sum();
  ```
  Where `getInventoryValuation()` returns `price * quantity`.

#### 26. How does `GlobalExceptionHandler` work?
- *Answer:* It is annotated with `@RestControllerAdvice`. When any controller method throws an unhandled exception (e.g. `InsufficientStockException`), the matching `@ExceptionHandler` method intercepts it and returns a formatted JSON error response with appropriate HTTP status codes (e.g. 400 Bad Request, 404 Not Found, 409 Conflict).

#### 27. What is the role of `ProductMapper` and `StockTransactionMapper`?
- *Answer:* They translate between JPA entities (database tier) and domain models (OOP business tier), maintaining clean architecture and ensuring domain classes remain free of JPA annotations.

#### 28. How does the CSV import handle malformed rows?
- *Answer:* `CsvService` reads line by line. If a row has invalid data (e.g. negative price or missing fields), it catches the exception, logs an error for that specific row number (`Row 4: Price cannot be negative`), and continues parsing the remaining rows.

#### 29. What makes the demo data seeder idempotent?
- *Answer:* Before inserting suppliers and products, it checks `repository.existsById(id)`. If records exist, it skips them, ensuring repeated seeding does not cause duplicate key errors.

#### 30. How does `PerishableProduct` calculate days until expiration?
- *Answer:* Using `java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiryDate)`. If the result is negative, `isExpired()` returns `true`.

#### 31. What is the purpose of `final` fields in `StockTransaction`?
- *Answer:* Stock transactions represent immutable audit records. Once recorded, attributes like `transactionId`, `productId`, `previousQuantity`, and `resultingQuantity` can never be modified.

#### 32. How do you distinguish between `STOCK_OUT` and `DAMAGE`?
- *Answer:* Both decrease stock balance, but `DAMAGE` represents an unsellable inventory loss requiring a recorded rationale, while `STOCK_OUT` represents legitimate fulfillment or sales.

#### 33. How does `StockAdjustmentOperation` differ from `StockInOperation`?
- *Answer:* `StockIn` accepts only positive quantities to increase inventory. `StockAdjustment` accepts a signed integer (positive or negative delta) to reconcile physical audit discrepancies and requires a documented reason.

#### 34. What design patterns are used in StockMind?
- *Answer:*
  1. **Strategy Pattern:** In `InventoryOperation` (stock mutations) and `AnomalyDetector` (anomaly detection algorithms).
  2. **Composite Pattern:** In `CompositeAnomalyDetector`, combining rule-based and statistical detectors.
  3. **Repository Pattern:** Spring Data repositories abstracting data persistence.
  4. **Data Transfer Object (DTO) Pattern:** Decoupling API contracts from domain entities.

#### 35. If you had to scale StockMind to 1,000,000 transactions, what would you optimize?
- *Answer:* Add database pagination (`Pageable` in Spring Data JPA) to avoid loading all transactions into memory, add database indexes on `created_at` and `product_id`, and compute statistical baselines using rolling aggregates or asynchronous background workers.
