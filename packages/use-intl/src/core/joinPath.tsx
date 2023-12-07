export default function joinPath(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join('.');
}
