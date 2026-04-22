# n8n-nodes-gapli

[![npm version](https://img.shields.io/npm/v/n8n-nodes-gapli.svg)](https://www.npmjs.com/package/n8n-nodes-gapli)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE.md)
[![n8n community](https://img.shields.io/badge/n8n-community%20node-blueviolet)](https://docs.n8n.io/integrations/community-nodes/)

This is an n8n community node for **[GAPLI](https://gapli.com)** — an automated dropshipping platform. It lets you manage products, orders, wholesalers, and marketplace accounts directly from your n8n workflows.

**GAPLI** is a B2B SaaS platform that enables operators to run automated dropshipping businesses across marketplaces (Allegro, Erli) and e-commerce stores (WooCommerce, PrestaShop). It handles product catalogs, order fulfillment, price management, inventory synchronization, and multi-marketplace integrations — all from a single dashboard.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

---

[Installation](#installation) · [Nodes](#nodes) · [Credentials](#credentials) · [Operations](#operations) · [AI Agent Tool](#ai-agent-tool) · [Usage Examples](#usage-examples) · [Compatibility](#compatibility) · [Resources](#resources)

---

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

**npm package name:** `n8n-nodes-gapli`

### Quick Install via n8n UI

1. Go to **Settings → Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-gapli` and click **Install**

### Manual Install (self-hosted n8n)

```bash
cd ~/.n8n
npm install n8n-nodes-gapli
```

Then restart n8n.

---

## Nodes

This package includes **two nodes** and **one credential type**:

### 🟣 GAPLI Node (Regular + AI Tool)

The main node for interacting with the GAPLI API. Supports all CRUD operations across multiple resources. Also available as an **AI Agent Tool** — connect it to an AI Agent node and let AI manage your dropshipping operations.

### ⚡ GAPLI Trigger Node (Polling)

A trigger node that polls the GAPLI API at regular intervals and fires your workflow when events occur:

- **New Order** — triggers when a new order is placed
- **Order Status Changed** — triggers when an order transitions between statuses
- **New Product** — triggers when new products appear in the catalog

---

## Credentials

### GAPLI API Key

To use this node, you need a GAPLI API key:

1. Log in to your [GAPLI Dashboard](https://gapli.com/dashboard)
2. Navigate to **Integrations** (sidebar menu)
3. Go to the **API Keys** tab
4. Click **Generate New Key**
5. Copy the key (starts with `gapli_`)
6. In n8n, create new **GAPLI API** credentials and paste the key

| Field | Description |
|---|---|
| **API Key** | Your GAPLI API key (starts with `gapli_`) |
| **Base URL** | Default: `https://gapli.com`. Change only for staging/development. |

The credential includes an automatic **connection test** that calls the `/health` endpoint to verify your API key.

---

## Operations

### 📦 Product

| Operation | Description |
|---|---|
| **Get Many** | Retrieve a list of products from your catalog. Supports filters: parser ID, SKU, search text, availability. |
| **Get by SKU** | Retrieve a single product by its SKU (Stock Keeping Unit). |

### 🛒 Order

| Operation | Description |
|---|---|
| **Get Many** | Retrieve a list of orders. Filter by status, date range (from/to). |
| **Get by ID** | Retrieve a single order by its numeric ID. |

### 🏭 Wholesaler

| Operation | Description |
|---|---|
| **Get Many** | Retrieve the list of available wholesalers/suppliers. Filter by active status. |

### 🏪 Marketplace

| Operation | Description |
|---|---|
| **Get Accounts** | Retrieve connected marketplace accounts (Allegro, Erli). |
| **Get Products** | Retrieve products listed on marketplace accounts. Filter by account ID and platform. |

### 🏬 Store

| Operation | Description |
|---|---|
| **Get Many** | Retrieve all stores (WooCommerce, PrestaShop, etc.) for the authenticated operator. |

### 🏷️ Industry

| Operation | Description |
|---|---|
| **Get Many** | List available product industries with wholesaler counts per industry. |

### 📊 Analytics

| Operation | Description |
|---|---|
| **Top Products** | Get a ranking of best-selling products by period (7 days, 30 days, 90 days). |
| **Sales Summary** | Aggregated financial metrics: total revenue, order count, average order value. |
| **Stock Alerts** | Intelligent low-stock detection with estimated days until stockout. |
| **Marketplace Health** | Allegro account performance: sync rate, listing quality, error rates. |

### 💚 Health

| Operation | Description |
|---|---|
| **Check** | Verify the GAPLI API status and your authentication. Returns service info, rate limits, and available endpoints. |

---

## AI Agent Tool

The GAPLI node is configured with `usableAsTool: true`, which means it can be used as a **tool for AI Agent nodes** in n8n.

### How to use:

1. Add an **AI Agent** node to your workflow
2. Connect the **GAPLI** node as a tool
3. The AI agent can now autonomously:
   - Search and retrieve products
   - Check order statuses
   - List marketplace accounts
   - Monitor inventory

This is particularly useful for building **conversational e-commerce assistants** or **autonomous dropshipping agents**.

---

## Usage Examples

### Example 1: New Order Notification to Slack

```
GAPLI Trigger (New Order) → Slack (Send Message)
```

Set up the GAPLI Trigger with "New Order" event, then format and send order details to your Slack channel.

### Example 2: Daily Inventory Check

```
Schedule Trigger (Daily) → GAPLI (Get Many Products, available=true) → Google Sheets (Append)
```

Automatically export your available inventory to a Google Sheet every day.

### Example 3: Order Status Tracking

```
GAPLI Trigger (Order Status Changed) → IF (status=shipped) → Email (Send)
```

Send an email notification when orders are shipped.

### Example 4: AI-Powered Product Assistant

```
Chat Trigger → AI Agent → GAPLI Tool (Products/Orders)
```

Build a conversational assistant that can answer questions about your products, orders, and inventory using natural language.

---

## Compatibility

| Requirement | Version |
|---|---|
| **n8n** | v1.0.0 or higher |
| **Node.js** | v22 or higher |
| **GAPLI API** | v1.0 |

Tested on n8n self-hosted and n8n Cloud.

---

## Resources

- **[GAPLI Dashboard](https://gapli.com/dashboard)** — Platform dashboard & API key management
- **[GAPLI API Documentation](https://gapli.com/dashboard/integrations-hub)** — Full API reference
- **[n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)** — How to install community nodes
- **[n8n Community Forum](https://community.n8n.io/)** — Get help and share workflows

---

## Version History

### 0.2.0 (2026-04-22)

- ✨ **New: Store Resource** — retrieve operator stores
- ✨ **New: Industry Resource** — browse product industries with wholesaler counts
- ✨ **New: Analytics Resource** — 4 operations: Top Products, Sales Summary, Stock Alerts, Marketplace Health
- 🔧 **Enhanced: Orders** — added `marketplace_account_name` field showing Allegro/Erli account name

### 0.1.0 (2026-04-22)

- 🎉 Initial release
- GAPLI Node with Product, Order, Wholesaler, Marketplace, and Health resources
- GAPLI Trigger Node with polling support for New Order, Order Status Changed, and New Product events
- AI Agent Tool support (`usableAsTool`)
- GapliApi credentials with connection testing
- Professional SVG icons (light & dark mode)

---

## License

[MIT](LICENSE.md) — © 2026 GAPLI Global LTD
