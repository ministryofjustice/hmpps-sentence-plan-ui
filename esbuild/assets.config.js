const { copy } = require('esbuild-plugin-copy')
const { sassPlugin } = require('esbuild-sass-plugin')
const { clean } = require('esbuild-plugin-clean')
const esbuild = require('esbuild')
const path = require('path')
const { glob } = require('glob')

const buildAdditionalAssets = buildConfig =>
  esbuild.build({
    outdir: buildConfig.assets.outDir,
    plugins: [
      copy({
        resolveFrom: 'cwd',
        assets: buildConfig.assets.copy,
      }),
    ],
  })

const buildAssets = buildConfig =>
  esbuild.build({
    entryPoints: buildConfig.assets.entryPoints,
    outdir: buildConfig.assets.outDir,
    entryNames: '[ext]/app',
    minify: buildConfig.isProduction,
    sourcemap: !buildConfig.isProduction,
    platform: 'browser',
    target: 'es2018',
    external: ['/assets/*', 'node_modules/hmrc-frontend/*'],
    bundle: true,
    plugins: [
      clean({
        patterns: glob.sync(buildConfig.assets.clear),
      }),
      sassPlugin({
        quietDeps: true,
        loadPaths: [process.cwd(), path.join(process.cwd(), 'node_modules')],
      }),
    ],
  })

module.exports = buildConfig => {
  process.stderr.write('\u{1b}[1m\u{2728}  Building assets...\u{1b}[0m')

  return Promise.all([buildAssets(buildConfig), buildAdditionalAssets(buildConfig)])
}
