export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-black mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-10 leading-relaxed">
        We&apos;d love to hear from you. Reach out with questions about auditions, lessons,
        performances, or anything else related to the UCF Percussion Studio.
      </p>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">
            Location
          </h2>
          <p className="text-gray-700">
            Dr. Phillips Academic Commons
            <br />
            University of Central Florida
            <br />
            Orlando, FL 32816
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">
            Office Hours
          </h2>
          <p className="text-gray-700">Monday – Friday, 9:00 AM – 5:00 PM</p>
        </div>
      </div>
    </div>
  );
}
