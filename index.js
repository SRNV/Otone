const buildTmL = require("./build.js");
buildTmL("./src/", process.cwd() + "/syntaxes/ogone.tmLanguage.json");
buildTmL(
  "./injections/proto/",
  process.cwd() + "/syntaxes/injection.proto.json",
);
buildTmL(
  "./injections/style/",
  process.cwd() + "/syntaxes/injection.style.json",
);

buildTmL(
  "./injections/flags/",
  process.cwd() + "/syntaxes/injection.flag.json",
);

buildTmL(
  "./injections/templates/",
  process.cwd() + "/syntaxes/injection.template.json",
);
buildTmL(
  "./injections/deno/",
  process.cwd() + "/syntaxes/injection.deno-source.json",
);
buildTmL(
  "./injections/compo/",
  process.cwd() + "/syntaxes/injection.compo-source.json",
);
