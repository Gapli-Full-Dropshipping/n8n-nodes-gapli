# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-08-12

### Added

- **New resource: Message** — read buyer conversations, disputes and claims.
  - `Get Many Threads` — filter by Order ID, **Source Order ID**, Thread Type (message / dispute / claim / notification), Platform, Account ID and date range
  - `Get Thread` — full thread with its messages
  - ⚠️ **Disputes and claims have no internal Order ID.** They link to an order ONLY through `Source Order ID` (the marketplace order number). Filtering by Order ID alone runs without error and silently returns just the ordinary correspondence — missing exactly the threads that describe what went wrong.
  - Requires the **`messages` scope** on your API key (Dashboard → Integrations → API Keys → message icon). Read-only: no API key can ever send a message to a buyer.

- **Order → Include: Conversation / Diagnostics** — attach the buyer conversation and a deterministic order breakdown to `Get by ID`. Both blocks ride along on the request the workflow already makes, so **the number of HTTP calls does not change**.
  - `Diagnostics` needs no AI: wholesaler per item, `ordered → paid → shipped → delivered` timings, issue reason codes with labels, and warning flags (`multi_wholesaler_split`, `slow_dispatch`, `buyer_awaiting_reply`, `partially_cancelled`, …)

- **Order → Get Conversation Analysis** — AI conclusion for an order: `outcome`, `root_cause`, what went well, what went wrong, plus `evidence_message_ids`. Where the marketplace supplies a reason code, it is used verbatim (`root_cause_source: "structured"`) and the model may not override it.
  - **Paid plans only** (Commerce Plan and above). Without an active plan the endpoint returns **HTTP 402** with the list of qualifying plans.
  - Results are cached per conversation state — repeat calls return `cached: true` at no cost. Use `Force Refresh` only when you need a recompute.

- **Include Automated Messages** toggle (default **off**) on every conversation-bearing operation. GAPLI automated sends (invoice notifications, review requests, shipping updates) are roughly **half of all thread traffic**; leaving them in makes an AI analysis mostly about our own notifications rather than the buyer conversation. Hidden ones are still counted in `automated_messages_hidden`.

### Fixed

- **Order → Get by ID dropped sibling blocks** — the node returned `response.order` only. With `include=` the API puts `conversation` and `diagnostics` next to `order`, not inside it, so they would have been silently discarded. They are now merged into the output item.

### Backend (GAPLI API)

- `GET /api/v1/integrations/messages/threads` and `/messages/threads/{id}` — new
- `GET /api/v1/integrations/orders/{id}?include=conversation,diagnostics` — new parameters
- `GET /api/v1/integrations/orders/{id}/analysis` — new, paid plans
- New `messages` scope, deliberately separate from `read`: conversation content is your customers' personal data, so existing keys do not gain access to it automatically

---

## [1.2.3] - 2026-07-14

### Fixed

- **Critical: Exclude Parser IDs Ignored in Standard Mode** — the `Exclude Parser IDs` filter on Product → Get Many was parsed by the API but silently ignored in standard paginated mode (`Return All: false`). Excluded parsers (e.g. `exclude_parser_ids=2`) were still returned in results. The filter only worked with `Return All + Full Database Scan`.
  - **Root cause:** backend `getProducts` built its parser list without applying `excludeParserIds` — the filter was only wired into `scanAllProducts` and `getParsersSummary`

### Added

- **Offset Field — Manual Pagination** — new `Offset` parameter on Product → Get Many (visible when `Return All` is disabled). Previously the node hardcoded `offset=0`, so repeated calls always returned the same first page regardless of any `page` values passed via expressions. Use `offset = page_number × limit` to walk through results. The per-item `_meta` now includes `offset_applied` for downstream auditing.

### Improved

- **Filter Naming — Include-Parser Filter Discoverability** — the Filters → "Wholesaler Name or ID" field is now labeled **"Wholesaler / Parser ID Name or ID"** with an explicit description that it is the INCLUDE filter for a single parser catalog (API param: `parser_id`). Operators looking for a "Parser ID" include filter can now find it by name.
- **Exclude Parser IDs Description** — clarified that the field excludes parsers and points to the Wholesaler / Parser ID filter for single-catalog harvests

