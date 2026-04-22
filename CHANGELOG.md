# Changelog

All notable changes to this project will be documented in this file.

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
