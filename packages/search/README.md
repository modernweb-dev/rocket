# Rocket Search

Add a search for all your static content.

For docs please see our homepage [https://rocket.modern-web.dev/docs/presets/search/](https://rocket.modern-web.dev/docs/presets/search/).

## `src/RocketSearch.js`:

### class: `RocketSearch`

#### Superclass

| Name       | Module | Package    |
| ---------- | ------ | ---------- |
| LitElement |        | @lion/core |

#### Mixins

| Name                | Module | Package                  |
| ------------------- | ------ | ------------------------ |
| ScopedElementsMixin |        | @open-wc/scoped-elements |

#### Fields

| Name           | Privacy | Type                   | Default              | Description | Inherited From |
| -------------- | ------- | ---------------------- | -------------------- | ----------- | -------------- |
| scopedElements |         |                        |                      |             |                |
| combobox       |         |                        |                      |             |                |
| jsonUrl        | public  | `string`               | `''`                 |             |                |
| search         | public  | `string`               | `''`                 |             |                |
| maxResults     | public  | `number`               | `10`                 |             |                |
| noResultsText  | public  | `string`               | `'No results found'` |             |                |
| results        | public  | `RocketSearchResult[]` | `[]`                 |             |                |
| miniSearch     |         | `null`                 | `null`               |             |                |

#### Methods

| Name        | Privacy | Description | Parameters | Return | Inherited From |
| ----------- | ------- | ----------- | ---------- | ------ | -------------- |
| setupSearch |         |             |            |        |                |

#### Attributes

| Name          | Field         | Inherited From |
| ------------- | ------------- | -------------- |
| json-url      | jsonUrl       |                |
| search        | search        |                |
| results       | results       |                |
| max-results   | maxResults    |                |
| noResultsText | noResultsText |                |

<hr/>

### Exports

| Kind | Name         | Declaration  | Module              | Package |
| ---- | ------------ | ------------ | ------------------- | ------- |
| js   | RocketSearch | RocketSearch | src/RocketSearch.js |         |

## `src/RocketSearchCombobox.js`:

### class: `RocketSearchCombobox`, `rocket-search-combobox`

#### Superclass

| Name         | Module | Package        |
| ------------ | ------ | -------------- |
| LionCombobox |        | @lion/combobox |

#### Fields

| Name                     | Privacy | Type                    | Default  | Description | Inherited From |
| ------------------------ | ------- | ----------------------- | -------- | ----------- | -------------- |
| slots                    |         | `LionCombobox['slots']` |          |             |                |
| autocomplete             |         | `'none'`                | `'none'` |             |                |
| selectionFollowsFocus    |         | `boolean`               | `false`  |             |                |
| rotateKeyboardNavigation |         | `boolean`               | `false`  |             |                |
| showInput                |         | `boolean`               | `false`  |             |                |

#### Methods

| Name                  | Privacy | Description | Parameters | Return | Inherited From |
| --------------------- | ------- | ----------- | ---------- | ------ | -------------- |
| \_connectSlotMixin    |         |             |            |        |                |
| \_defineOverlayConfig |         |             |            |        |                |
| focus                 |         |             |            |        |                |

<hr/>

### Exports

| Kind                      | Name                   | Declaration          | Module                      | Package |
| ------------------------- | ---------------------- | -------------------- | --------------------------- | ------- |
| js                        | RocketSearchCombobox   | RocketSearchCombobox | src/RocketSearchCombobox.js |         |
| custom-element-definition | rocket-search-combobox | RocketSearchCombobox | src/RocketSearchCombobox.js |         |

## `src/RocketSearchOption.js`:

### class: `RocketSearchOption`

#### Superclass

| Name       | Module | Package       |
| ---------- | ------ | ------------- |
| LionOption |        | @lion/listbox |

#### Mixins

| Name      | Module            | Package |
| --------- | ----------------- | ------- |
| LinkMixin | /src/LinkMixin.js |         |

#### Fields

| Name    | Privacy | Type     | Default | Description | Inherited From |
| ------- | ------- | -------- | ------- | ----------- | -------------- |
| title   | public  | `string` | `''`    |             |                |
| text    | public  | `string` | `''`    |             |                |
| section | public  | `string` | `''`    |             |                |

#### Attributes

| Name    | Field   | Inherited From |
| ------- | ------- | -------------- |
| title   | title   |                |
| text    | text    |                |
| section | section |                |

<hr/>

### Exports

| Kind | Name               | Declaration        | Module                    | Package |
| ---- | ------------------ | ------------------ | ------------------------- | ------- |
| js   | RocketSearchOption | RocketSearchOption | src/RocketSearchOption.js |         |
