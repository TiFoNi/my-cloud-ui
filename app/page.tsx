import styles from "./home.module.css";

export default function HomePage() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Welcome to RicoCloud!</h2>
      <p className={styles.subtitle}>Upload and manage your files securely.</p>
    </div>
  );
}
