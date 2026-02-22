export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-black mb-4">About the Studio</h1>
      <p className="text-ucf-gold font-medium mb-8">UCF Percussion Studio</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
        <p>
          The UCF Percussion Studio is home to a dynamic community of percussionists committed
          to excellence in performance and musicianship. Students in the studio benefit from
          private instruction, chamber music, and participation in the UCF Wind Ensemble,
          Symphony Orchestra, and Percussion Ensemble.
        </p>
        <p>
          Our faculty bring decades of professional experience in orchestral, chamber, and
          solo performance, as well as a passion for developing the next generation of
          percussionists.
        </p>
        <h2 className="text-2xl font-bold text-ucf-black mt-10">Ensembles</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>UCF Percussion Ensemble</li>
          <li>UCF Wind Ensemble</li>
          <li>UCF Symphony Orchestra</li>
          <li>Chamber Percussion Groups</li>
        </ul>
        <h2 className="text-2xl font-bold text-ucf-black mt-10">Facilities</h2>
        <p>
          The studio features state-of-the-art practice rooms equipped with marimba, vibraphone,
          xylophone, timpani, and a full complement of concert and world percussion instruments.
        </p>
      </div>
    </div>
  );
}
