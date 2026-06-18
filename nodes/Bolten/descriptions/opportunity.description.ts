import { INodeProperties } from 'n8n-workflow';

export const opportunityOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['opportunity'] } },
    options: [
      { name: 'Add Product', value: 'addProduct', description: 'Add a product to an opportunity', action: 'Add product to opportunity' },
      { name: 'Associate Contact', value: 'associateContact', description: 'Link a contact to an opportunity', action: 'Associate contact to opportunity' },
      { name: 'Create', value: 'create', description: 'Create an opportunity', action: 'Create an opportunity' },
      { name: 'Create Task', value: 'createTask', description: 'Create a task on an opportunity', action: 'Create task on opportunity' },
      { name: 'Delete', value: 'delete', description: 'Delete an opportunity', action: 'Delete an opportunity' },
      { name: 'Dissociate Contact', value: 'dissociateContact', description: 'Remove the linked contact from an opportunity', action: 'Dissociate contact from opportunity' },
      { name: 'Get', value: 'get', description: 'Get an opportunity', action: 'Get an opportunity' },
      { name: 'Get Many', value: 'getAll', description: 'List many opportunities', action: 'Get many opportunities' },
      { name: 'Get Schema', value: 'getSchema', description: 'Get the dynamic field schema for opportunities', action: 'Get opportunity schema' },
      { name: 'Remove Product', value: 'removeProduct', description: 'Remove a product from an opportunity', action: 'Remove product from opportunity' },
      { name: 'Remove Task', value: 'removeTask', description: 'Remove a task from an opportunity', action: 'Remove task from opportunity' },
      { name: 'Update', value: 'update', description: 'Update an opportunity', action: 'Update an opportunity' },
      { name: 'Update Product', value: 'updateProduct', description: 'Update a product item on an opportunity', action: 'Update product on opportunity' },
      { name: 'Update Task', value: 'updateTask', description: 'Update a task on an opportunity', action: 'Update task on opportunity' },
    ],
    default: 'getAll',
  },
];

