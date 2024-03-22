import type { JSONSchemaType } from 'ajv'

export const userSchema: JSONSchemaType<{
  status: string
  // info?: TestUserInfo
  date: string
}> = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
    },
    info: {
      $ref: 'TestUserInfo',
    },
    date: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: ['status'],
  additionalProperties: false,
}
