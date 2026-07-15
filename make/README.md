# Bolten app for Make (make.com)

Source of truth for the official **Bolten** app on Make, mirroring the feature set of the
published n8n community node in this repository. The goal is a **verified (approved) app**
listed publicly on make.com's integrations page.

## Directory layout

Each folder maps 1:1 to a section in Make's Custom Apps editor (web UI tabs or the
"Make Apps Editor" VS Code extension file layout):

| File | Editor section |
|---|---|
| `app/base.imljson` | Base (base URL, auth header, error handling, log sanitization) |
| `app/metadata.json` | App metadata (label, description, theme color) |
| `app/connections/bolten-api/` | Connection (API key) — `api` = communication, `parameters` = fields |
| `app/rpcs/` | RPCs powering dynamic dropdowns (`rpc://listProjects`, `rpc://listComponents`) |
| `app/webhooks/opportunity-events/` | Dedicated webhook for the instant trigger |
| `app/modules/<name>/` | One folder per module: `api` = communication, `parameters` = static params, `expect` = mappable params, `interface` = output spec |

## Module inventory (22 modules)

| Module | Type | Label | Endpoint |
|---|---|---|---|
| `list-projects` | Search | List Projects | `GET /clients/api/v1/projects` |
| `get-project-components` | Action (read) | Get Project Components | `GET /clients/api/v1/projects/{id}/components` |
| `list-contacts` | Search | List Contacts | `GET /contact/api/v1/{component}/contacts` (paginated) |
| `get-contact` | Action (read) | Get a Contact | `GET .../contacts/{id}` |
| `create-contact` | Action (create) | Create a Contact | `POST .../contacts` |
| `update-contact` | Action (update) | Update a Contact | `PATCH .../contacts/{id}` |
| `delete-contact` | Action (delete) | Delete a Contact | `DELETE .../contacts/{id}` |
| `list-opportunities` | Search | List Opportunities | `GET /kanban/api/v1/{component}/opportunities` (paginated) |
| `get-opportunity` | Action (read) | Get an Opportunity | `GET .../opportunities/{id}` |
| `create-opportunity` | Action (create) | Create an Opportunity | `POST .../opportunities` |
| `update-opportunity` | Action (update) | Update an Opportunity | `PATCH .../opportunities/{id}` |
| `delete-opportunity` | Action (delete) | Delete an Opportunity | `DELETE .../opportunities/{id}` |
| `associate-contact` | Action | Associate Contact to Opportunity | `POST .../opportunities/{id}/contact` |
| `dissociate-contact` | Action | Dissociate Contact from Opportunity | `DELETE .../opportunities/{id}/contact` |
| `add-product` | Action (create) | Add Product to Opportunity | `POST /kanban/v1/.../products` |
| `update-product` | Action (update) | Update Opportunity Product | `PUT .../products/{itemId}` |
| `remove-product` | Action (delete) | Remove Opportunity Product | `DELETE .../products/{itemId}` |
| `create-task` | Action (create) | Create Task on Opportunity | `POST /kanban/v1/.../tasks` |
| `update-task` | Action (update) | Update Opportunity Task | `PUT .../tasks/{taskId}` |
| `remove-task` | Action (delete) | Remove Opportunity Task | `DELETE .../tasks/{taskId}` |
| `watch-events` | Instant trigger | Watch Opportunity Events | webhook `opportunity-events` (registered manually in Bolten) |
| `make-api-call` | Universal | Make an API Call | any endpoint under `https://app.bolten.io` |

UX improvement over the n8n node: `Project` and `Component` are **dynamic dropdowns**
(nested selects fed by the two RPCs) instead of free-text IDs.

## How to get this into Make

1. Create the app: Make → **Custom apps** → *Create a new app* (name `bolten`, label `Bolten`,
   theme `#2563EB` — confirm against brand guidelines), or use the
   [Make Apps Editor VS Code extension](https://developers.make.com/custom-apps-documentation/make-apps-editor)
   with a Make API token (scopes `sdk-apps:read` + `sdk-apps:write`) and paste each file
   into the corresponding section.
2. Upload the logo: square PNG, 512×512 to 2048×2048, ≤512 kB
   ([spec](https://developers.make.com/custom-apps-documentation/app-logo)). White/transparent
   areas render in the theme color.
3. Create the connection, RPCs, webhook, then the 22 modules (types per the table above).
4. Test with a real Bolten workspace API key.

## Known TODOs before submitting for review

- [ ] **Verify RPC response shapes**: `rpcs/list-projects` and `rpcs/list-components` assume the
      endpoints return an array of `{ id, name }`. Adjust `iterate`/`output` to the real payload.
- [ ] **Webhook `condition` filter**: confirm Make accepts the `condition` directive in the
      webhook communication for event filtering; otherwise move filtering into the trigger module.
- [ ] **Samples**: generate output samples for every module in the editor ("Generate from response").
- [ ] **Interfaces**: fill in output interfaces (at least for the searches and CRUD actions) so
      downstream mapping panels show typed fields.
- [ ] **Dynamic attribute fields (nice-to-have)**: the contact/opportunity `schema` endpoints could
      feed an RPC that renders real mappable fields instead of the key/value `attributes` array.
- [ ] Logo asset (512×512+ PNG) and final theme color.

## Verification (app review) checklist

From Make's [app review docs](https://developers.make.com/custom-apps-documentation/app-review):

- Connection requests only the API key; wrong key returns a clear error (done in `connections/`).
- Sensitive data sanitized from logs (`log.sanitize` in base + connection — done).
- Every module and parameter has a proper label/description; searches expose a `limit`
  parameter and paginate fully (done).
- Build **one test scenario chaining every module**, run it clean right before submitting,
  and remove test modules/connections.
- Submit via the **Request review** button in the app detail page. The form asks for:
  developer/vendor relationship (we are the ISV), listing categories, company logo + website,
  a **support contact** for user issues, and IP/ToS attestations.
- Review flow: automatic review (PDF of issues) → manual QA review → release queue.
  Community reports suggest **~4 weeks to 2 months**; changes after approval are versioned
  and re-reviewed by Make.
- Faster interim option: publish the app (invite link) and list it on the
  [Make Apps Marketplace](https://f.make.com/submit-your-app) (business review only,
  2–3 business days) while the full verification is in progress.