export const opportunityFields: INodeProperties[] = [
  // ── shared: component + opportunity ID ────────────────────────────────────
  {
    displayName: 'Component ID',
    name: 'componentId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['opportunity'] } },
    description: 'UUID of the Kanban component (get it from Project → Get Components)',
  },
  {
    displayName: 'Opportunity ID',
    name: 'opportunityId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['opportunity'],
        operation: [
          'get', 'update', 'delete',
          'associateContact', 'dissociateContact',
          'addProduct', 'updateProduct', 'removeProduct',
          'createTask', 'updateTask', 'removeTask',
        ],
      },
    },
    description: 'UUID of the opportunity',
  },

  // ── getAll ─────────────────────────────────────────────────────────────────
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['opportunity'], operation: ['getAll'] } },
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['opportunity'], operation: ['getAll'], returnAll: [false] } },
    description: 'Max number of results to return',
  },
  {
    displayName: 'Page',
    name: 'page',
    type: 'number',
    default: 1,
    typeOptions: { minValue: 1 },
    displayOptions: { show: { resource: ['opportunity'], operation: ['getAll'], returnAll: [false] } },
    description: 'Page number to return',
  },

  // ── create / update: attributes ────────────────────────────────────────────
  {
    displayName:
      'The Bolten API stores opportunity data inside a dynamic "attributes" object. Use the fields below to set those attributes. To discover available field names, use the Get Schema operation.',
    name: 'attributesNotice',
    type: 'notice',
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['create', 'update'] } },
  },
  {
    displayName: 'Use Raw JSON for Attributes',
    name: 'jsonMode',
    type: 'boolean',
    default: false,
    displayOptions: { show: { resource: ['opportunity'], operation: ['create', 'update'] } },
    description: 'Whether to provide attributes as raw JSON instead of key/value pairs',
  },
  {
    displayName: 'Attributes (Key/Value)',
    name: 'attributesUi',
    type: 'fixedCollection',
    placeholder: 'Add Attribute',
    default: {},
    typeOptions: { multipleValues: true },
    displayOptions: { show: { resource: ['opportunity'], operation: ['create', 'update'], jsonMode: [false] } },
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
    displayOptions: { show: { resource: ['opportunity'], operation: ['create', 'update'], jsonMode: [true] } },
    description: 'Attributes object as raw JSON',
  },

  // ── associateContact ───────────────────────────────────────────────────────
  {
    displayName: 'Contact ID',
    name: 'associateContactId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['associateContact'] } },
    description: 'UUID of the contact to link to this opportunity',
  },

  // ── addProduct ─────────────────────────────────────────────────────────────
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['addProduct'] } },
    description: 'UUID of the product to add',
  },
  {
    displayName: 'Quantity',
    name: 'productQuantity',
    type: 'number',
    default: 1,
    displayOptions: { show: { resource: ['opportunity'], operation: ['addProduct'] } },
    description: 'Number of units',
  },
  {
    displayName: 'Final Price',
    name: 'productFinalPrice',
    type: 'number',
    default: 0,
    displayOptions: { show: { resource: ['opportunity'], operation: ['addProduct'] } },
    description: 'Override price for this line item (leave 0 to use product default)',
  },

  // ── updateProduct ──────────────────────────────────────────────────────────
  {
    displayName: 'Product Item ID',
    name: 'productItemId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateProduct', 'removeProduct'] } },
    description: 'UUID of the product line-item on this opportunity',
  },
  {
    displayName: 'Updated Product ID',
    name: 'updatedProductId',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateProduct'] } },
    description: 'Replace with a different product UUID (leave empty to keep current)',
  },
  {
    displayName: 'Updated Quantity',
    name: 'updatedProductQuantity',
    type: 'number',
    default: 1,
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateProduct'] } },
    description: 'New quantity',
  },
  {
    displayName: 'Updated Final Price',
    name: 'updatedProductFinalPrice',
    type: 'number',
    default: 0,
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateProduct'] } },
    description: 'New final price (0 to use product default)',
  },

  // ── createTask ─────────────────────────────────────────────────────────────
  {
    displayName: 'Task Title',
    name: 'taskTitle',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['createTask'] } },
    description: 'Short title / summary of the task',
  },
  {
    displayName: 'Task Description',
    name: 'taskDescription',
    type: 'string',
    typeOptions: { rows: 3 },
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['createTask'] } },
    description: 'Detailed description of the task',
  },
  {
    displayName: 'Task State',
    name: 'taskState',
    type: 'options',
    options: [
      { name: 'To Do', value: 'to_do' },
      { name: 'Doing', value: 'doing' },
      { name: 'Done', value: 'done' },
    ],
    default: 'to_do',
    displayOptions: { show: { resource: ['opportunity'], operation: ['createTask'] } },
    description: 'Current state of the task',
  },
  {
    displayName: 'Scheduled To',
    name: 'taskScheduledTo',
    type: 'dateTime',
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['createTask'] } },
    description: 'Optional due date/time for the task',
  },

  // ── updateTask ─────────────────────────────────────────────────────────────
  {
    displayName: 'Task ID',
    name: 'taskId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateTask', 'removeTask'] } },
    description: 'UUID of the task to update or remove',
  },
  {
    displayName: 'Updated Task Title',
    name: 'updatedTaskTitle',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateTask'] } },
    description: 'New title for the task',
  },
  {
    displayName: 'Updated Task Description',
    name: 'updatedTaskDescription',
    type: 'string',
    typeOptions: { rows: 3 },
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateTask'] } },
    description: 'New description for the task',
  },
  {
    displayName: 'Updated Task State',
    name: 'updatedTaskState',
    type: 'options',
    options: [
      { name: 'To Do', value: 'to_do' },
      { name: 'Doing', value: 'doing' },
      { name: 'Done', value: 'done' },
    ],
    default: 'to_do',
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateTask'] } },
    description: 'New state for the task',
  },
  {
    displayName: 'Updated Scheduled To',
    name: 'updatedTaskScheduledTo',
    type: 'dateTime',
    default: '',
    displayOptions: { show: { resource: ['opportunity'], operation: ['updateTask'] } },
    description: 'New due date/time for the task',
  },
];
