import js from "@eslint/js";
import node from "eslint-plugin-n";
import mocha from "eslint-plugin-mocha";
import imprt from "eslint-plugin-import";
import unicorn from "eslint-plugin-unicorn";
import react from "eslint-plugin-react";
import hooks from "eslint-plugin-react-hooks";
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import globals from "globals";

const testFiles = ["test/{,**/}*.js{,x}"];

export default [
  js.configs.recommended,
  node.configs["flat/recommended-script"],
  comments.recommended,
  unicorn.configs.recommended,
  imprt.flatConfigs.recommended,
  {
    languageOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "unicorn/no-null": 0,
      "unicorn/prevent-abbreviations": 0,
      "unicorn/no-anonymous-default-export": 0,
      "unicorn/no-await-expression-member": 0,
      "@eslint-community/eslint-comments/no-unused-disable": "error",
    },
  },
  {
    ...mocha.configs.recommended,
    files: testFiles,
  },
  {
    files: testFiles,
    rules: {
      "mocha/no-mocha-arrows": "off",
    },
  },
  {
    ...react.configs.flat.recommended,
    files: ["**/*.jsx"],
  },
  {
    ...react.configs.flat["jsx-runtime"],
    files: ["**/*.jsx"],
  },
  {
    ...hooks.configs.flat.recommended,
    files: ["**/*.jsx"],
  },
  {
    ignores: [
      "coverage/",
      "node_modules/",
      "dist/",
      "examples/public/client.js",
    ],
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
