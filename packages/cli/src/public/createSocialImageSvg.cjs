async function createSocialImageSvg({
  title = '',
  subTitle = '',
  subTitle2 = '',
  footer = '',
  logo = '',
}) {
  let svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
      <defs></defs>
      <rect width="100%" height="100%" fill="#fff" />
      <circle cx="1000" cy="230" r="530" fill="#ebebeb"></circle>
      <g transform="matrix(0.6, 0, 0, 0.6, 580, 100)">${logo}</g>
      <text x="70" y="200" font-family="'Bitstream Vera Sans','Helvetica',sans-serif" font-weight="700" font-size="80">
        ${title}
      </text>
      <text x="70" y="320" font-family="'Bitstream Vera Sans','Helvetica',sans-serif" font-weight="700" font-size="60">
        ${subTitle}
      </text>
      <text x="70" y="420" font-family="'Bitstream Vera Sans','Helvetica',sans-serif" font-weight="700" font-size="60">
        ${subTitle2}
      </text>
      <text x="70" y="560" fill="gray" font-size="40">
        ${footer}
      </text>
    </svg>
  `;
  return svgStr;
}

module.exports = {
  createSocialImageSvg,
};
