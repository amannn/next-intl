export default function ErrorPlaceholder({ error }) {
  if (process.env.NODE_ENV === 'development') {
    console.error(error)
  }
  return <span>{`Application error: a server-side exception has occurred`}</span>
}
