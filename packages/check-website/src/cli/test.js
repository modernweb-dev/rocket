// @ts-nocheck

import { cli } from './cli.js';
import { hr } from './helpers.js';
import { LitTerminal } from './LitTerminal.js';
import { renderProgressBar } from './renderProgressBar.js';

const terminal = process.stderr;


class DemoTerminal extends LitTerminal {
  set parseCounter(counter) {
    this._parseCounter = counter;
    this.requestUpdate();
  }

  get parseCounter() {
    return this._parseCounter;
  }

  set internalCounter(counter) {
    this._internalCounter = counter;
    this.requestUpdate();
  }

  get internalCounter() {
    return this._internalCounter;
  }

  set errors(errors) {
    this._errors = errors;
    this.requestUpdate();
  }

  get errors() {
    return this._errors;
  }

  _errors = [];
  _parseCounter = 0;
  _internalCounter = 0;

  execute() {
    this.logStatic('🔎 Checking website...');
    this.logStatic('');

    // Simulate parsing
    setInterval(() => {
      if (this.parseCounter === 100) {
        process.exit(); // exit demo
      }
      this.parseCounter += 1;
    }, 200);

    let pageHasErrors = false;
    let page = {
      name: '📖 Welcome to My Website',
      file: './_site/index.html:34:192',
    };

    this.logStatic(page.name);
    // Simulate Pages
    const pages = [
      { name: 'Contact Us', file: './site/contact-us/index.html:12:44' },
      {
        name: 'How to introduce a Design System',
        file: './_site/blog/how-to-introduce-a-design-system/index.html:393:12',
      },
      { name: 'Documentation', file: './_site/documentation/index.html:492:450' },
      { name: 'Getting Started', file: './_site/documentation/getting-started/index.html:193:48' },
      { name: 'What is a Design System', file: './_site/blog/what-is-a-design-system:92:193' },
    ];
    setInterval(() => {
      if (pageHasErrors && Math.random() > 0.6) {
        page = pages[Math.floor(Math.random() * pages.length)];
        this.logStatic(`📖 ${page.name}`);
        pageHasErrors = false;
      }
    }, 600);

    // Simulate Errors
    const missingList = [
      'missing.html',
      'contact/about.html',
      '/product/xyz/',
      '/blog/2020/01/01/',
    ];
    setInterval(() => {
      if (Math.random() > 0.6) {
        const missing = missingList[Math.floor(Math.random() * missingList.length)];
        this.logStatic(`  🔗 Missing: <a href="${missing}">`);
        this.logStatic(`    🛠️  ${page.file}`);
        if (Math.random() > 0.5) {
          this.logStatic(`    💡 <a href="./correct/url.html"`);
        }
        pageHasErrors = true;
      }
    }, 600);

    // Simulate parsing
    setInterval(() => {
      this.internalCounter += 1;
    }, 100);
  }

  render() {
    return cli`
      ${hr()}
      Parsing:  ${renderProgressBar(this.parseCounter, 0, 100)} ${this.parseCounter}/100
      Internal: ${renderProgressBar(this.internalCounter, 0, 200)} ${this.internalCounter}/200
      ${this.parseCounter === 100 ? '\n🎉 Finished!' : ''}
    `;
  }
}

class SimpleTerminal extends LitTerminal {
  static properties = {
    counter: { type: Number },
  };

  constructor() {
    super();
    this.counter = 0;
  }

  execute() {
    super.execute();

    this.logStatic('🕑 Counter Cli Demo');
    this.logStatic('');
    setInterval(() => {
      if (this.counter === 100) {
        process.exit(); // exit demo
      }
      if (this.counter % 10 === 0) {
        this.logStatic(`🎉 Milestone: ${this.counter}`);
      }
      this.counter += 1;
    }, 100);
  }

  render() {
    return cli`
      ${hr()}
      Counter: ${this.counter}
      Progress: ${renderProgressBar(this.counter, 0, 100)}
      ${this.counter === 100 ? '\n🎉 Finished!' : ''}
    `;
  }
}

// const simpleTerminal = new SimpleTerminal();
// simpleTerminal.execute();

class MyTerminal extends LitTerminal {
  counter = 0;
  milestones = ['a', 'b', 'c'];

  render() {
    return cli`
      🕑 Counter Cli Demo

      Counter: ${this.counter}

      ${this.milestones.map(milestone => `Milestone: ${milestone}\n`)}
    `;
  }
}

const myTerminal = new MyTerminal();
myTerminal.execute();
myTerminal.requestUpdate();


// function foo(counter) {
//   const name = 'John';
//   const items = ['a', 'b', 'c'];
//   return cli`

