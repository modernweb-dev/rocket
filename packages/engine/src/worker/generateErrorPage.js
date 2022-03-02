/**
 * @param {string | undefined} input
 * @returns {string}
 */
function escape(input) {
  if (input) {
    let escaped = input;
    escaped = escaped.replace(/</g, '&gt;');
    escaped = escaped.replace(/>/g, '&lt;');
    return escaped;
  }
  return '';
}

/**
 * @param {string} text
 * @returns {string}
 */
function linkFiles(text) {
  const lines = text.split('\n');
  const output = [];
  for (const line of lines) {
    const indexOpening = line.indexOf('(');
    if (indexOpening >= 0) {
      const indexEnd = line.indexOf(')', indexOpening);
      const file = line.substring(indexOpening + 1, indexEnd);
      const url = file.replace('file:///', 'vscode://file/');
      const newString =
        line.slice(0, indexOpening + 1) + `<a href="${url}">${file}</a>` + line.slice(indexEnd);
      output.push(newString);
    } else {
      output.push(line);
    }
  }
  return output.join('\n');
}

/**
 * @param {Error} error
 * @returns {string}
 */
export function generateErrorPage(error) {
  const errorHtml = `
    <html>
      <head>
        <title>${error.message}</title>
        <style>
          body { 
            margin: 0;
          }
          h1 {
            color: red;
          }
          div {
            margin: 0 auto;
            max-width: 960px;
            background: #eee;
            height: 100%;
            padding: 50px;
          }
          p {
            font-size: 25px;
            text-align: center;
            padding: 20px;
            margin: 0;
            text-transform: uppercase;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div>
          <p>🛑 Server Error 🛑</p>
          <h1>${error.message}</h1>
          <pre class="stack">${linkFiles(escape(error.stack))}</pre>
        </div>
      </body>
    </html>
  `;
  return errorHtml;
}
