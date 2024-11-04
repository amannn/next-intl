# Test type exports

Ensure that exported types work as expected for library creators.

## Motivation

When setting `compilerOptions.declaration` to `true`, TypeScript attempts to
generate declaration files for all exported variables. This can fail with the
following error if there are missing exports in the library:

> The inferred type of 'SomeType' cannot be named without a reference to  
> '../some/path'
