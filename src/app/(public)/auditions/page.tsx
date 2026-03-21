export const metadata = { title: "Auditions" };

export default function AuditionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-white mb-4">Audition Information</h1>
      <p className="text-ucf-gold font-medium mb-8">Join the UCF Percussion Studio</p>

      <div className="space-y-10 text-ucf-white leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-ucf-white mb-3">Requirements</h2>
          <p>
            Prospective students should prepare a diverse audition that demonstrates technical
            facility and musicianship across the major instrument families. The following are
            general expectations:
          </p>
          <ul className="list-disc ml-5 mt-3 space-y-2">
            <li>
              A minimum of two contrasting solo works (keyboard percussion, snare drum, or timpani)
              <ul className="list-disc ml-6 mt-1 space-y-1 text-white/80">
                <li>
                  It is common for prospective students to perform all of the following:
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    <li>4-mallet marimba solo</li>
                    <li>2-mallet marimba solo</li>
                    <li>Concert snare drum solo</li>
                    <li>Timpani solo</li>
                  </ul>
                </li>
                <li>
                  You may also choose to supplement with xylophone, vibraphone, rudimental, and
                  drum set repertoire
                </li>
              </ul>
            </li>
            <li>Demonstration of select major and minor scales on marimba</li>
            <li>Demonstration of common rudiments on snare drum</li>
            <li>Sight-reading etudes on concert snare drum and marimba</li>
            <li>
              Aural skills diagnostic evaluation, which includes pitch matching, melody matching,
              and sight singing
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ucf-white mb-3">How to Apply</h2>
          <ol className="list-decimal space-y-6 ml-5">
            <li>
              <span className="font-bold">Apply to UCF Undergraduate or Graduate Admission:</span>{" "}
              Prospective music majors may audition with the School of Performing Arts after
              submitting an application to UCF Undergraduate or Graduate Admissions. Admission into
              this program requires admittance to both the university and school. Apply to UCF by
              going to the{" "}
              <a
                href="https://www.ucf.edu/admissions/undergraduate/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ucf-gold hover:underline font-medium"
              >
                Undergraduate Admissions
              </a>{" "}
              or{" "}
              <a
                href="https://graduate.ucf.edu/admissions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ucf-gold hover:underline font-medium"
              >
                Graduate Admissions
              </a>{" "}
              websites and apply online.
            </li>
            <li>
              <span className="font-bold">Apply for an Audition:</span> Once you have applied to
              UCF Undergraduate Admissions, please fill out our{" "}
              <a
                href="https://cah.ucf.edu/auditions/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ucf-gold hover:underline font-medium"
              >
                Intent to Audition Form
              </a>
              . You can audition while waiting for a decision from Admissions. If you are unable to
              attend an audition on one of the scheduled days, you may submit a digital audition by
              choosing &ldquo;Digital Audition/Alternate Date&rdquo; in the Preferred Audition Date
              field below. A UCF faculty member will contact you after reviewing your video to let
              you know whether you have been accepted into the program.
            </li>
            <li>
              <span className="font-bold">Confirm Your Audition:</span> You will receive an email
              confirmation immediately after submitting this form. We will accept submissions for a
              given date until the Wednesday prior to the audition.
            </li>
            <li>
              <span className="font-bold">Prepare for the Audition:</span> Prepare for the audition
              by visiting the{" "}
              <a
                href="https://cah.ucf.edu/performingarts/music-audition-requirements/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ucf-gold hover:underline font-medium"
              >
                Audition Requirements
              </a>{" "}
              page. Find your instrument area to see what music you will be required to perform
              during the audition.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-ucf-white mb-3">Contact</h2>
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
