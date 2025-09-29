module.exports = {
  name: 'next-intl-extractor',
  binaryName: 'next-intl-extractor',
  packageName: 'next-intl-extracted',
  build: {
    targets: [
      'x86_64-unknown-linux-gnu',
      'aarch64-unknown-linux-gnu',
      'x86_64-apple-darwin',
      'aarch64-apple-darwin',
      'x86_64-pc-windows-msvc'
    ],
    release: true,
    strip: true
  }
};