### Backend (GAPLI API)

- `GET /api/v1/integrations/products` — `exclude_parser_ids` is now applied consistently in ALL modes: standard pagination, `scan_all`, and `scan_mode=parsers_summary`
- **Note on multi-parser listing:** without `parser_id`, standard mode fills results from the lowest parser IDs first (parser 2 is first and very large). For catalog-wide or per-wholesaler harvests use `parser_id=<ID>` (per-parser pagination with `scan_all=true&page=N&per_page=M`) or the node's Full Database Scan mode

---

## [1.2.2] - 2026-05-23

### Fixed

- **Critical: Allegro Account Selector — Type Mismatch** — all account ID parameters across resources (Allegro Listing, Allegro Catalog, Duplicate Check, Offer Health, Marketplace Offers, Analytics, Sellability) now use runtime `Number()` conversion instead of TypeScript `as number` cast. n8n's `options` type serializes selected dropdown values as **strings** internally, so `this.getNodeParameter(…) as number` returned `"62"` (string) instead of `62` (number) — causing `Missing or invalid account_id (number required)` errors on all POST-body operations.
  - **Affected operations:** `sendProducts`, `checkReadiness`, `getStatus`, `lookupByEan`, `searchByPhrase`, `getCategoryParameters`, `duplicateCheck`, `offerHealth`, `searchOffers*`, `assessSellability`, `getSalesSummary`
  - **Root cause:** n8n options type stores values as strings after serialization, regardless of the `value` property type in the options array

### Improved

- **Sales Summary — Actual Gross/Net Revenue Fields** — new `total_revenue_gross_actual` and `total_revenue_net_actual` fields computed from order line items (`SUM(source_total_price_gross)` / `SUM(source_total_price_net)`). These are proper tax-based gross/net values, unlike the deprecated aliases which are currency totals.
- **Deprecation Notices** — stronger deprecation warnings on `total_revenue_gross`/`total_revenue_net` fields, including inline `_deprecation_notice` object in the response and updated n8n operation description

### Backend (GAPLI API)

- **Defensive account_id Parsing** — `marketplace-listing.ts`, `marketplace-duplicate-check.ts`, and `marketplace-offer-health.ts` now accept both string and number `account_id` via `Number()` conversion with `isNaN`/`<= 0` validation. Prevents type errors from curl, Postman, and third-party clients.

---

## [1.2.1] - 2026-05-13

### Fixed

- **Sales Summary — Corrected Revenue Field Naming** — the `summary` object returned by `getSalesSummary` now includes properly named fields:
  - `total_revenue_source_currency` — total paid in source transaction currency (PLN, CZK, EUR etc.)
  - `total_revenue_pln` — total converted to PLN
  - `revenue_source_currency` / `revenue_pln` in `daily_breakdown[]`
  - Old `total_revenue_gross`/`total_revenue_net` and `revenue_gross`/`revenue_net` preserved as **deprecated aliases** for backward compatibility
  - **Root cause:** these fields were mapping to `SUM(source_amount_paid)` / `SUM(converted_amount_paid)` (currency totals), NOT to tax-based gross/net revenue — causing invalid `gross_net_ratio` calculations (e.g. 65.427 instead of ~1.23)

### Added

- **Sales Summary — Account & Store Filters** — new `Account ID` and `Store ID` fields on the Sales Summary operation:
  - Scope revenue data to a specific marketplace account (e.g. `account_id=62` for eshop_masters)
  - Scope to a specific store (e.g. `store_id=143`)
  - Leave at 0 (default) for aggregate data across all accounts/stores
  - Enables per-account financial snapshots in n8n workflows

### Changed

- Updated `getSalesSummary` operation description to clarify that revenue fields use source_currency/PLN naming convention
- `_deprecated_fields` metadata now includes `summary.total_revenue_gross` and `summary.total_revenue_net` entries

---

## [1.2.0] - 2026-05-07

### Added

