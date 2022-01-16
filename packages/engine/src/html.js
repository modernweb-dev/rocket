// Nearly no-op template tag to get syntax highlighting and support Arrays.
export function html(strings, ...values) {
  let output = strings[0];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    output += Array.isArray(value) ? value.join('\n') : String(value);
    output += strings[i + 1];
  }
  return output;
}
