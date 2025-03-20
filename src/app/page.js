import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Munirat Modupeola Salmon</h1>
        <ol>
          <li>Frontend Internship Assessment.</li>
          <li>Click the Button to Navigate to my Work.</li>
        </ol>

        <div className={styles.ctas}>
          <Link href="/Countries" className={styles.primary}>
            Click Me
          </Link>
          <a
            href="/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            View README
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://linkedin.com/in/munirat-salmon"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="LinkedIn"
            width={16}
            height={16}
          />
          My LinkedIn Profile
        </a>
      </footer>
    </div>
  );
}
