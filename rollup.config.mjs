import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: {
    google_form: "src/google_form/main.ts",
  },
  output: {
    dir: "dist/bundle",
    format: "es",
  },
  plugins: [typescript(), nodeResolve()],
};
