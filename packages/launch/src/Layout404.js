import { html } from 'lit';

export class Layout404 {
  render() {
    return html`
      <html lang="en">
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="menu:exclude" content="true" />
        <title>Page not found</title>
        <link rel="stylesheet" href="resolve:@rocket/launch/css/404.css" />

        <body class="bg-purple">
          <div class="stars">
            <div class="central-body">
              <img src="resolve:@rocket/launch/assets/404/404.svg" alt="404" />
              <a href="/" class="btn-go-home">GO BACK HOME</a>
            </div>
            <div class="objects">
              <div class="object_rocket">
                <img src="resolve:@rocket/launch/assets/404/rocket.svg" alt="rocket" />
              </div>
              <div class="earth-moon">
                <div class="object_earth">
                  <img src="resolve:@rocket/launch/assets/404/earth.svg" alt="earth" />
                </div>
                <div class="object_moon">
                  <img src="resolve:@rocket/launch/assets/404/moon.svg" alt="moon" />
                </div>
              </div>
              <div class="box_astronaut">
                <div class="object_astronaut">
                  <img src="resolve:@rocket/launch/assets/404/astronaut.svg" alt="astronaut" />
                </div>
              </div>
            </div>
            <div class="glowing_stars">
              <div class="star"></div>
              <div class="star"></div>
              <div class="star"></div>
              <div class="star"></div>
              <div class="star"></div>
            </div>
          </div>

          <span id="copyright">
            404 page by
            <a href="https://www.salehriaz.com">Saleh Riaz Qureshi</a>
          </span>
        </body>
      </html>
    `;
  }
}
