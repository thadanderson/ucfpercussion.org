export const metadata = { title: "Auditions" };

export default function AuditionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-black mb-4">Audition Information</h1>
      <p className="text-ucf-gold font-medium mb-8">Join the UCF Percussion Studio</p>

      <div className="space-y-10 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-ucf-black mb-3">Requirements</h2>
          <p>
            Prospective students should prepare a diverse audition that demonstrates technical
            facility and musicianship across the major instrument families. The following are
            general expectations:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Two contrasting solo works (one keyboard, one snare drum or timpani)</li>
            <li>Major and minor scales on marimba (four octaves)</li>
            <li>Sight-reading excerpt at the audition</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ucf-black mb-3">How to Apply</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Apply for admission to UCF through the University Admissions office.</li>
            <li>
              Submit an audition request via the College of Arts and Humanities website.
            </li>
            <li>Schedule a live or recorded audition with the studio faculty.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ucf-black mb-3">Contact</h2>
          <p>
            Questions about auditions? Email us at{" "}
            <a
              href="mailto:percussion@ucf.edu"
              className="text-ucf-gold hover:underline font-medium"
            >
              percussion@ucf.edu
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
