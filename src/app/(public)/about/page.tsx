import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type FacultyRow = Database["public"]["Tables"]["faculty"]["Row"];

export const metadata = { title: "About" };

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faculty")
    .select("*")
    .eq("published", true)
    .order("last_name", { ascending: true });
  const faculty = data as FacultyRow[] | null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-ucf-white mb-4">About the Studio</h1>
      <p className="text-ucf-gold font-medium mb-8">The Percussion Studies Program at UCF</p>

      <div className="prose max-w-none space-y-6 text-ucf-white leading-relaxed">
        <p>
          The UCF Percussion Studio is a vibrant community of performers, educators, and artists
          committed to excellence across all areas of percussion. Our philosophy centers on a
          &ldquo;total percussion&rdquo; approach, treating every instrument area, genre, and
          expressive outlet with equal depth and seriousness. We believe that great percussionists
          are not specialists in a narrow sense, but versatile, curious musicians prepared for any
          opportunity that comes their way.
        </p>
        <p>
          Students in the studio benefit from weekly private instruction and masterclasses with
          world-renowned faculty who bring decades of professional experience in orchestral,
          chamber, and solo performance. Beyond lessons, students perform alongside their peers in
          the UCF Wind Ensemble, Symphony Orchestra, and Percussion Ensemble, building the ensemble
          skills and musical relationships that are central to a lasting career.
        </p>
        <p>
          Our curriculum is designed to develop not only strong performers but confident educators
          and leaders in the field. Whether your path leads to the concert stage, the classroom, or
          both, the UCF Percussion Studio gives you the foundation to pursue it with confidence.
        </p>

        {/* Faculty */}
        {faculty && faculty.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-ucf-white mt-10">Faculty</h2>
            <div className="grid gap-6 sm:grid-cols-2 not-prose mt-4">
              {faculty.map((member) => (
                <div
                  key={member.id}
                  className="border border-white/20 rounded-lg p-6 flex gap-4"
                >
                  {member.headshot_url ? (
                    <img
                      src={member.headshot_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      className="w-20 h-20 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-ucf-gold flex items-center justify-center text-ucf-black font-bold text-2xl shrink-0">
                      {getInitials(member.first_name, member.last_name)}
                    </div>
                  )}
                  <div>
                    <p className="text-ucf-white font-semibold text-lg">
                      {member.first_name} {member.last_name}
                    </p>
                    {member.title && (
                      <p className="text-ucf-gold text-sm mt-0.5">{member.title}</p>
                    )}
                    {member.bio && (
                      <p className="text-gray-300 text-sm mt-2 leading-relaxed">{member.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-2xl font-bold text-ucf-white mt-10">Ensembles</h2>
        <p>
          Percussion majors have the opportunity to perform in a wide variety of chamber and large
          ensembles across campus, including:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Percussion Ensemble</li>
          <li>Steel Band</li>
          <li>New Music Ensemble</li>
          <li>Symphony Orchestra</li>
          <li>Wind Ensemble</li>
          <li>Symphonic Band</li>
          <li>Marching Knights</li>
        </ul>
        <h2 className="text-2xl font-bold text-ucf-white mt-10">Facilities</h2>
        <p>
          The studio features state-of-the-art practice rooms equipped with marimba, vibraphone,
          xylophone, timpani, and a full complement of concert and world percussion instruments.
        </p>
      </div>
    </div>
  );
}
