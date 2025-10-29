/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    jest: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.eslint.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "standard-with-typescript",
    "plugin:prettier/recommended"
  ],
  rules: {
    // Enforce prettier formatting
    "prettier/prettier": "error",

    // Recommended tweaks for Node backend services:
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: false }
    ],
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }
    ],
    // Sometimes we attach custom fields to errors (err.code = 404)
    "@typescript-eslint/no-explicit-any": "off"
  },
  ignorePatterns: [
    "dist/",
    "node_modules/",
    "coverage/",
    // ts-node-dev and jest cache junk
    "**/*.js",
    // generated/debug tooling
    "*.config.js"
  ]
};