- **🎯 Assess Sellability** — new Product operation for pre-listing readiness checks:
  - Batch assessment of up to 100 SKUs per request
  - Returns per-product `sellability_score` (0–100), `validation_status` ('ready' | 'partial' | 'blocked' | 'missing_data'), and `publication_allowed` flag
  - Detailed `checks` object: EAN, SKU, name, price, images, stock, category, dimensions, blocked flags
  - Machine-readable `block_reason_codes` array (e.g. `['no_ean', 'zero_stock', 'allegro_blocked']`) for workflow automation
  - Optional Allegro Account context: shows if product is already listed, current listing status, and offer ID
  - Summary with `total_sellable`, `total_blocked`, `total_partial`, `avg_sellability_score`
  - Use case: Before bulk-listing on Allegro, validate which products pass all requirements

- **📊 Data Context Annotations (`_data_context`)** — every analytics response now includes metadata explaining:
  - `source`: where the data comes from ('order_history' vs 'catalog_assessment')
  - `scope`: whether it's 'your_account' or 'platform_wide_anonymized'
  - `represents_sellability`: whether products are confirmed sellable or just analytics records
  - Human-readable `note` clarifying the meaning of each endpoint

- **💰 Currency Contract (`_currency_info`)** — all monetary responses now include:
  - Explicit confirmation that values are in **full currency units** (e.g. 110.36 PLN), NOT subunits (grosze/cents)
  - Per-field documentation with currency type and description
  - Clarification of source_currency vs PLN for cross-border orders

- **🏷️ `sellable` Flag on Products** — lightweight boolean added to every product in Get Many responses:
  - Quick assessment: `price > 0 AND stock > 0 AND valid_ean AND not_blocked`
  - Enables filtering in n8n workflows without calling the full Assessment endpoint

### Changed

- **Analytics Descriptions** — all analytics operation descriptions now clarify data sources:
  - **Top Products**: "YOUR best-selling products from actual completed orders"
  - **Global Top Products**: "Platform-wide best sellers (anonymized) — NOT all may be available for listing"
  - **Sales Summary**: "Revenue in source currency + PLN. All values in full units"

### Fixed

- **Sales Summary — Misleading Field Names** — added correct field aliases:
  - `total_revenue_source_currency` (= source_amount_paid in transaction currency)
  - `total_revenue_pln` (= converted_amount_paid in PLN)
  - Old fields `total_revenue_gross`/`total_revenue_net` preserved with `_deprecated_fields` annotation

### Backend (GAPLI API)

- New `sellabilityService.ts` with `assessProductSellability()` and `batchAssessSellability()` functions
- New `GET /api/v1/integrations/products/{sku}/sellability` — single SKU assessment
- New `POST /api/v1/integrations/products/batch-sellability` — batch assessment (up to 100 SKUs)
- Added `sellable: boolean` to `ProductResponse` type (list endpoints)
- Added `_sellability: ProductSellabilityResponse` to `ProductDetailResponse` (Get by SKU)
- Added `_data_context` and `_currency_info` to Top Products, Sales Summary, and Global Top Products responses
- Added `_deprecated_fields` annotations for misleading Sales Summary field names
- New TypeScript interfaces: `ProductSellabilityResponse`, `DataContextAnnotation`, `CurrencyMetadata`

---

## [1.1.1] - 2026-05-02

### Improved

- **🔽 Dynamic Allegro Account Dropdown** — all Allegro Account ID fields across resources (Allegro Catalog, Allegro Listing, Duplicate Check, Offer Health, Marketplace) now feature a dynamic dropdown that fetches your connected accounts from the GAPLI API:
  - Shows Allegro login name, associated store name, and account status (🟢 active / 🔴 inactive)
  - Sandbox accounts clearly marked with `[SANDBOX]` badge
  - Still supports manual ID entry via n8n expressions for advanced users
  - Powered by `loadOptionsMethod: 'getAllegroAccounts'` calling `GET /marketplace/accounts`

## [1.1.0] - 2026-05-02

### Added

- **📋 Allegro Listing** — new resource for automated product listing on Allegro marketplace:
  - **Send Products to Allegro** — queue products for publication by inserting into system DB with `pending` status; existing CRON engine handles final Allegro API publication
  - **Check Listing Readiness** — pre-flight dry run validates account ownership, partition availability, and product eligibility without any side effects
  - **Get Listing Status** — monitor publication status of products on an account (pending/sent/active/ended/error) with per-SKU detail and summary counters
  - Configurable price range filtering (min/max gross PLN)
  - Optional shipping rate ID override (auto-match by default based on product dimensions)
  - Dry-run mode available on send operation for safe testing
  - All listings tagged with `source: 'n8n-api'` for audit traceability

