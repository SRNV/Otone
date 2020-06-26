const fs = require("fs");
const y = require("any-json");
const path = require("path");
async function build(input, output) {
  const realInput = path.join(process.cwd(), `${input}`);
  const dir = fs.readdirSync(realInput);
  let main = null;
  if (dir.includes("main.yml")) {
    const txt = fs.readFileSync(`${realInput}/main.yml`, "utf8");
    y.decode(txt, "yaml").then(async (obj) => {
      main = obj;
      const ymls = dir.filter((f) => f.endsWith(".yml") && f !== "main.yml");
      for await (let f of ymls) {
        const file = path.join(realInput, f);
        const id = file.replace(process.cwd(), "");
        const t = fs.readFileSync(file, "utf8");
        const o = await y.decode(t, "yaml");
        if ("_includeIn" in o) {
          const { _includeIn } = o;
          delete o._includeIn;
          if (!main.repository[id]) {
            main.repository[id] = { ...o };
          } else {
            main.repository[id] = {
              ...o,
              ...main.repository[id],
              patterns: [
                ...main.repository[id].patterns,
                ...(o.patterns || []),
              ],
            };
          }
          if (typeof _includeIn === "string") {
            if (!main.repository[_includeIn]) {
              main.repository[_includeIn] = {
                patterns: [],
              };
            }
            if (main.repository[_includeIn]) {
              if (!main.repository[_includeIn].patterns) {
                main.repository[_includeIn].patterns = [];
              }
              if (
                main.repository[_includeIn].patterns &&
                !main.repository[_includeIn].patterns.find(
                  (inc) => inc.include === `#${id}`
                )
              ) {
                main.repository[_includeIn].patterns.push({
                  include: `#${id}`,
                });
              }
            }
          } else if (Array.isArray(_includeIn)) {
            _includeIn.forEach((repo) => {
              if (!main.repository[repo]) {
                main.repository[repo] = {
                  patterns: [],
                };
              }
              if (main.repository[repo]) {
                if (!main.repository[repo].patterns) {
                  main.repository[repo].patterns = [];
                }

                if (
                  main.repository[repo].patterns &&
                  !main.repository[repo].patterns.find(
                    (inc) => inc.include === `#${id}`
                  )
                ) {
                  main.repository[repo].patterns.push({
                    include: `#${id}`,
                  });
                }
              }
            });
          }
        }
      }
      const txt = await y.encode(main, "json");
      fs.writeFileSync(output, txt, "utf8");
    });
  }
}
module.exports = build;
