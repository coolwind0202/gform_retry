import nodeResolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/bundle/content_script.js",
    format: "iife",
  },
  plugins: [
    nodeResolve({
      extensions: [".ts", ".js"],
    }),
  ],
};
