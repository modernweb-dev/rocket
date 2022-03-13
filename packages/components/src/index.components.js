export const rocketComponents = {
  // TODO: add back once https://github.com/lit/lit/issues/2633 is fixed
  // 'rotating-text': () =>
  //   import('./RotatingText.js').then(m => m.RotatingText),
  'block-columns': () => import('./BlockColumns.js').then(m => m.BlockColumns),
  'testimonial-small': () => import('./TestimonialSmall.js').then(m => m.TestimonialSmall),
  'feature-small': () => import('./FeatureSmall.js').then(m => m.FeatureSmall),
  'the-block': () => import('./TheBlock.js').then(m => m.TheBlock),
  'inline-notification': () => import('./InlineNotification.js').then(m => m.InlineNotification),
  'permanent-notification': () =>
    import('./PermanentNotification.js').then(m => m.PermanentNotification),
  'card-icon': () => import('./CardIcon.js').then(m => m.CardIcon),
};
