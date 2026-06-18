import { INodeProperties } from 'n8n-workflow';

export const contactOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['contact'] } },
    options: [
      { name: 'Create', value: 'create', description: 'Create a contact', action: 'Create a contact' },
      { name: 'Delete', value: 'delete', description: 'Delete a contact', action: 'Delete a contact' },
      { name: 'Get', value: 'get', description: 'Get a contact', action: 'Get a contact' },
      { name: 'Get Many', value: 'getAll', description: 'List many contacts', action: 'Get many contacts' },
      { name: 'Get Schema', value: 'getSchema', description: 'Get the dynamic field schema for contacts', action: 'Get contact schema' },
      { name: 'Update', value: 'update', description: 'Update a contact', action: 'Update a contact' },
    ],
    default: 'getAll',
  },
];

export const contactFields: INodeProperties[] = [
  // ── shared ─────────────────────────────────────────────────────────────────
  {
    displayName: 'Component ID',
    name: 'componentId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['contact'] } },
    description: 'UUID of the CRM component (get it from Project → Get Components)',
  },
  {
    displayName: 'Contact ID',
    name: 'contactId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['contact'], operation: ['get', 'update', 'delete'] } },
    description: 'UUID of the contact',
  },

  // ── getAll ─────────────────────────────────────────────────────────────────
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['contact'], operation: ['getAll'] } },
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['contact'], operation: ['getAll'], returnAll: [false] } },
    description: 'Max number of results to return',
  },
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['contact'], operation: ['getAll'], returnAll: [false] } },
    description: 'Page number to return',
  },

  // ── create / update ────────────────────────────────────────────────────────
  {
    displayName:
      'The Bolten API stores contact data inside a dynamic "attributes" object. Use the fields below to set those attributes. To discover available field names, use the Get Schema operation.',
    name: 'attributesNotice',
    type: 'notice',
    default: '',
    displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
  },
  {
    displayName: 'Use Raw JSON for Attributes',
    name: 'jsonMode',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
    description: 'Whether to provide attributes as raw JSON instead of key/value pairs',
  },
  {
    displayName: 'Attributes (Key/Value)',
    name: 'attributesUi',
    type: 'fixedCollection',
    placeholder: 'Add Attribute',
    default: {},
    typeOptions: { multipleValues: true },
    displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'], jsonMode: [false] } },
    options: [{
      name: 'attributeValues',
      displayName: 'Attribute',
      values: [
        { displayName: 'Key', name: 'key', type: 'string', default: '', description: 'Attribute name (must match the field name in Bolten)' },
        { displayName: 'Value', name: 'value', type: 'string', default: '', description: 'Attribute value' },
      ],
    }],
  },
  {
    displayName: 'Attributes (JSON)',
    name: 'attributesJson',
    type: 'json',
    default: '{}',
    displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'], jsonMode: [true] } },
    description: 'Attributes object as raw JSON, e.g. {"Nome": "John", "E-mail": "john@example.com"}',
  },
];
