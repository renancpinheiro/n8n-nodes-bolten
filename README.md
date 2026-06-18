# n8n-nodes-bolten

[![npm version](https://img.shields.io/npm/v/n8n-nodes-bolten.svg)](https://www.npmjs.com/package/n8n-nodes-bolten)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is an n8n community node for the [Bolten](https://bolten.io) platform — a unified CRM, WhatsApp, and AI solution for managing customer relationships, sales pipelines, and automated communications.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Trigger node](#trigger-node)
[Compatibility](#compatibility)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

**Package name:** `n8n-nodes-bolten`

### n8n Cloud

1. Go to **Settings → Community nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-bolten`
4. Accept the risk notice and click **Install**

### Self-hosted

Set `N8N_COMMUNITY_PACKAGES_ENABLED=true` and install via the same UI flow above, or run inside your n8n container:

```bash
npm install n8n-nodes-bolten
```

## Operations

The package provides two nodes: **Bolten** (actions) and **Bolten Trigger** (webhook).

### Bolten — Project

| Operation | Description |
|---|---|
| Get Many | List all projects in your Bolten workspace |
| Get Components | Get all components (CRM, Kanban, etc) inside a project |

### Bolten — Contact

| Operation | Description |
|---|---|
| Create | Create a contact with dynamic attributes |
| Get | Retrieve a contact by ID |
| Get Many | List contacts (with auto-pagination) |
| Update | Patch a contact's attributes |
| Delete | Remove a contact |
| Get Schema | Fetch the dynamic field schema for the component |

### Bolten — Opportunity

| Operation | Description |
|---|---|
| Create | Create an opportunity |
| Get | Retrieve an opportunity by ID |
| Get Many | List opportunities (with auto-pagination) |
| Update | Patch an opportunity's attributes |
| Delete | Remove an opportunity |
| Get Schema | Fetch the dynamic field schema |
| Associate Contact | Link a contact to an opportunity |
| Dissociate Contact | Remove the linked contact |
| Add Product | Add a product line item |
| Update Product | Update an existing product line item |
| Remove Product | Remove a product line item |
| Create Task | Add a task to the opportunity |
| Update Task | Update an existing task |
| Remove Task | Delete a task |

### Dynamic attributes

Bolten stores resource data inside a flexible `attributes` object whose schema is defined per workspace component. The node supports two input modes:

- **Key/Value** — add attributes one by one with a name and value
- **Raw JSON** — provide the full attributes object as JSON (recommended for dynamic data from expressions)

Use the **Get Schema** operation to discover the available attribute names for your specific component.

## Credentials

You need a Bolten API key. To obtain one:

1. Log in to your Bolten workspace at [app.bolten.io](https://app.bolten.io)
2. Navigate to **Configurações → Integrações → API**
3. Generate a new API key
4. In n8n, create a new **Bolten API** credential and paste the key

The credential test calls `GET /clients/api/v1/projects` to verify the key is valid.

## Trigger node

The **Bolten Trigger** node receives webhook events from your Bolten workspace.

### Supported events

- `opportunity.created` — fired when a new opportunity is created
- `opportunity.transitioned` — fired when an opportunity moves between stages
- `opportunity.won` — fired when an opportunity is marked as won
- `opportunity.lost` — fired when an opportunity is marked as lost

### Setup

1. Add a **Bolten Trigger** node to your workflow
2. Activate the workflow to get the production webhook URL
3. Copy the **Webhook URL** shown in the node
4. In Bolten, go to **Configurações → Integrações → Webhooks**
5. Register the URL and select the events you want to receive
6. Save — your workflow will now fire on each matching event

Leave **Events** empty in the node to receive all events; or select specific events to filter at the n8n side.

## Compatibility

- Minimum n8n version: **1.0.0**
- Tested against n8n: **1.123.x**
- Node API version: **1**

## Resources

- [Bolten website](https://bolten.io)
- [Bolten API docs](https://docs.bolten.io)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Report a bug](https://github.com/renancpinheiro/n8n-nodes-bolten/issues)

## License

[MIT](LICENSE)
