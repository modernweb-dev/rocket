# Launch Preset for Rocket

For docs please see our homepage [https://rocket.modern-web.dev/docs/presets/launch/](https://rocket.modern-web.dev/docs/presets/launch/).

## `inline-notification/index.js`:

### class: `InlineNotification`, `inline-notification`

#### Superclass

| Name       | Module | Package     |
| ---------- | ------ | ----------- |
| LitElement |        | lit-element |

#### Fields

| Name  | Privacy | Type                         | Default | Description | Inherited From |
| ----- | ------- | ---------------------------- | ------- | ----------- | -------------- |
| title | public  | `string`                     | `''`    |             |                |
| type  | public  | `'tip'\|'warning'\|'danger'` | `'tip'` |             |                |

#### Attributes

| Name  | Field | Inherited From |
| ----- | ----- | -------------- |
| type  | type  |                |
| title | title |                |

#### CSS Properties

| Name                                           | Default                    | Description |
| ---------------------------------------------- | -------------------------- | ----------- |
| --inline-notification-tip-background-color     | `rgba(221, 221, 221, 0.3)` |             |
| --inline-notification-tip-border-color         | `#42b983`                  |             |
| --inline-notification-warning-background-color | `rgba(255, 229, 100, 0.2)` |             |
| --inline-notification-warning-border-color     | `#e7c000`                  |             |
| --inline-notification-danger-background-color  | `rgba(192, 0, 0, 0.1)`     |             |
| --inline-notification-danger-border-color      | `#c00`                     |             |
| --inline-notification-warning-heading-color    | `#b29400`                  |             |
| --inline-notification-danger-heading-color     | `#900`                     |             |

#### CSS Parts

| Name  | Description       |
| ----- | ----------------- |
| title | the title heading |

<hr/>

### Exports

| Kind | Name               | Declaration        | Module                       | Package |
| ---- | ------------------ | ------------------ | ---------------------------- | ------- |
| js   | InlineNotification | InlineNotification | inline-notification/index.js |         |

## `inline-notification/inline-notification.js`:

### Exports

| Kind                      | Name                | Declaration        | Module                        | Package |
| ------------------------- | ------------------- | ------------------ | ----------------------------- | ------- |
| custom-element-definition | inline-notification | InlineNotification | /inline-notification/index.js |         |
