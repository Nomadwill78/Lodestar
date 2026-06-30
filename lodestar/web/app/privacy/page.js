import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "Privacy Policy — Lodestar",
  description: "How Lodestar collects, uses, and protects your data.",
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="June 30, 2026">
      <p>
        This policy explains what Lodestar collects, how we use it, and the choices
        you have. Lodestar is operated by Nomad ("we", "us"). If you have questions,
        reach us at <a href="mailto:nomadconsulting7@gmail.com">nomadconsulting7@gmail.com</a>.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account</strong>: your email address, used to sign you in.</li>
        <li><strong>Your Life Map and entries</strong>: the goals, blockers, reflections, and journal entries you create in the app.</li>
        <li><strong>Device region and timezone</strong>: so we can localize support resources and send your daily brief at the right local time.</li>
        <li><strong>Notification token</strong>: if you enable push, a device token so we can deliver reminders.</li>
        <li><strong>Basic usage</strong>: limited technical data needed to run and secure the service.</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To provide the core product: your brief, reframes, Life Map, and reminders.</li>
        <li>To generate guidance through our AI guide, Vega.</li>
        <li>To keep your account secure and improve reliability.</li>
      </ul>

      <h2>AI processing</h2>
      <p>
        To generate Vega's responses, the text you submit (such as a journal entry)
        is sent to our AI provider, Anthropic, for processing. We do not sell your
        data, and your content is not used to train third-party models. Processing
        happens only to return your result.
      </p>

      <h2>How your data is stored and shared</h2>
      <p>
        Your data is stored with our infrastructure provider, Supabase, and is
        protected by row-level security so each member can access only their own
        records. We share data only with the service providers needed to run
        Lodestar (such as hosting, AI processing, and push delivery). We do not sell
        your personal information.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can request a copy of your data or ask us to delete your account and its
        contents by emailing <a href="mailto:nomadconsulting7@gmail.com">nomadconsulting7@gmail.com</a>.
        Depending on where you live, you may have additional rights under laws such
        as the GDPR or CCPA.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your data while your account is active. When you ask us to delete it,
        we remove your records, except where we must keep limited information to meet
        legal obligations.
      </p>

      <h2>Security</h2>
      <p>
        We use encryption in transit, encrypted session storage on your device, and
        access controls on the database. No system is perfectly secure, but we work
        to protect your information.
      </p>

      <h2>Children</h2>
      <p>
        Lodestar is intended for adults 18 and older and is not directed to children.
      </p>

      <h2>A note on sensitive moments</h2>
      <p>
        Lodestar is not therapy or medical care. Please see our{" "}
        <a href="/disclaimer">disclaimer</a> for details and crisis resources.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy as the product grows. We will post the new version
        here with an updated date.
      </p>
    </LegalPage>
  );
}