### Technical

- **Shared Listing Service** — new `listingService.ts` wraps existing `send-to-allegro.ts` pipeline ensuring identical behavior between dashboard UI and n8n API
- **Integrations Hub Endpoint** — `POST /api/v1/integrations/marketplace/listing` with 3 actions: `send`, `check-readiness`, `get-status`
- Products land in `produkty_wyslane_na_allegro` table with `pending` status, CRON publication sync handles the rest — zero changes to existing sync engine

## [1.0.0] - 2026-05-02

### Added

- **🏪 Allegro Catalog** — new resource enabling direct access to Allegro's official product catalog via REST API proxy:
  - **Lookup by EAN** — search Allegro product catalog by EAN/GTIN barcode, returns official product cards with images, parameters, and category info
  - **Search by Phrase** — keyword/phrase search across Allegro catalog with configurable result limit (1-50)
  - **Get Category Parameters** — retrieve required and optional parameters for any Allegro category (essential for listing creation workflows)
- All Allegro Catalog operations are proxied through the operator's Allegro OAuth token — no separate API keys needed
- Token validation with clear error messages when tokens expire
- Ownership verification ensures operators can only access their own Allegro accounts

### Backend

- New service functions: `proxyAllegroCatalogLookup()`, `proxyAllegroCategoryParameters()`
- New helper: `getAccountForProxy()` — handles token validation, expiry check, and ownership verification
- New API endpoints:
  - `GET /api/v1/integrations/allegro/catalog` — catalog product search (EAN/phrase modes)
  - `GET /api/v1/integrations/allegro/category-parameters` — category parameter retrieval
- Allegro REST API URLs configured for all 4 marketplaces (PL, CZ, SK, HU)
- Full API logging with duration, request params, and error tracking

### Changed

- Version bumped from 0.10.0 → **1.0.0** — milestone: full Allegro integration stack complete (GAPLI DB + Allegro API proxy)

---

## [0.10.0] - 2026-05-02

### Added

- **🔄 Duplicate Check** — new resource for multi-signal duplicate detection across all Allegro accounts:
  - **Check Product Identity** operation accepts SKU, EAN, and/or product name (at least one required)
  - Multi-signal matching: returns `matched_by` array showing which signals hit (e.g. `['SKU', 'EAN']`)
  - Returns `is_duplicate`, `duplicate_count`, and detailed `matches[]` with account login, offer ID, status, and price
  - Supports optional Account ID filter to scope check to a single account
  - Use case: Before listing a new product, verify it's not already listed on any of your accounts
- **🏥 Offer Health** — new resource for data-completeness quality scoring:
  - **Analyze Offers** operation accepts comma-separated SKUs (max 200)
  - Scores each offer 0-100 based on: offer ID (20pts), active status (15pts), product name (15pts), EAN (15pts), price (15pts), stock (10pts), not-ended bonus (10pts)
  - Returns per-offer `health_score`, `issues[]` (with severity: critical/warning/info), and `data_completeness` map
  - Summary includes `average_score`, `critical_issues_count`, `total_analyzed`
  - Use case: Monitor and alert on offer quality degradation across your portfolio

### Backend (GAPLI API)

- New `POST /api/v1/integrations/marketplace/duplicate-check` endpoint with:
  - OR-based multi-signal search (SKU exact + EAN exact + Name ILIKE)
  - Deduplication by (account_id, sku) with `matched_by` merge
  - Account ownership verification via stores table
- New `POST /api/v1/integrations/marketplace/offer-health` endpoint with:
  - Per-SKU health scoring across all Allegro partitions
  - Dynamic column detection (offer_id, status, ean, name, price, stock)
  - Aggregate summary with critical issue count
- New service functions: `checkDuplicateOffers()`, `analyzeOfferHealth()` in `integrationsService.ts`

---

## [0.9.0] - 2026-05-02

### Added

