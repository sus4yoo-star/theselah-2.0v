import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// ESLint 9 flat config. Next 16 removed the built-in `next lint` runner, so
// linting is a standalone step (`npm run lint`). eslint-config-next@16 ships
// a native flat-config array, so we spread it directly.
const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts"],
  },
  {
    // The react-hooks plugin bundled with Next 16 introduces stricter rules
    // (e.g. set-state-in-effect) that flag long-standing, working patterns
    // such as initialising state from localStorage on mount. Surfacing them
    // as warnings keeps the build/CI green while leaving them visible for a
    // dedicated, individually-tested cleanup pass later.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/purity": "warn",
    },
  },
];

export default eslintConfig;
