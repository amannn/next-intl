export default function Footer() {
  return (
    <div>
      <footer className="footer">
        Guidelines | FAQ | Lists | API | Security | Legal | Apply to YC |
        Contact
      </footer>

      <style jsx>{`
      .footer {
        padding: 10px 0 40px;
        color: #ccc;
        font-size: 14px;
        text-align: center;
        border-top: 1px solid;
        margin-top: 50px;
      }
    `}</style>
    </div>
  )
}
