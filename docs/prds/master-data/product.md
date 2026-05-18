# PRD: Product & Classifications

## 1. Summary

Product master data with 9 sub-pages for classifications. Products are linked to brands, categories, manufacturers, warehouses, and have a multi-tier pricing system.

## 2. Routes

| Screen | Route | Tab |
|--------|-------|-----|
| Master Product | `/master/product/master-product` | Products list |
| Brand | `/master/product/brand` | Brand list |
| Category | `/master/product/category` | Product categories |
| Sub Category | `/master/product/sub-category` | Sub-categories |
| Price | `/master/product/price` | Price tiers (HJP, HPD, HET, etc.) |
| Discount | `/master/product/discount` | Discount codes (A, B, C, etc.) |
| Warehouse Location | `/master/product/warehouse-location` | Physical warehouses |
| Warehouse Type | `/master/product/warehouse-type` | Warehouse type categories |
| Unit of Measure | `/master/product/unit-of-measure` | UOM definitions |

All tabs under `/master/product`. Share the same permission (Master access).

## 3. Data Models

### 3.1 Master Product

```ts
interface Product {
  id: string;
  code: string;                   // ItemCode (varchar 20)
  description: string;             // Dscription
  alias: string;                   // Aliasku
  barcode: string;                 // CodeBars
  manufacturer_id: string;         // FK → manufacturers (MnfctrCode)
  brand_id: string;                // FK → brands (BrandCode)
  category_id: string;             // FK → product_categories (CatgryCode)
  sub_category_id: string;         // FK → product_sub_categories (SubCatCode)
  class_code: string;              // ClassCode (pricing class)
  uom: string;                     // primary unit
  uom_conversion1: number;         // UOM1
  uom_conversion2: number;         // UOM2
  uom_conversion3: number;         // UOM3
  length: number;
  width: number;
  height: number;
  weight1: number;
  weight2: number;
  is_salable: boolean;             // SalesItem
  is_purchasable: boolean;         // PurchItem
  is_returnable: boolean;          // ReturnItem
  reorder_qty: number;             // ReorderQty
  min_level: number;               // MinLevel
  max_level: number;               // MaxLevel
  item_function: string;           // ItemFunction
  is_locked: boolean;
  is_active: boolean;
  last_sale_date: string;
  last_purchase_date: string;
  registered_at: string;
  // Computed from inventory:
  on_hand: number;
  committed: number;
  on_order: number;
}
```

### 3.2 Product Prices

```ts
interface ProductPrice {
  id: string;
  product_id: string;
  price_tier: string;       // PriceCode: HJP, HPD, HET, HPP, HPDMOP, HETMOP, COST
  price: number;
  is_current: boolean;      // CurrentPrice ('Y'/'N')
  start_date: string;
  end_date: string;
}
```

### 3.3 Product Discounts

```ts
interface ProductDiscount {
  id: string;
  product_id: string;
  discount_type: string;    // DiscCode ('A'=level A, etc.)
  discount: number;
}
```

### 3.4 Lookup Tables

```ts
interface Brand {
  id: string;
  code: string;             // BrandCode (varchar 10)
  name: string;              // Dscription
  sku_code: string;           // SKUCode
}

interface ProductCategory {
  id: string;
  code: string;             // CatgryCode (char 2)
  name: string;
}

interface ProductSubCategory {
  id: string;
  code: string;             // SubCatCode (char 2)
  name: string;
  category_id: string;       // FK → product_categories
}

interface Manufacturer {
  id: string;
  code: string;             // MnfctrCode (char 2)
  name: string;
}

interface Warehouse {
  id: string;
  code: string;             // WhsCode (varchar 8)
  name: string;              // Dscription
  address: string;
  city: string;
  state: string;
  zip_code: string;
  type: string;              // WhsType
  is_locked: boolean;
}

interface WarehouseType {
  id: string;
  code: string;             // WhsType (char 1)
  name: string;              // Dscription
  check_on_hand: boolean;    // CHECKONHAND
}
```

### 3.5 Price Tiers

```ts
interface PriceTier {
  id: string;
  code: string;             // PriceCode (varchar 8)
  name: string;              // Dscription
  factor: number;            // Factor
}
```

### 3.6 Discount Codes

```ts
interface DiscountCode {
  id: string;
  code: string;             // DiscCode (char 2)
  name: string;              // Dscription
}
```

## 4. Database Tables (PostgreSQL)

