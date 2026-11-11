// lerna's `removePackageFields` doesn't apply to `pnpm stage publish`
module.exports = {
  hooks: {
    beforePacking(pkg) {
      delete pkg.devDependencies;
      delete pkg.prettier;
      return pkg;
    }
  }
};
