import type { Metadata } from "next";
import { TEXTS } from "@/lib/texts";

export const metadata: Metadata = { title: "About & credits" };

export default function About() {
  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-semibold">About & credits</h1>
      <p>
        Dharmic Data is a reader for the open{" "}
        <a className="text-accent underline" href="https://github.com/bhavykhatri/DharmicData">
          DharmicData
        </a>{" "}
        dataset. The texts are stored as plain JSON in that repository, so you can build on them too.
      </p>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Sources</h2>
        <ul className="space-y-1.5 text-sm">
          {TEXTS.map((t) => (
            <li key={t.id}>
              <span className="font-medium">{t.name}</span> —{" "}
              <a className="text-accent underline" href={t.creditUrl} rel="noopener noreferrer">
                {t.credit}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Licence</h2>
        <p className="text-sm">
          The dataset is published under the{" "}
          <a className="text-accent underline" href="https://opendatacommons.org/licenses/odbl/">
            Open Database Licence (ODbL)
          </a>
          . If you reuse or adapt it, credit the sources above and share your adapted database under the same licence.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">A note on accuracy</h2>
        <p className="text-sm text-muted">
          These texts were collected from several online sources and may contain transcription or alignment errors, including in verse numbering. For study or recitation, please check against a trusted printed edition.
        </p>
      </section>
    </article>
  );
}