- **🔎 Lookup By EAN** — new Product operation for exact single-EAN lookup. Returns the matched product with `_lookup` metadata (`method: 'EAN_EXACT'`, `match_status: 'MATCHED' | 'NO_MATCH'`). Uses the existing batch-ean endpoint internally but provides a cleaner UX for single-product lookups. No-match results return a structured `NO_MATCH` response instead of throwing an error.
- **📋 Get Already Listed Evidence** — new Product operation that checks which SKUs are already listed on specific Allegro accounts. Returns per-SKU auditable evidence:
  - `already_listed` — boolean flag
  - `listed_on_accounts_count` — number of accounts the product is listed on
  - `listed_on_accounts[]` — array with `account_id`, `allegro_login`, `offer_id`, `match_basis`, `listing_status`
  - Supports up to 500 SKUs and 50 account IDs per request
  - Designed for audit-friendly n8n workflows — operators can now verify *why* a product was excluded before acting on it
- **🔍 Search Offers by SKU** — new Marketplace operation to find Allegro offers by exact SKU across all operator accounts. Returns offer details with `_search` metadata and account enrichment data (login, company name, marketplace country).
- **🔍 Search Offers by EAN** — new Marketplace operation to find Allegro offers by exact EAN/GTIN barcode. Uses `gapli_product_ean` column (dynamically detected per partition).
- **🔍 Search Offers by Name** — new Marketplace operation for partial product name search (case-insensitive ILIKE). Useful for finding duplicate/similar offers across accounts.
- All three Search Offers operations support optional Account ID filter to scope search to a single account.

### Backend (GAPLI API)

- New `POST /api/v1/integrations/products/already-listed-evidence` endpoint with:
  - Per-SKU evidence from `produkty_wyslane_na_allegro` partitions
  - Account login names from `allegro_accounts` table
  - Dynamic column detection for `allegro_offer_id` and `allegro_offer_status`
  - Summary with `already_listed_count`, `not_listed_count`, `accounts_checked`
- New `GET /api/v1/integrations/marketplace/offers?mode=sku|ean|name&q=...` endpoint with:
  - Cross-partition search across all operator's Allegro accounts
  - Dynamic column detection per partition (offer_id, status, ean, name, price, stock)
  - Account metadata enrichment (login, company, marketplace country)
  - Search mode + query metadata in every result item for auditing
- New service functions: `getListedEvidenceForSkus()`, `searchAllegroOffers()` in `integrationsService.ts`

---

## [0.8.0] - 2026-05-02

### Added

- **🌍 Market Selector (Region Scoping)** — new dynamic dropdown on Product, Wholesaler, Analytics (Stock Alerts, Global Price Benchmarks), and Marketplace (Get Accounts) resources. Powered by `/api/v1/integrations/markets` endpoint, displays markets with country flag emojis (e.g. `🇵🇱 Poland`). Defaults to `— All Markets —` (no filter) for full backward compatibility.
- **🌐 Market Resource** — new resource with `Get Many` operation to list all available markets with country codes, currencies, and flags. Useful for building dynamic workflow logic based on region data.
- **🔎 Batch EAN Lookup** — new Product operation to look up multiple products by EAN/GTIN barcodes in a single request (up to 100). Supports textarea and comma-separated input. Optional market scoping.
- **🔎 Batch SKU Lookup** — new Product operation to look up multiple products by SKU identifiers in a single request (up to 100). Supports textarea and comma-separated input. Optional market scoping.
- **⚡ Trigger: Market Filter** — new option in GAPLI Trigger for the "New Product" event. Scope product detection to a specific market/region, reducing noise and improving relevance.

### Changed

- All `Market` fields use `loadOptionsMethod: 'getMarkets'` for dynamic, API-driven dropdown population
- Market selector is **optional** on every resource — omitting it preserves existing all-market behavior (full backward compatibility)
- Removed inter-page delay (`INTER_PAGE_DELAY_MS`) from Full Database Scan — n8n and API-level rate limiting are sufficient

### Backend Requirements

- Requires GAPLI API endpoint `GET /api/v1/integrations/markets` (deployed in previous update)
- Requires GAPLI API endpoints `POST /api/v1/integrations/products/batch-ean` and `POST /api/v1/integrations/products/batch-sku`
- All existing endpoints accept optional `market_id` query parameter

