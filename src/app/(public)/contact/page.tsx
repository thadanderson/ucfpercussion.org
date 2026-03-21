export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-white mb-4">Contact Us</h1>
      <p className="text-ucf-white mb-10 leading-relaxed">
        We&apos;d love to hear from you. Reach out with questions about auditions, lessons,
        performances, or anything else related to the UCF Percussion Studio.
      </p>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-ucf-white uppercase tracking-widest mb-1">
            Email
          </h2>
          <a
            href="mailto:percussion@ucf.edu"
            className="text-ucf-gold text-lg font-medium hover:underline"
          >
            percussion@ucf.edu
          </a>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ucf-white uppercase tracking-widest mb-1">
            Location
          </h2>
          <p className="text-ucf-white">
            UCF School of Performing Arts
            <br />
            12488 Centaurus Blvd.
            <br />
            Orlando, FL 32816-1354
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ucf-white uppercase tracking-widest mb-2">
            How to Get Here
          </h2>
          <div className="space-y-3 text-ucf-white">
            <p>
              The Performing Arts Center (PAC) is located on UCF&apos;s main campus. The Music
              offices are in the south building (PAC M203), with reception on the second floor near
              the interior staircase. Staff are available Monday – Friday, 8:00 AM – 5:00 PM.
            </p>
            <p>
              <a
                href="https://goo.gl/maps/gVqeHKfnZRXzcDTH6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ucf-gold hover:underline font-medium"
              >
                Open in Google Maps →
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ucf-white uppercase tracking-widest mb-2">
            Parking
          </h2>
          <p className="text-ucf-white">
            A parking pass is required on campus unless you are attending an event with designated
            free parking. Visit{" "}
            <a
              href="https://parking.ucf.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ucf-gold hover:underline"
            >
              UCF Parking Services
            </a>{" "}
            for details.
          </p>
        </div>
      </div>
    </div>
  );
}
