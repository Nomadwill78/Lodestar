import LegalPage from "../../components/LegalPage";

export const metadata = {
  title: "Disclaimer — Lodestar",
  description: "Lodestar is a personal development tool, not therapy or medical care.",
};

export default function Disclaimer() {
  return (
    <LegalPage title="Important disclaimer" updated="June 30, 2026">
      <p>
        <strong>Lodestar is a personal development and productivity tool. It is not
        therapy, counseling, or medical care, and Vega is not a doctor, therapist,
        or licensed professional.</strong>
      </p>
      <p>
        The guidance Lodestar and Vega provide is for general informational and
        motivational purposes. It is not a diagnosis, treatment, or professional
        advice of any kind, and it is not a substitute for care from a qualified
        health provider. Always seek the advice of a licensed professional with any
        questions about your mental or physical health.
      </p>
      <h2>If you are in crisis</h2>
      <p>
        If you are thinking about harming yourself or are in immediate danger,
        please reach out now. In the US, call or text 988 for the Suicide and
        Crisis Lifeline, or text HOME to 741741. In the UK or Ireland, call
        Samaritans on 116 123. In Australia, call Lifeline on 13 11 14. Anywhere
        else, <a href="https://findahelpline.com">findahelpline.com</a> lists a
        free, trained line for your country. If life is in danger, call your local
        emergency number.
      </p>
      <h2>About the science we reference</h2>
      <p>
        Lodestar draws on established ideas from cognitive and behavioral science,
        such as attention, priming, implementation intentions, and self-efficacy.
        We describe these in plain language to explain how the product works. These
        references are educational and do not constitute clinical or scientific
        advice for your specific situation.
      </p>
      <h2>No guaranteed outcomes</h2>
      <p>
        Your results depend on many factors within your own life and effort.
        Lodestar does not promise any specific outcome, income, or achievement.
      </p>
    </LegalPage>
  );
}
