import styles from './footer.module.css';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.row}>
          <p className={styles.copyright}>
            &copy; {year} SonicSaaS. All rights reserved.
          </p>
          <div className={styles.links}>
            <a href="https://sonicsaas.com">sonicsaas.com</a>
            <a href="https://sonicsaas.com/privacy">Privacy</a>
            <a href="https://sonicsaas.com/terms">Terms</a>
            <a href="https://sonicsaas.com/security">Security</a>
            <a href="https://sonicsaas.com/acceptable-use">Acceptable Use</a>
            <a href="/api">API Reference</a>
            <a
              href="https://status.sonicsaas.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