| Table | Legacy Source | Rows |
|-------|-------------|------|
| `products` | `Item` | 6,714 |
| `product_prices` | `ItemPrice` | 147,708 (large) |
| `product_discounts` | `ItemDiscount` | 22,437 |
| `brands` | `Brand` | 589 |
| `product_categories` | `Category` | 8 |
| `product_sub_categories` | `SubCategory` | 7 |
| `manufacturers` | `Manufacturing` | 4 |
| `warehouses` | `Warehouse` | 15 |
| `warehouse_types` | `WarehouseType` | 3 |
| `price_tiers` | `Price` | 22 |
| `discount_codes` | `Discount` | 3 |
| `units_of_measure` | `Uom` | 43 |

## 5. What Users Can Do

| Action | Developer | SuperAdmin | Admin (Master) | No Master |
|--------|-----------|------------|----------------|-----------|
| View products | ✅ | ✅ | ✅ | ❌ |
| Create/Edit product | ✅ | ✅ | ✅ | ❌ |
| Delete product | ✅ | ✅ | ❌ | ❌ |
| View prices | ✅ | ✅ | ✅ | ❌ |
| Edit prices (Dev/SuperAdmin) | ✅ | ✅ | ❌ (view only) | ❌ |
| Manage lookups (brands, categories, etc.) | ✅ | ✅ | ✅ (no delete) | ❌ |

**Price editing is restricted**: Only Dev/SuperAdmin can change product prices. Admin-level Master access users can view prices but the Edit button is disabled on the Price tab.

**Master access users:** Didi, Pai, Nenden, Atep, Alvin
**No Master access:** Yane, Ilham, Robby, Nisa

## 6. UI Behavior

### Master Product Tab
- Table: Code, Description, Brand, Category, Stock, Status
- Search by code, description, barcode
- Filter by brand, category, is_active
- Click row → detail with: basic info, pricing, inventory (read-only)
- Inline price: current prices shown as read-only badges (HJP/HPD/HET/HPP)
- "New Product" button
- Delete hidden for Admin-level

### Price Tab
- For Dev/SuperAdmin: editable grid — Product, Tier, Price, Start Date, End Date, Current
- For Admin: same view but read-only
- Filter by price tier

### Discount Tab
- Editable grid: Product, Discount Type, Discount %
- For Admin: edit enabled, delete hidden

### Lookup Tabs (Brand, Category, Warehouse, etc.)
- Simple CRUD tables with Code + Name
- Delete hidden for Admin-level

### Product Detail View
- Multi-section: Basic Info, Dimensions, Inventory, Pricing
- Inventory section is read-only (comes from inventory_balances)
- Price section shows all tiers in a sub-table
- Address/UOM/Classification fields as dropdowns

## 7. API Endpoints

### Products
| Method | Path |
|--------|------|
| `GET` | `/api/products?search=&brand=&category=&page=&pageSize=` |
| `GET` | `/api/products/:id` |
| `POST` | `/api/products` |
| `PUT` | `/api/products/:id` |
| `DELETE` | `/api/products/:id` |
| `GET` | `/api/products/:id/prices` |
| `POST` | `/api/products/:id/prices` (Dev/SuperAdmin) |
| `PUT` | `/api/products/:id/prices/:priceId` (Dev/SuperAdmin) |

### Lookup Endpoints (shared pattern)
| Group | Base Path |
|-------|----------|
| Brands | `/api/brands` |
| Categories | `/api/product-categories` |
| Sub Categories | `/api/product-sub-categories` |
| Manufacturers | `/api/manufacturers` |
| Warehouses | `/api/warehouses` |
| Warehouse Types | `/api/warehouse-types` |
| Price Tiers | `/api/price-tiers` |
| Discount Codes | `/api/discount-codes` |
| UOM | `/api/units-of-measure` |

All support standard CRUD with role-based delete restriction.

## 8. Acceptance Criteria
- [ ] Product list with search, brand/category filter, pagination
- [ ] Product detail shows pricing sub-table (read-only for Admin)
- [ ] Price editing restricted to Dev/SuperAdmin
- [ ] 9 tabs render correctly under Product
- [ ] Lookup tabs simple CRUD
- [ ] Delete hidden for non-Dev/non-SuperAdmin across all sub-pages
- [ ] Inventory section (on_hand, committed, on_order) is read-only
- [ ] Product form dropdowns load from related tables (brand, category, manufacturer, UOM)
- [ ] Sidebar grayed out for users without Master access
