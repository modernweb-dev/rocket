export function hr(length = process.stderr.getWindowSize()[0]) {
  return '─'.repeat(length);
}

export function hideCursor() {
  process.stderr.write('\u001B[?25l');
}

export function showCursor() {
  process.stderr.write('\u001B[?25h');
}
