export const PRODUCT_EVENTS = {
  CREATED: 'external-group.created',
  UPDATED: 'external-group.updated',
  DELETED: 'external-group.deleted',
} as const;

export type ProductEventName =
  (typeof PRODUCT_EVENTS)[keyof typeof PRODUCT_EVENTS];
