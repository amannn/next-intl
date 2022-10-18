/**
 * For the strictly typed messages to work we have to wrap the namespace into
 * a mandatory prefix. See https://stackoverflow.com/a/71529575/343045
 */
export default function resolveNamespace(
  namespace: string,
  namespacePrefix: string
) {
  return namespace === namespacePrefix
    ? undefined
    : namespace.slice((namespacePrefix + '.').length);
}
