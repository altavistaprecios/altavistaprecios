# Data Model: Optics Factory B2B Pricing Platform

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ ClientPrice : creates
    User ||--o{ PriceHistory : modifies
    Product ||--o{ ClientPrice : has
    Product ||--o{ PriceHistory : tracks
    Product ||--|| ProductSpecification : has
    Product }o--|| ProductCategory : belongs_to
    Product }o--o{ Treatment : supports

    User {
        uuid id PK
        string email UK
        string password_hash
        enum role "admin or client"
        timestamp created_at
        timestamp last_login
        boolean is_active
        timestamp password_reset_token_expires
    }

    Product {
        uuid id PK
        string code UK
        string name
        uuid category_id FK
        decimal base_price_usd
        boolean is_active "soft delete"
        timestamp created_at
        timestamp updated_at
        string image_url
    }

    ProductCategory {
        uuid id PK
        string name
        string slug UK
        string description
        int display_order
    }

    ProductSpecification {
        uuid id PK
        uuid product_id FK UK
        string[] materials
        string spherical_range
        string cylindrical_range
        string[] diameters
        string delivery_time
        jsonb additional_specs
    }

    ClientPrice {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        decimal custom_price_usd
        decimal markup_percentage
        timestamp created_at
        timestamp updated_at
        unique user_id_product_id
    }

    Treatment {
        uuid id PK
        string name
        string category
        string description
        jsonb specifications
    }

    ProductTreatment {
        uuid product_id FK
        uuid treatment_id FK
        decimal additional_cost
        primary product_id_treatment_id
    }

    PriceHistory {
        uuid id PK
        uuid product_id FK
        uuid user_id FK "null for base prices"
        decimal old_price
        decimal new_price
        string change_type "base_update or client_override"
        timestamp changed_at
        string changed_by
    }
```

## Entity Definitions

### User
Represents both admin and client accounts in the system.

**Fields**:
- `id`: UUID primary key (auto-generated)
- `email`: Unique email address for authentication
- `password_hash`: Bcrypt hashed password (handled by Supabase Auth)
- `role`: Enum ('admin', 'client') - determines access level
- `created_at`: Account creation timestamp
- `last_login`: Track user activity
- `is_active`: Soft delete for deactivated accounts
- `password_reset_token_expires`: For password reset flow

**Validation Rules**:
- Email must be valid format and unique
- Role must be either 'admin' or 'client'
- Password minimum 8 characters (enforced by Supabase)

**State Transitions**:
- `pending` → `active` (on first login with password set)
- `active` → `inactive` (soft delete by admin)
- `active` → `password_reset` (on reset request)

### Product
Core entity representing optical products.

**Fields**:
- `id`: UUID primary key
- `code`: Unique product code (e.g., "FVTS", "160VTCV")
- `name`: Display name
- `category_id`: Foreign key to ProductCategory
- `base_price_usd`: Factory base price in USD
- `is_active`: Soft delete flag
- `created_at`: Product creation date
- `updated_at`: Last modification date
- `image_url`: Optional product image

**Validation Rules**:
- Code must be unique and non-empty
- Base price must be positive number
- Category must exist

**State Transitions**:
- `active` → `inactive` (soft delete when clients have customizations)

### ProductCategory
Main product sections (MONOFOCALES, etc.)

**Fields**:
- `id`: UUID primary key
- `name`: Category name
- `slug`: URL-friendly identifier
- `description`: Optional description
- `display_order`: For UI sorting

**Initial Data**:
1. MONOFOCALES FUTURE-X (Stock)
2. MONOFOCALES FUTURE-X (Laboratory)
3. MONOFOCALES TERMINADOS (ClearView)

### ProductSpecification
Technical details for each product.

**Fields**:
- `id`: UUID primary key
- `product_id`: Foreign key to Product (unique)
- `materials`: Array of available materials
- `spherical_range`: Range specification
- `cylindrical_range`: Range specification
- `diameters`: Available diameters
- `delivery_time`: Expected delivery timeframe
- `additional_specs`: JSONB for flexible specifications

**Validation Rules**:
- One specification per product
- Ranges must be valid format

### ClientPrice
Client-specific price overrides.

**Fields**:
- `id`: UUID primary key
- `user_id`: Foreign key to User (client)
- `product_id`: Foreign key to Product
- `custom_price_usd`: Client's selling price
- `markup_percentage`: Calculated markup over base
- `created_at`: Override creation date
- `updated_at`: Last modification date

**Validation Rules**:
- Unique constraint on (user_id, product_id)
- Custom price must be positive
- Only clients can have price overrides

### Treatment
Available product treatments.

**Fields**:
- `id`: UUID primary key
- `name`: Treatment name
- `category`: Type of treatment
- `description`: Detailed description
- `specifications`: JSONB for flexible specs

**Initial Categories**:
- Antirreflejante (Anti-reflective)
- Fotocromático (Photochromic)
- Protección UV (UV Protection)

### ProductTreatment
Many-to-many relationship for products and treatments.

**Fields**:
- `product_id`: Foreign key to Product
- `treatment_id`: Foreign key to Treatment
- `additional_cost`: Extra cost for this treatment

### PriceHistory
Audit trail for price changes.

**Fields**:
- `id`: UUID primary key
- `product_id`: Foreign key to Product
- `user_id`: Foreign key to User (null for base price changes)
- `old_price`: Previous price
- `new_price`: New price
- `change_type`: 'base_update' or 'client_override'
- `changed_at`: Timestamp of change
- `changed_by`: Email of user who made change

**Retention**: 1 year per specification

## Database Indexes

### Performance Indexes
```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_client_prices_user ON client_prices(user_id);
CREATE INDEX idx_client_prices_product ON client_prices(product_id);
CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_price_history_date ON price_history(changed_at);
```

### Unique Constraints
```sql
ALTER TABLE products ADD CONSTRAINT uk_product_code UNIQUE (code);
ALTER TABLE users ADD CONSTRAINT uk_user_email UNIQUE (email);
ALTER TABLE client_prices ADD CONSTRAINT uk_user_product UNIQUE (user_id, product_id);
ALTER TABLE product_specifications ADD CONSTRAINT uk_product_spec UNIQUE (product_id);
```

## Row Level Security Policies

### Products Table
```sql
-- Everyone can read active products
CREATE POLICY read_active_products ON products
  FOR SELECT USING (is_active = true);

-- Only admins can insert/update/delete
CREATE POLICY admin_modify_products ON products
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### ClientPrice Table
```sql
-- Users can only see their own prices
CREATE POLICY read_own_prices ON client_prices
  FOR SELECT USING (user_id = auth.uid());

-- Users can only modify their own prices
CREATE POLICY modify_own_prices ON client_prices
  FOR ALL USING (user_id = auth.uid());
```

### PriceHistory Table
```sql
-- Admins see all history
CREATE POLICY admin_read_all_history ON price_history
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Clients see only their own history
CREATE POLICY client_read_own_history ON price_history
  FOR SELECT USING (user_id = auth.uid());
```

## Data Migration Requirements

### Initial Data Load
1. Import product categories
2. Import products from `tablas.md`
3. Import specifications from `tabla_especificaciones.md`
4. Create admin user (anibalin@gmail.com)
5. Set up treatments master data

### Soft Delete Implementation
Products with existing client prices cannot be hard deleted. Instead:
1. Set `is_active = false`
2. Hide from new customization UI
3. Preserve existing client prices
4. Show as "archived" in admin view