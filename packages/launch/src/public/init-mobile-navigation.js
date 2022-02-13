/* eslint-disable @typescript-eslint/ban-ts-comment */
const drawer = document.querySelector('#sidebar');

if (drawer) {
  // Toggle button
  const triggers = document.querySelectorAll('[data-action="trigger-mobile-menu"]');
  for (const trigger of [...triggers]) {
    trigger.addEventListener('click', function () {
      // TODO: type drawer and use it here
      // @ts-ignore
      drawer.opened = true;
    });
  }
}