---

## [0.7.0] - 2026-04-27

### Added

- **Max Items Safety Parameter** — new `Max Items` field (100–50,000, default 5,000) visible when Full Database Scan is enabled. Prevents n8n memory issues by capping how many products are fetched. Previously, Full Database Scan had no user-controllable limit.
- **Pagination Metadata in Output (`_meta`)** — every product now includes a `_meta` object with scan context:
  - **Normal (limited) fetch**: `scan_mode: 'NORMAL_LIMITED'`, `total_matching_count`, `has_more`, `limit_applied`, `returned_count`
  - **Full Database Scan**: `scan_mode: 'FULL_DATABASE_SCAN'`, `max_items_applied`, `truncated_by_max_items`, `returned_count` + parsers summary data
  - Downstream nodes can now reliably determine if results were truncated and how many total matches exist
- **Exclude Filter Evidence (`_exclude_meta`)** — when using "Exclude Already Listed on Accounts", the `_meta` now includes `_exclude_meta` with `excluded_skus_count` and `accounts_checked` for audit trail

### Fixed

- **Backend: `manufacturer` column crash** — the `manufacturer` column was **hardcoded** in SQL queries without dynamic existence checking. Parser partitions without a `manufacturer` column caused HTTP 500 errors during Full Database Scan. Now treated as optional via `information_schema` check, returning `NULL AS brand` when absent.
- **Backend: `name` column in Get by SKU** — `getProductBySku()` also hardcoded `name` without checking existence. Now uses dynamic column verification consistent with `getProductsFromParser()`.
- **Backend: Silent error swallowing** — `getParsersSummary()` and `scanAllProducts()` catch blocks now log `parser_id` and error message via `console.error()` instead of silently continuing. This enables identification of which parser partition causes failures.

### Changed

- Full Database Scan hint updated to reference Max Items instead of stating "Limit is ignored"
- `per_page` in Full Scan now dynamically adjusts to `Math.min(PER_PAGE, maxItems - currentCount)` to avoid over-fetching

---

## [0.6.0] - 2026-04-26

### Fixed

- **Critical: Full Database Scan + Search returns HTTP 500** — the `name` column was hardcoded in SQL queries without verifying it exists in each parser partition. Older partitions without a `name` column caused `column "name" does not exist` errors during Full Database Scan. Now `name` is treated as an optional column (dynamically checked via `information_schema`), and search gracefully falls back to SKU-only matching when `name` is absent.
- **Critical: Search + Exclude Already Listed returns HTTP 500** — same root cause as above; additionally added a safety cap (50,000 SKUs max) on the exclude list to prevent OOM/timeout on large datasets.
- **Exclude Oversized performance** — eliminated a redundant `information_schema` query per partition; now reuses the column existence check from the main batch query.

### Added

- **EAN/GTIN Exact Match Filter** — new filter in Product → Get Many to search by exact EAN/GTIN barcode. Uses `global_unique_id = $N` SQL condition for precise matching. High priority request from user testing.
- **Exclude Already Listed — Verification Metadata** — when using the `Exclude Already Listed on Accounts` filter, the response now includes `_exclude_meta` with:
  - `excluded_skus_count` — number of SKUs excluded from results
  - `accounts_checked` — the account IDs that were checked
- **Full Database Scan UI Hint** — added a `hint` to the Full Database Scan toggle explaining that it requires Return All to be enabled and that the Limit setting is ignored in this mode.

### Changed

- `ORDER BY` now uses `sku ASC` as fallback when the `name` column doesn't exist in a partition (previously hardcoded to `name ASC`)
- Improved Exclude Already Listed description in the node UI to reference the new `_exclude_meta` verification data

### Backend (GAPLI API)

- `ean` query parameter — exact match filter on `global_unique_id` column
- `_exclude_meta` object in response when exclude filter is active
- Dynamic column verification moved before WHERE clause construction (was previously done after, causing the column-not-found crash)

---

## [0.5.0] - 2026-04-26

### Added

