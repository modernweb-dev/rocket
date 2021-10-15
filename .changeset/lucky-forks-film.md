---
'@mdjs/core': patch
'@mdjs/mdjs-preview': patch
---

If your preview is followed by a code blocks marked as `story-code` then those will be shown when switching between multiple platforms

````md
```js preview-story
// will be visible when platform web is selected
export const JsPreviewStory = () => html` <demo-wc-card>JS Preview Story</demo-wc-card> `;
```

```xml story-code
<!-- will be visible when platform android is selected -->
<Button
    android:id="@+id/demoWcCard"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Android Code"
    style="@style/Widget.FooComponents.Demo.Wc.Card"
/>
```

```swift story-code
// will be visible when platform ios is selected
import DemoWc.Card

let card = DemoWcButton()
```
````
