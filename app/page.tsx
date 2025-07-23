import styles from "./page.module.css";

import Wrapper from "@/components/Wrap";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Wrapper />
      </main>
    </div>
  );
}
