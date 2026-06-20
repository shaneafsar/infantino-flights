// Lets Jest read the ESM modules in public/ by transpiling import/export for Node.
module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};