- **Parser-First Pagination (P0 Fix)** — Full Database Scan no longer truncates at 50,000 products:
  - Node automatically fetches `parsers_summary` first (list of all wholesaler parsers with product counts)
  - Then iterates each parser page-by-page (5,000 products/page) to collect the **complete** catalog
  - Eliminates the `GAPLI_RESPONSE_TRUNCATED_AT_50K` blocker — all 56,557+ products now retrieved
  - Inter-page delay (250ms) prevents rate limit exhaustion
  - Each product includes `_meta` with parsers summary for downstream auditing
- **Has EAN/GTIN Filter** — new boolean filter to return only products with a valid EAN/GTIN barcode (`has_ean=true`)
- **Exclude Parser IDs** — new filter to skip specific wholesaler parsers (comma-separated IDs, e.g. `5,12,29`) — useful for excluding parsers with digital/service products
- **Category IDs in Response** — products now include `category_ids` field (wholesaler XML category IDs) in Get Many responses, reducing `raw_category=UNKNOWN` issues

### Changed

- Full Database Scan uses multi-step API flow (`parsers_summary` → per-parser pagination) instead of single 50K-capped request
- `_meta` now includes `parsers_count`, `total_before_filters`, `total_after_filters` from parsers summary

### Backend (GAPLI API)

- New `scan_mode=parsers_summary` endpoint returns parser list with per-parser product counts
- Per-parser pagination via `parser_id` + `page` + `per_page` query params
- `has_ean=true` filter — SQL-level `global_unique_id IS NOT NULL` condition
- `exclude_parser_ids` filter — skips specified parser partitions entirely
- `xml_category_ids` column added to product list response (was previously only in Get by SKU)

---

## [0.4.0] - 2026-04-25

### Added

- **Product Get Many — Full Database Scan Mode** — new toggle "Full Database Scan" (visible when Return All is enabled):
  - Bypasses standard pagination limits — fetches **every** matching product across all parser partitions
  - Backend iterates per-parser with internal batch pagination (2000 products/batch), collecting up to **50,000** products
  - Each product includes `_meta` object with scan statistics:
    - `total_before_filters` — total products in database (unfiltered)
    - `total_after_filters` — how many matched the filters
    - `returned_count` — how many were actually returned
    - `truncated` — `true` if the safety cap was reached
    - `parsers_scanned` — number of wholesaler partitions scanned
    - `parser_ids` — list of scanned parser IDs
  - Use case: Allegro offer selection workflows that need to scan the complete catalog with filters
- **Improved Pagination** — page size increased from 100 → 500 for fewer API calls during "Return All"
- **Safety Cap** — max 100 pages (50,000 items) pagination safety to prevent infinite loops
- **Increased Limit** — per-request product limit raised from 200 → 1,000
- **Wholesaler Dropdown with Search** — `Parser ID` filter replaced with a searchable dropdown that loads active wholesalers dynamically from the API. Users can now select by name instead of typing a numeric ID.

---

## [0.3.0] - 2026-04-24

### Added

- **Product Get Many — Server-Side Filters** — 5 new filters applied before pagination for efficient data retrieval:
  - `Minimum Stock` (`stock_min`) — only return products with stock quantity ≥ N (e.g. skip items with stock = 1)
  - `Min Gross Price` (`price_gross_min`) — only return products with gross price ≥ N PLN
  - `Max Gross Price` (`price_gross_max`) — only return products with gross price ≤ N PLN
  - `Exclude Oversized` (`exclude_oversized`) — exclude products flagged as oversized
  - `Exclude Already Listed on Accounts` (`exclude_already_listed_on_accounts`) — comma-separated Allegro account IDs; products already listed on these accounts are excluded from results
- All filters are executed server-side in SQL before pagination, ensuring accurate counts and efficient data transfer
- **Analytics — Global (Platform-Wide) Operations** — 4 new operations providing anonymized, system-wide insights:
  - `Get Global Top Products` — best-selling products across ALL operators (quantity-based ranking, avg gross price, no per-user revenue)
  - `Get Global Category Trends` — wholesaler/category popularity with trend direction (up/down/stable) and % change vs previous period
  - `Get Platform Stats` — platform-wide counters: orders (7d/30d), active operators, catalog size, active wholesalers, marketplace accounts
  - `Get Global Price Benchmarks` — avg/min/max gross prices per wholesaler for competitive price analysis

