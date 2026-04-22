# Changelog

All notable changes to this project will be documented in this file.

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
