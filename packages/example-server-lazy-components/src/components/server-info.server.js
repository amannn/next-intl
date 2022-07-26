export default function ServerInfo() {
  return (
    <div style={{ textAlign: 'center', fontSize: 14, paddingBottom: 20 }}>
      Rendered at {new Date().toTimeString()} with Edge Middleware.
    </div>
  )
}
