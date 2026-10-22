import nextTypescript from "eslint-config-next/typescript";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [...nextTypescript, ...nextCoreWebVitals, ...compat.config({
  extends: ["plugin:@typescript-eslint/recommended"],

  rules: {
    "react/no-unescaped-entities": "warn",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@next/next/no-html-link-for-pages": "off",
    "react-hooks/exhaustive-deps": "off",
    "prefer-const": "off",
    "@typescript-eslint/no-unused-expressions": "off",
  }
}), {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}];
