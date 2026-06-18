import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  JsonObject,
} from 'n8n-workflow';

import { contactFields, contactOperations } from './descriptions/contact.description';
import { opportunityFields, opportunityOperations } from './descriptions/opportunity.description';
import { projectFields, projectOperations } from './descriptions/project.description';

const BASE = 'https://app.bolten.io';

export class Bolten implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Bolten',
    name: 'bolten',
    icon: 'file:bolten.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the Bolten CRM, WhatsApp and AI platform',
    defaults: { name: 'Bolten' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'boltenApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Contact', value: 'contact' },
          { name: 'Opportunity', value: 'opportunity' },
          { name: 'Project', value: 'project' },
        ],
        default: 'contact',
      },
      ...projectOperations,
      ...projectFields,
      ...contactOperations,
      ...contactFields,
      ...opportunityOperations,
      ...opportunityFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;
      let responseData: JsonObject | JsonObject[];

      try {
        if (resource === 'project') {
          responseData = await handleProject.call(this, operation, i);
        } else if (resource === 'contact') {
          responseData = await handleContact.call(this, operation, i);
        } else if (resource === 'opportunity') {
          responseData = await handleOpportunity.call(this, operation, i);
        } else {
          throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        const normalized = Array.isArray(responseData) ? responseData : [responseData];
        returnData.push(
          ...this.helpers.constructExecutionMetaData(
            this.helpers.returnJsonArray(normalized),
            { itemData: { item: i } },
          ),
        );
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────

function buildAttributes(ctx: IExecuteFunctions, i: number): Record<string, unknown> {
  const jsonMode = ctx.getNodeParameter('jsonMode', i, false) as boolean;
  if (jsonMode) {
    const raw = ctx.getNodeParameter('attributesJson', i, '{}') as string | Record<string, unknown>;
    return typeof raw === 'string' ? (JSON.parse(raw) as Record<string, unknown>) : raw;
  }
  const ui = ctx.getNodeParameter('attributesUi', i, {}) as {
    attributeValues?: Array<{ key: string; value: string }>;
  };
  const result: Record<string, unknown> = {};
  for (const row of ui.attributeValues ?? []) result[row.key] = row.value;
  return result;
}

async function req(
  ctx: IExecuteFunctions,
  method: string,
  url: string,
  body?: Record<string, unknown>,
  qs?: Record<string, unknown>,
): Promise<JsonObject | JsonObject[]> {
  return ctx.helpers.requestWithAuthentication.call(ctx, 'boltenApi', {
    method, url, body, qs, json: true,
  }) as Promise<JsonObject | JsonObject[]>;
}

// Auto-paginate and return all items from a paginated endpoint
async function getAllItems(
  ctx: IExecuteFunctions,
  url: string,
): Promise<JsonObject[]> {
  const all: JsonObject[] = [];
  let page = 1;

  while (true) {
    const response = await req(ctx, 'GET', url, undefined, { page, limit: 100 }) as {
      items: JsonObject[];
      pagination: { total: number; limit: number };
    };
    const items: JsonObject[] = response?.items ?? [];
    all.push(...items);

    const { total, limit } = response?.pagination ?? { total: 0, limit: 100 };
    if (all.length >= total || items.length < limit) break;
    page++;
  }

  return all;
}

// ── project ───────────────────────────────────────────────────────────────────

async function handleProject(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<JsonObject | JsonObject[]> {
  if (operation === 'getAll') {
    return req(this, 'GET', `${BASE}/clients/api/v1/projects`);
  }
  if (operation === 'getComponents') {
    const projectId = this.getNodeParameter('projectId', i) as string;
    return req(this, 'GET', `${BASE}/clients/api/v1/projects/${projectId}/components`);
  }
  throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
}

// ── contact ───────────────────────────────────────────────────────────────────

async function handleContact(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<JsonObject | JsonObject[]> {
  const componentId = this.getNodeParameter('componentId', i) as string;
  const base = `${BASE}/contact/api/v1/${componentId}`;

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    if (returnAll) return getAllItems(this, `${base}/contacts`);
    const limit = this.getNodeParameter('limit', i) as number;
    const page = this.getNodeParameter('page', i, 1) as number;
    return req(this, 'GET', `${base}/contacts`, undefined, { page, limit });
  }
  if (operation === 'get') {
    const id = this.getNodeParameter('contactId', i) as string;
    return req(this, 'GET', `${base}/contacts/${id}`);
  }
  if (operation === 'create') {
    return req(this, 'POST', `${base}/contacts`, { attributes: buildAttributes(this, i) });
  }
  if (operation === 'update') {
    const id = this.getNodeParameter('contactId', i) as string;
    return req(this, 'PATCH', `${base}/contacts/${id}`, { attributes: buildAttributes(this, i) });
  }
  if (operation === 'delete') {
    const id = this.getNodeParameter('contactId', i) as string;
    return req(this, 'DELETE', `${base}/contacts/${id}`);
  }
  if (operation === 'getSchema') {
    return req(this, 'GET', `${base}/schema`);
  }
  throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
}

// ── opportunity ───────────────────────────────────────────────────────────────

async function handleOpportunity(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<JsonObject | JsonObject[]> {
  const componentId = this.getNodeParameter('componentId', i) as string;
  const apiBase = `${BASE}/kanban/api/v1/${componentId}`;
  const v1Base = `${BASE}/kanban/v1/${componentId}`;

  if (operation === 'getAll') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    if (returnAll) return getAllItems(this, `${apiBase}/opportunities`);
    const limit = this.getNodeParameter('limit', i) as number;
    const page = this.getNodeParameter('page', i, 1) as number;
    return req(this, 'GET', `${apiBase}/opportunities`, undefined, { page, limit });
  }

  const opportunityId = operation !== 'getSchema'
    ? this.getNodeParameter('opportunityId', i) as string
    : '';

  if (operation === 'get') {
    return req(this, 'GET', `${apiBase}/opportunities/${opportunityId}`);
  }
  if (operation === 'create') {
    return req(this, 'POST', `${apiBase}/opportunities`, { attributes: buildAttributes(this, i) });
  }
  if (operation === 'update') {
    return req(this, 'PATCH', `${apiBase}/opportunities/${opportunityId}`, { attributes: buildAttributes(this, i) });
  }
  if (operation === 'delete') {
    return req(this, 'DELETE', `${apiBase}/opportunities/${opportunityId}`);
  }
  if (operation === 'getSchema') {
    return req(this, 'GET', `${apiBase}/schema`);
  }

  // ── contact association ───────────────────────────────────────────────────
  if (operation === 'associateContact') {
    const contactId = this.getNodeParameter('associateContactId', i) as string;
    return req(this, 'POST', `${apiBase}/opportunities/${opportunityId}/contact`, { id: contactId });
  }
  if (operation === 'dissociateContact') {
    return req(this, 'DELETE', `${apiBase}/opportunities/${opportunityId}/contact`);
  }

  // ── products ──────────────────────────────────────────────────────────────
  if (operation === 'addProduct') {
    const productId = this.getNodeParameter('productId', i) as string;
    const quantity = this.getNodeParameter('productQuantity', i) as number;
    const finalPrice = this.getNodeParameter('productFinalPrice', i) as number;
    const body: Record<string, unknown> = { product_id: productId, quantity };
    if (finalPrice > 0) body.final_price = finalPrice;
    return req(this, 'POST', `${v1Base}/opportunities/${opportunityId}/products`, body);
  }
  if (operation === 'updateProduct') {
    const itemId = this.getNodeParameter('productItemId', i) as string;
    const body: Record<string, unknown> = {
      quantity: this.getNodeParameter('updatedProductQuantity', i),
    };
    const updatedProductId = this.getNodeParameter('updatedProductId', i, '') as string;
    const updatedFinalPrice = this.getNodeParameter('updatedProductFinalPrice', i, 0) as number;
    if (updatedProductId) body.product_id = updatedProductId;
    if (updatedFinalPrice > 0) body.final_price = updatedFinalPrice;
    return req(this, 'PUT', `${v1Base}/opportunities/${opportunityId}/products/${itemId}`, body);
  }
  if (operation === 'removeProduct') {
    const itemId = this.getNodeParameter('productItemId', i) as string;
    return req(this, 'DELETE', `${v1Base}/opportunities/${opportunityId}/products/${itemId}`);
  }

  // ── tasks ─────────────────────────────────────────────────────────────────
  if (operation === 'createTask') {
    const body: Record<string, unknown> = {
      title: this.getNodeParameter('taskTitle', i),
      state: this.getNodeParameter('taskState', i),
    };
    const desc = this.getNodeParameter('taskDescription', i, '') as string;
    const scheduledTo = this.getNodeParameter('taskScheduledTo', i, '') as string;
    if (desc) body.description = desc;
    if (scheduledTo) body.scheduled_to = scheduledTo;
    return req(this, 'POST', `${v1Base}/opportunities/${opportunityId}/tasks`, body);
  }
  if (operation === 'updateTask') {
    const taskId = this.getNodeParameter('taskId', i) as string;
    const body: Record<string, unknown> = {
      state: this.getNodeParameter('updatedTaskState', i),
    };
    const title = this.getNodeParameter('updatedTaskTitle', i, '') as string;
    const desc = this.getNodeParameter('updatedTaskDescription', i, '') as string;
    const scheduledTo = this.getNodeParameter('updatedTaskScheduledTo', i, '') as string;
    if (title) body.title = title;
    if (desc) body.description = desc;
    if (scheduledTo) body.scheduled_to = scheduledTo;
    return req(this, 'PUT', `${v1Base}/opportunities/${opportunityId}/tasks/${taskId}`, body);
  }
  if (operation === 'removeTask') {
    const taskId = this.getNodeParameter('taskId', i) as string;
    return req(this, 'DELETE', `${v1Base}/opportunities/${opportunityId}/tasks/${taskId}`);
  }

  throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
}
