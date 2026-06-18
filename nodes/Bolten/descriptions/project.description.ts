import { INodeProperties } from 'n8n-workflow';

export const projectOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['project'] } },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'List many projects',
        action: 'Get many projects',
      },
      {
        name: 'Get Components',
        value: 'getComponents',
        description: 'List components of a project',
        action: 'Get project components',
      },
    ],
    default: 'getAll',
  },
];

export const projectFields: INodeProperties[] = [
  {
    displayName: 'Project ID',
    name: 'projectId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: { resource: ['project'], operation: ['getComponents'] },
    },
    description: 'The UUID of the project',
  },
];
