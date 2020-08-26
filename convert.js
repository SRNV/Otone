const y = require("any-json");
const fs = require("fs");
const plist = require("plist-ex");
console.warn(plist);
async function convert(opts, strg) {
  const obj = plist.parseFileSync(strg);
  const str = await y.encode(obj, "yaml");
  fs.writeFileSync(opts.output, str);
  console.log(str);
}
convert({
  output: "output.yaml",
}, "./sources/css.plist");
