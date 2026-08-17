# Bolten

Bolten is a CRM, WhatsApp and AI platform. This app lets you manage projects, contacts, opportunities, products and tasks, and react to opportunity events in real time.

## Connection

Generate an API key in Bolten under **Settings › Advanced Settings › API** (Partner Area › API Keys) and paste it into the connection's **API key** field.

## Setting up the "Watch opportunity events" trigger

Bolten does not offer a webhook registration API, so the webhook is registered manually:

1. In Make, add the **Watch opportunity events** trigger to your scenario and click **Create a webhook**. Copy the webhook address Make shows you.
2. In Bolten, open the project and go to **Settings › Integrations › Webhooks**.
3. Create a new webhook and paste the Make address as the destination URL.
4. Choose which events to send. The trigger receives all of them; you can additionally filter inside Make using the trigger's **Events** parameter:
   - `opportunity.created` — a new opportunity was created
   - `opportunity.won` — an opportunity was marked as won
   - `opportunity.lost` — an opportunity was marked as lost
   - `opportunity.transitioned` — an opportunity moved between stages
5. Save. Bolten retries failed deliveries 5 times with exponential backoff.

Each event payload contains `id`, `created_at`, `type` and a `data` object with the opportunity details.

## Dynamic fields

Contact and opportunity fields are customizable per component in Bolten. Use the `GET .../schema` endpoints (or the field names shown in the Bolten UI) to discover the attribute names accepted by the create/update modules.
