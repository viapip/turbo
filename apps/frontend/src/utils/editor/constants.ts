// import type { JSONSchema7TypeName } from 'json-schema'

export const Widgets: Record<string, Record<string, string>> = {
  string: {
    email: 'EditorWidgetEmail',
    date: 'EditorWidgetDate',
    time: 'EditorWidgetTime',
    default: 'EditorWidgetText',
  },
  number: {
    default: 'EditorWidgetNumber',
  },
} as const

export function getWidget<T extends keyof typeof Widgets>(type: T, format?: keyof typeof Widgets[T]) {
  if (!format)
    return Widgets[type].default

  const widget = Widgets[type][format]

  return widget || Widgets[type].default
}
