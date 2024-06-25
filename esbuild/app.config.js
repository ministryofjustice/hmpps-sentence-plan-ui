const { copy } = require('esbuild-plugin-copy')
const { typecheckPlugin } = require('@jgoz/esbuild-plugin-typecheck')
const esbuild = require('esbuild')
const glob = require('glob')
const pkg = require('../package.json')

module.exports = buildConfig => {
  console.log('\u{1b}[1m\u{2728}  Building app....\u{1b}[0m')

  esbuild
    .build({
      entryPoints: glob.sync(buildConfig.app.entryPoints),
      outdir: buildConfig.app.outDir,
      bundle: true,
      sourcemap: true,
      platform: 'node',
      format: 'cjs',
      external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
      plugins: [
        typecheckPlugin(),
        copy({
          resolveFrom: 'cwd',
          assets: buildConfig.app.copy,
        }),
      ],
    })
    .catch(() => process.exit(1))
}
