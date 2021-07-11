# Rocket Search

Add a search for all your static content.

For docs please see our homepage [https://rocket.modern-web.dev/docs/presets/search/](https://rocket.modern-web.dev/docs/presets/search/).

## `src/RocketSearch.js`:

### class: `RocketSearch`, `rocket-search`

#### Superclass

| Name       | Module | Package    |
| ---------- | ------ | ---------- |
| LitElement |        | @lion/core |

#### Mixins

| Name                | Module | Package                  |
| ------------------- | ------ | ------------------------ |
| ScopedElementsMixin |        | @open-wc/scoped-elements |

#### Fields

| Name           | Privacy | Type                         | Default              | Description | Inherited From |
| -------------- | ------- | ---------------------------- | -------------------- | ----------- | -------------- |
| scopedElements |         |                              |                      |             |                |
| combobox       |         | `RocketSearchCombobox\|null` |                      |             |                |
| jsonUrl        | public  | `string`                     | `''`                 |             |                |
| search         | public  | `string`                     | `''`                 |             |                |
| maxResults     | public  | `number`                     | `10`                 |             |                |
| noResultsText  | public  | `string`                     | `'No results found'` |             |                |
| results        | public  | `RocketSearchResult[]`       | `[]`                 |             |                |
| miniSearch     |         | `MiniSearch\|null`           | `null`               |             |                |

#### Methods

| Name        | Privacy | Description                                                               | Parameters | Return          | Inherited From |
| ----------- | ------- | ------------------------------------------------------------------------- | ---------- | --------------- | -------------- |
| setupSearch |         | Fetches the search index at `this.jsonUrl` and sets up the search engine. |            | `Promise<void>` |                |

#### Attributes

| Name          | Field         | Inherited From |
| ------------- | ------------- | -------------- |
| json-url      | jsonUrl       |                |
| search        | search        |                |
| results       | results       |                |
| max-results   | maxResults    |                |
| noResultsText | noResultsText |                |

#### CSS Properties

| Name                                | Default   | Description                           |
| ----------------------------------- | --------- | ------------------------------------- |
| --rocket-search-background-color    | `#fff`    | Search results background colour      |
| --rocket-search-caret-color         | `initial` | Search input caret colour             |
| --rocket-search-input-border-color  | `#dfe1e5` | Search input border colour            |
| --rocket-search-input-border-radius | `24px`    | Search input border radius            |
| --rocket-search-fill-color          | `#000`    | Search Icon Color                     |
| --rocket-search-highlight-color     | `#6c63ff` | Highlighted search result text colour |

#### CSS Parts

| Name          | Description          |
| ------------- | -------------------- |
| search-option | search result        |
| empty         | empty search results |

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

| Name  | Privacy | Description | Parameters | Return | Inherited From |
| ----- | ------- | ----------- | ---------- | ------ | -------------- |
| focus |         |             |            |        |                |

#### CSS Properties

| Name                                       | Default   | Description |
| ------------------------------------------ | --------- | ----------- |
| --rocket-search-fill-color                 | `#000`    |             |
| --rocket-search-background-color           | `#fff`    |             |
| --rocket-search-input-overlay-border-color | `#ccc`    |             |
| --rocket-search-input-border-color         | `#dfe1e5` |             |
| --rocket-search-input-border-radius        | `24px`    |             |

#### Slots

| Name    | Description |
| ------- | ----------- |
| prefix  |             |
| label   |             |
| listbox |             |
| input   |             |

<details><summary>Private API</summary>

#### Methods

| Name                  | Privacy | Description | Parameters | Return | Inherited From |
| --------------------- | ------- | ----------- | ---------- | ------ | -------------- |
| \_connectSlotMixin    | private |             |            |        |                |
| \_defineOverlayConfig | private |             |            |        |                |

</details>

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