//     Welcome ${name}!
//     List: ${items.map(item => `[ ] ${item} `)}
//   `;
//   return cli`
//     Welcome to the Foo CLI
//     Check HTML Links
//     Stuff: ${['a', 'b', 'c']}
//     Counter: ${counter}
//   `;
// }

// console.log(foo(1));s
// console.log(foo(2));

// const myTerminal = new MyTerminal();
// myTerminal.execute();

// myTerminal.logStatic('static log: first');
// myTerminal.logStatic('static log: second');
// myTerminal.counter += 1;

// setTimeout(() => {
//   myTerminal.logStatic('static log: third');
//   // myTerminal.logStatic('static log: forth');
//   myTerminal.counter += 1;
// }, 1000);

// setTimeout(() => {
//   // myTerminal.logStatic('static log: x');
//   myTerminal.counter += 1;
// }, 200);

// myTerminal.counter = 3;
// myTerminal.errors = ['one'];

// setInterval(() => {
//   // myTerminal.logStatic('static log: ' + myTerminal.counter);
//   myTerminal.counter += 1;
//   // myTerminal.errors.push('asdf');
//   // myTerminal.errors = [...myTerminal.errors, myTerminal.counter];
// }, 100);

// setTimeout(() => {
//   myTerminal.counter = 4;
//   myTerminal.errors =  ['one', 'two', 'three', 'one', 'two', 'three', 'one', 'two', 'three'];
// }, 1000);

// setTimeout(() => {
//   myTerminal.counter = 5;
//   myTerminal.errors =  ['three'];
// }, 2000);

// setTimeout(() => {
//   myTerminal.counter = 6;
// }, 3000);

// setTimeout(() => {
//   myTerminal.counter = 6;
// }, 4000);

// function cli(strings, values) {
//   // console.log({ strings, values });
//   return {
//     txt: strings.join('\n'),
//     updates: [
//       {
//         y: -3,
//         value: 'Counter: 4'
//       }
//     ]
//   }
// }

// function render(counter) {
//   return cli`
// Check HTML Links
// Counter: ${counter}
// more
// `;
// }

// let first = true;
// function _render(tmpl) {
//   // if (first) {
//     terminal.cursorTo(0, 0);
//     terminal.write(tmpl.txt);
//     // first = false;
//   // } else {
//   //   for (const change of tmpl.updates) {
//   //     terminal.moveCursor(0, change.y);
//   //     terminal.clearLine(0);
//   //     terminal.write(change.value);
//   //   }
//   // }
//   // terminal.cursorTo(0, 0);
//   // terminal.moveCursor(0, -4);
//   // terminal.clearLine(0);
//   // console.log(tmpl);

// }

// // terminal.write('a');
// // terminal.write('b');
// // terminal.write('c');
// // terminal.cursorTo(1, 0);
// // terminal.write('x');

// _render(render(0));

// // terminal.moveCursor(0, -1);
// // terminal.write('x\ny\nz');

// console.log(await getCursorPos());

// // console.log('START');
// // console.log('a');
// _render(render(1));
// // console.log('v');
// _render(render(2));

// function cli(strings, ...values) {
//   const useStrings = typeof strings === 'string' ? [strings] : strings.raw;
//   let result = '';

//   for (var i = 0; i < useStrings.length; i++) {
//     let currentString = useStrings[i];
//     currentString
//       // join lines when there is a suppressed newline
//       .replace(/\\\n[ \t]*/g, '')
//       // handle escaped backticks
//       .replace(/\\`/g, '`');
//     result += currentString;

//     if (i < (arguments.length <= 1 ? 0 : arguments.length - 1)) {
//       result += arguments.length <= i + 1 ? undefined : arguments[i + 1];
//     }
//   }

//   // now strip indentation
//   const lines = result.split('\n');
//   let minIndent = -1;
//   for (const line of lines) {
//     const match = line.match(/^(\s+)\S+/);
//     if (match) {
//       const indent = match[1].length;
//       if (minIndent === -1) {
//         // this is the first indented line
//         minIndent = indent;
//       } else {
//         minIndent = Math.min(minIndent, indent);
//       }
//     }
//   }

//   let finalResult = '';
//   if (minIndent !== -1) {
//     for (const line of lines) {
//       finalResult += line[0] === ' ' ? line.slice(minIndent) : line;
//       finalResult += '\n';
//     }
//   }

//   return (
//     finalResult
//       .trim()
//       // handle escaped newlines at the end to ensure they don't get stripped too
//       .replace(/\\n/g, '\n')
//   );
// }
