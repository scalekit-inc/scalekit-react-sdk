import { dts } from 'rollup-plugin-dts';

// Bundles the type declarations. tsup's built-in `dts` option needs the
// TypeScript JS compiler API, which TypeScript 7 no longer ships, so the
// declarations are built here with rollup-plugin-dts (which falls back to
// @typescript/typescript6 for the compiler API).
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.d.ts', format: 'es' },
    { file: 'dist/index.d.cts', format: 'es' },
  ],
  plugins: [
    dts({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        declaration: true,
        noEmit: false,
        emitDeclarationOnly: true,
        noEmitOnError: true,
        declarationMap: false,
        skipLibCheck: true,
      },
    }),
  ],
  external: [/^react($|\/)/, /^react-dom($|\/)/, /^oidc-client-ts($|\/)/],
};
