# Feature Specification: Optics Factory B2B Pricing Platform

**Feature Branch**: `001-im-building-a`
**Created**: 2025-09-23
**Status**: Draft
**Input**: User description: "Im building a platform so my clients can check my prices. Im an optic factory and I have two main sections.Check public/tablas.md Then I have a especificaciones table check tabla_especificaciones.md on the /public folder. Im a b2b so I will provide an url precios.altavista.com at the end of the whole proyect via github and supabase. and my clients will log there with their email account. When loged they can see what I provided. As they are b2c they will be able to modify those prices for their benefit. So Im the admin and I log with anibalin@gmail.com pass 1234Petunias I can CRUD here items. All prices are on USD. If you need to use a dashboard only use the shadcn dashboard. We dont use custom made but only use shadcn compoments. My clients will log in with their own email account, they will provide first hand what email they will use so I can add them before hand, so they will need to add a passwrod first time they access. You have access to the supabase MCP  with read and write access."

## Execution Flow (main)
```
1. Parse user description from Input
   � If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   � Identify: actors, actions, data, constraints
3. For each unclear aspect:
   � Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   � If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   � Each requirement must be testable
   � Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   � If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   � If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## � Quick Guidelines
-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## Clarifications

### Session 2025-09-23
- Q: How should the system handle a deleted product that clients have already customized with their own prices? → A: Soft delete - Hide from new customizations but preserve existing client prices
- Q: What is the expected number of concurrent B2B clients accessing the platform? → A: Medium scale - 10-50 clients
- Q: How many products will your catalog contain? → A: Small catalog - Up to 100 products
- Q: Should clients be able to reset their password if forgotten? → A: Yes - Email-based password reset
- Q: How long should the system retain price history (both base prices and client customizations)? → A: 1 year - Annual comparisons (prices updated twice yearly)

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As an optics factory administrator, I need a B2B pricing platform where I can manage product catalogs and prices, while allowing my business clients to view base prices and customize them for their own B2C customers.

### Acceptance Scenarios
1. **Given** I am an admin user (anibalin@gmail.com), **When** I log in with my credentials, **Then** I can create, read, update, and delete products and their base prices in USD
2. **Given** I am a pre-authorized client, **When** I access the platform for the first time with my email, **Then** I am prompted to set a password
3. **Given** I am an authenticated client, **When** I view the product catalog, **Then** I see the factory's base prices and can create custom pricing for my own customers
4. **Given** I am a client modifying prices, **When** I update a product's price, **Then** the change only affects my view and doesn't impact other clients or base prices
5. **Given** I am an admin, **When** I add a new client email, **Then** that client can access the platform with first-time password setup

### Edge Cases
- What happens when a client tries to access without being pre-authorized?
- How does the system handle concurrent price modifications by multiple clients?
- When an admin deletes a product that clients have customized, the system performs a soft delete - hiding it from new customizations while preserving existing client prices
- How does the system handle invalid pricing inputs (negative values, non-numeric)?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST provide separate authentication for admin (factory) and client (B2B customer) users
- **FR-002**: Admin user MUST be able to perform full CRUD operations on product catalog and base prices (with soft delete for products having client customizations)
- **FR-003**: Admin MUST be able to pre-authorize client emails for platform access
- **FR-004**: Clients MUST set their own password on first access to the platform
- **FR-005**: System MUST display all prices in USD currency
- **FR-006**: Clients MUST be able to view factory base prices for all products
- **FR-007**: Clients MUST be able to create and modify their own custom prices without affecting base prices
- **FR-008**: System MUST maintain separate price sets for each client account
- **FR-009**: System MUST display product information from two main sections: MONOFOCALES (lenses) and specifications
- **FR-010**: Product catalog MUST include lens types: Stock Lenses, Laboratory Lenses, and ClearView finished products
- **FR-011**: Each product MUST have associated specifications including materials, ranges, diameters, and delivery times
- **FR-012**: System MUST persist all price modifications per client for future sessions
- **FR-013**: Admin MUST be able to view which clients have registered and are active
- **FR-014**: System MUST prevent unauthorized access to pricing information
- **FR-015**: Client price modifications MUST be isolated from other clients' data
- **FR-016**: System MUST retain price history for 1 year to support annual comparisons and semi-annual price updates
- **FR-017**: System MUST support 10-50 concurrent client users plus admin access
- **FR-018**: System MUST handle up to 100 products in the catalog
- **FR-019**: System MUST provide email-based password reset functionality for clients
- **FR-020**: Bulk operations [NEEDS CLARIFICATION: Should admin be able to bulk upload/update products via CSV/Excel?]

### Key Entities *(include if feature involves data)*
- **User**: Represents both admin and client accounts with email, password, role (admin/client), and registration status
- **Product**: Represents optical products with code, name, category (Stock/Laboratory/ClearView), base price in USD
- **ProductSpecification**: Contains technical details like materials, spherical range, cylindrical range, diameters, delivery time
- **ClientPricing**: Custom prices set by each client for products, linked to both User and Product
- **ProductCategory**: Main sections including MONOFOCALES FUTURE-X, MONOFOCALES TERMINADOS
- **Treatment**: Available treatments like anti-reflective, photochromic, UV protection with their specifications

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain (except FR-020 bulk operations - deferred to planning phase)
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---