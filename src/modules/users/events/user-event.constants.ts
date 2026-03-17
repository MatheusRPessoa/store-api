export const USER_EVENTS = {
  CREATED: 'user.created',
  UPDATE: 'user.updated',
  DELETE: 'user.deleted',
} as const;

export type UserEventName = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];
