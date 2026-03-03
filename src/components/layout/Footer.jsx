export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-text">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://github.com/Hey-Steve-Dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Hey Steve Dev
          </a>
        </div>
      </div>
    </footer>
  );
}
