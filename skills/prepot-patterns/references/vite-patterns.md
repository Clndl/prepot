# Vite Configuration Patterns

## Purpose
Enforce standard Vite configuration conventions for React applications, optimizing build chunks, server settings, and dev experience.

## Apply when
Creating, updating, or refactoring a `vite.config.ts` or `vite.config.js` file.

## Rules
- **Build Output**: Set `build.outDir` to `'build'` (overriding the Vite default `dist`).
- **Chunk Splitting**: Use `manualChunks` in `rollupOptions.output` to split `node_modules` into explicit vendor chunks: `react-vendor`, `mui-vendor`, `i18n-vendor`, and `utils-vendor`.
- **Plugins**: Include standard plugins: `react()`, `svgr()`, `runtimeEnv()`, and `visualizer()` (outputting to `stats.html` with gzip/brotli disabled).
- **Custom Plugins**:
  - `modeLoggerPlugin`: Log mode, HMR status, and environment variables (formatted with a 40-dash border and keys padded to 20 spaces).
  - `bannerPlugin`: Inject a `/*! ... */` comment block with the current year, Copyright, and proprietary warning into `.js` chunks.
- **Server**: 
  - Set `host: '0.0.0.0'` and `port: 3000` (or via environment variable).
  - Explicitly define `allowedHosts` (`localhost`, `127.0.0.1`).
  - Disable polling (`watch: { usePolling: false }`) and ignore AI/Agent folders (`**/.claude/**`, `**/.agent/**`, `**/.codex/**`).
  - Enable the HMR overlay.
- **Aliases**: Configure `resolve.alias` mapping `@` to `./src`.
- **Pre-bundling**: Explicitly define `optimizeDeps.include` for heavy UI/utility libraries (e.g., MUI, React, i18next, Axios, Date-fns) to speed up dev server cold starts.
- **Styles**: Globally inject SCSS variables and mixins via `css.preprocessorOptions.scss.additionalData`.

## Avoid
- Using the default `dist` output directory.
- Generating a single massive JS bundle (always use `manualChunks`).
- Relying on Vite's automatic dependency discovery for heavy libraries (use `optimizeDeps.include`).
