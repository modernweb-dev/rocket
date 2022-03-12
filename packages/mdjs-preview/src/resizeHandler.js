let addedCount = 0;

export function addResizeHandler() {
  if (addedCount > 0) {
    addedCount += 1;
    return;
  }
  window.addEventListener('message', ev => {
    const data = JSON.parse(ev.data);
    if (data.action === 'mdjs-viewer-resize') {
      const viewer = /** @type {import('./MdJsPreview.js').MdJsPreview} */ (
        document.body.querySelector(`[mdjs-story-name="${data.storyKey}"]`)
      );
      if (viewer) {
        viewer.contentHeight = data.height;
      }
    }
  });
}
