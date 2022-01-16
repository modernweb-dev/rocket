const drawer = document.querySelector('#sidebar');

if (drawer) {
  // Toggle button
  const triggers = document.querySelectorAll('[data-action="trigger-mobile-menu"]');
  for (const trigger of [...triggers]) {
    trigger.addEventListener('click', function () {
      drawer.opened = true;
    });
  }
}
