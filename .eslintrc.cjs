module.exports = {
  root: true,
  extends: ["next", "next/core-web-vitals"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": ["error"],
    "@typescript-eslint/no-explicit-any": "error"
  },
};