---

## [0.2.4] - 2026-04-22

### Fixed

- **Trigger node error visibility** — the trigger was silently swallowing ALL errors (including API failures, auth issues, timeouts), returning "No trigger output" with no indication of what went wrong. Now only the very first poll is silent (to initialize state); subsequent errors are properly surfaced in the n8n UI so users can diagnose and fix issues.

---

## [0.2.3] - 2026-04-22

### Fixed

- **Get Product by SKU — Graceful 404 Handling** — when a product no longer exists in the catalog (e.g., removed by wholesaler), the node now returns `{ sku, found: false, error: "..." }` instead of throwing a hard error. This enables smooth chaining from Analytics "Top Products" → "Get by SKU" without workflow crashes.

---

## [0.2.2] - 2026-04-22

### Fixed

- **Critical: Infinite Loop in "Return All" Pagination** — fixed a bug where `gapliApiRequestAllItems()` could loop indefinitely when an API page returned 0 items but `has_more` was still `true` (due to COUNT/FETCH mismatch on partitioned tables). The pagination now breaks immediately when a page returns no items, preventing n8n from spinning forever on "Get All Products" and "Get All Marketplace Products" operations.

---

## [0.2.1] - 2026-04-22

### Fixed

- **Rate Limit Handling** — automatic retry with exponential backoff on HTTP 429 errors:
  - Reads `Retry-After` header and `rate_limit.retry_after_seconds` from response body
  - Up to 3 retries before failing
  - 250ms inter-page delay during pagination to prevent rate limit exhaustion
- **Marketplace Products** — fixed 502 Bad Gateway when using "Return All" without account filter:
  - Now iterates per-account partitions instead of scanning the main partitioned table
  - Proper cross-partition pagination with offset/limit handling

### Added

- **Marketplace Products — Status Filter** — new dropdown to filter by offer status:
  - `Active Only` (default) — shows only live offers
  - `Ended Only` — shows concluded/ended offers
  - `All Statuses` — shows everything
- **Marketplace Products — Account Data** — each product now includes:
  - `account_id` — marketplace account ID
  - `platform` — always `'allegro'` for now
  - `marketplace_account_name` — human-readable account name
- **Marketplace Accounts — Enriched Data** — accounts now include additional fields:
  - `allegro_user_id`, `allegro_login`, `allegro_email`
  - `company_name`, `company_tax_id`
  - `marketplace_id`, `marketplace_country`
  - `store_id`, `is_sandbox`, `is_primary`, `account_type`

---

## [0.2.0] - 2026-04-22

### Added

- **Store Resource** — new resource for managing operator stores:
  - Get Many: retrieve all stores for the authenticated operator
- **Industry Resource** — new resource for browsing product industries:
  - Get Many: list available industries with wholesaler counts
- **Analytics Resource** — powerful analytics hub with 4 operations:
  - Top Products: ranking of best-selling products by period (7d/30d/90d)
  - Sales Summary: aggregated financial metrics (revenue, orders, AOV)
  - Stock Alerts: intelligent low-stock detection with days-until-stockout calculation
  - Marketplace Health: Allegro account performance metrics (sync rate, listing quality)

### Enhanced

- **Orders** — added `marketplace_account_name` field to order responses (shows Allegro/Erli account name)
- Updated README with new resources documentation

---

## [0.1.0] - 2026-04-22

### Added

- 🎉 Initial release of the GAPLI n8n community node
- **Gapli Node** — Regular node with full CRUD operations:
  - Products: Get Many, Get by SKU
  - Orders: Get Many, Get by ID
  - Wholesalers: Get Many
  - Marketplace Accounts: Get Many
  - Marketplace Products: Get Many
  - Health Check
- **Gapli Trigger Node** — Polling trigger for real-time events:
  - New Order detection
  - Order Status Change detection
  - New Product detection
- **AI Agent Tool** — `usableAsTool: true` for AI workflow integration
- **GapliApi Credentials** — API Key authentication with health check validation
- Professional SVG icons (light & dark mode)
- Comprehensive README documentation
- GitHub Actions CI/CD with npm provenance attestation
