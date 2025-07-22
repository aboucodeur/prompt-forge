const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const buildConfig = {
  entryPoints: ['src/index.ts'], // it support typescript
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'dist',
  platform: 'node',
  target: ['node14'],
  format: 'cjs',
  plugins: [nodeExternalsPlugin()],
  external: ['fs'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
};

// Build for CommonJS
async function build() {
  try {
    await esbuild.build({
      ...buildConfig,
      outExtension: { '.js': '.js' },
    });
    
    // Also create a minified version
    await esbuild.build({
      ...buildConfig,
      outExtension: { '.js': '.min.js' },
      minify: true,
      sourcemap: false,
    });
    
    console.log('Build completed successfully!');
  } catch (e) {
    console.error('Build failed:', e);
    process.exit(1);
  }
}

build();
