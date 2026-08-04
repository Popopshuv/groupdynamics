import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "handclaim — privacy policy",
  description:
    "Privacy policy for the handclaim iOS app. handclaim collects nothing: no account, no analytics, no tracking, no server.",
  alternates: { canonical: "/handclaim/privacy" },
};

// App Review clicks the privacy policy URL from App Store Connect, so this page
// is deliberately a plain server component — no RevealText, no per-character
// splitting. The document has to be readable the moment the HTML lands.

const LAST_UPDATED = "31 July 2026";

export default function HandclaimPrivacy() {
  return (
    <div style={styles.page}>
      <article style={styles.doc}>
        <header style={styles.header}>
          <h1 style={styles.title}>handclaim — privacy policy</h1>
          <p style={styles.meta}>Last updated {LAST_UPDATED}</p>
        </header>

        <p style={styles.body}>
          handclaim is made by GROUP DYNAMICS. This policy covers the handclaim
          iOS app (bundle identifier com.groupdynamics.handclaim).
        </p>

        <Section title="The short version">
          <p style={styles.body}>handclaim collects nothing.</p>
          <p style={styles.body}>
            There is no account, no sign-in, no analytics, no advertising, no
            crash reporting, and no third-party SDK that phones home. The app
            has no server and makes no network requests. Nothing you record, and
            no information about you or your device, ever leaves your phone by
            way of this app.
          </p>
        </Section>

        <Section title="What the app accesses, and why">
          <p style={styles.body}>
            <strong style={styles.lead}>Camera.</strong> Used to show the
            viewfinder and to record clips, only while the app is open and you
            are using it.
          </p>
          <p style={styles.body}>
            <strong style={styles.lead}>Microphone.</strong> Used to record
            audio alongside your video, only while a recording is in progress.
          </p>
          <p style={styles.body}>
            <strong style={styles.lead}>Photo library (add-only).</strong> Used
            to save a claimed clip to your library. handclaim requests add-only
            access. It cannot read, browse, or list the photos and videos
            already in your library, and it does not ask for permission to.
          </p>
          <p style={styles.body}>
            Each of these is requested through the standard iOS permission
            prompts. You can change or revoke any of them at any time in
            Settings → Privacy &amp; Security, or in Settings → handclaim.
            Denying camera or microphone access means the app cannot record;
            denying photo library access means a claimed clip cannot be saved,
            and the app will tell you so rather than failing silently.
          </p>
        </Section>

        <Section title="Hand detection">
          <p style={styles.body}>
            handclaim watches the camera feed for a hand held up to the lens.
            This runs entirely on your device using Apple&rsquo;s on-device
            Vision framework. The frames it analyses are held in memory only for
            as long as it takes to analyse them, are never written to disk, and
            are never transmitted. No biometric identification, face
            recognition, or person identification is performed — the detector
            reports only whether a hand shape is present and how much of the
            frame it covers.
          </p>
        </Section>

        <Section title="What happens to your recordings">
          <p style={styles.body}>
            While recording, the clip is written to a temporary file in the
            app&rsquo;s private storage.
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              If the clip is <strong style={styles.lead}>claimed</strong>{" "}
              (either automatically, or by you choosing &ldquo;Save&rdquo;), it
              is copied into your photo library and the temporary file is
              deleted.
            </li>
            <li style={styles.listItem}>
              If the clip is <strong style={styles.lead}>not claimed</strong>,
              the temporary file is deleted.
            </li>
          </ul>
          <p style={styles.body}>
            Once a clip is in your photo library it is yours, governed by your
            own device and iCloud settings. handclaim has no further access to
            it and keeps no copy, index, or record of it.
          </p>
        </Section>

        <Section title="Data sharing">
          <p style={styles.body}>
            None. There is nobody to share it with. handclaim does not sell,
            rent, or disclose personal information, because it does not collect
            any.
          </p>
        </Section>

        <Section title="Tracking">
          <p style={styles.body}>
            handclaim does not track you across apps or websites and does not
            use the Advertising Identifier (IDFA). It therefore does not present
            an App Tracking Transparency prompt.
          </p>
        </Section>

        <Section title="Children">
          <p style={styles.body}>
            handclaim is not directed at children and collects no personal
            information from anyone, including children under 13.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p style={styles.body}>
            If this policy changes, the updated version will be published at
            this address and the date above will change.
          </p>
        </Section>

        <Section title="Contact">
          <p style={styles.body}>
            Questions about this policy:{" "}
            <a
              href="mailto:info@groupdynamics.net"
              style={styles.link}
              className="hover:opacity-50 transition-opacity"
            >
              info@groupdynamics.net
            </a>
          </p>
        </Section>

        <Link
          href="/"
          style={styles.back}
          className="hover:opacity-50 transition-opacity"
        >
          ← group dynamics
        </Link>
      </article>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "var(--page-pad)",
    paddingTop: "6rem",
    paddingBottom: "4rem",
  },
  doc: {
    maxWidth: "34rem",
  },
  header: {
    marginBottom: "2.5rem",
  },
  title: {
    fontSize: "var(--text-reg)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
  },
  meta: {
    fontSize: "var(--text-sm)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    opacity: 0.5,
  },
  section: {
    marginBottom: "2.5rem",
  },
  sectionTitle: {
    fontSize: "var(--text-sm)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    opacity: 0.5,
    marginBottom: "0.75rem",
  },
  body: {
    fontSize: "var(--text-reg)",
    lineHeight: 1.7,
    marginBottom: "1rem",
  },
  lead: {
    fontWeight: 300,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  list: {
    marginBottom: "1rem",
    paddingLeft: "1rem",
  },
  listItem: {
    fontSize: "var(--text-reg)",
    lineHeight: 1.7,
    marginBottom: "0.5rem",
    listStyle: "square",
  },
  link: {
    borderBottom: "1px solid rgba(26,26,26,0.3)",
  },
  back: {
    display: "inline-block",
    marginTop: "1rem",
    fontSize: "var(--text-sm)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    opacity: 0.5,
  },
} as const satisfies Record<string, React.CSSProperties>;
