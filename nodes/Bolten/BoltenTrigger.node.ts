import {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  JsonObject,
} from 'n8n-workflow';

export class BoltenTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Bolten Trigger',
    name: 'boltenTrigger',
    icon: 'file:bolten.svg',
    group: ['trigger'],
    version: 1,
    description: 'Starts the workflow when a Bolten webhook event fires',
    defaults: { name: 'Bolten Trigger' },
    inputs: [],
    outputs: ['main'],
    credentials: [],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName:
          'Copy the <strong>Webhook URL</strong> shown below and register it in your Bolten project under <strong>Configurações › Integrações › Webhooks</strong>. No authentication is required on the n8n side.',
        name: 'notice',
        type: 'notice',
        default: '',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: [
          {
            name: 'Opportunity Created',
            value: 'opportunity.created',
            description: 'Fired when a new opportunity is created',
          },
          {
            name: 'Opportunity Lost',
            value: 'opportunity.lost',
            description: 'Fired when an opportunity is marked as lost',
          },
          {
            name: 'Opportunity Transitioned',
            value: 'opportunity.transitioned',
            description: 'Fired when an opportunity moves between stages',
          },
          {
            name: 'Opportunity Won',
            value: 'opportunity.won',
            description: 'Fired when an opportunity is marked as won',
          },
        ],
        default: [],
        description: 'Event types to listen to. Leave empty to receive all events',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        // Bolten webhooks are registered manually in the UI
        return true;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const body = this.getBodyData() as JsonObject;
    const events = this.getNodeParameter('events', []) as string[];
    const type = (body.type as string) ?? '';

    // If specific events are configured, silently drop non-matching ones (still respond 200)
    if (events.length > 0 && !events.includes(type)) {
      return { workflowData: [[]] };
    }

    return {
      workflowData: [this.helpers.returnJsonArray([body])],
    };
  }
}
