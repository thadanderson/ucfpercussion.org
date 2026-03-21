"use client";

import { useState } from "react";

type FacultyMember = {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  bio: string | null;
  headshot_url: string | null;
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function BioText({ text }: { text: string }) {
  // Render newlines as paragraph breaks
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => (
        <p key={i} className="text-gray-300 text-sm leading-relaxed">
          {para.split(/\n/).map((line, j, arr) => (
            j < arr.length - 1 ? <span key={j}>{line}<br /></span> : <span key={j}>{line}</span>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function FacultyCard({ member }: { member: FacultyMember }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-white/20 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex flex-col items-center text-center gap-3">
        {member.headshot_url ? (
          <img
            src={member.headshot_url}
            alt={`${member.first_name} ${member.last_name}`}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-ucf-gold flex items-center justify-center text-ucf-black font-bold text-2xl">
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
        </div>
      </div>

      {member.bio && (
        <div>
          {expanded ? (
            <BioText text={member.bio} />
          ) : (
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
              {member.bio}
            </p>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-ucf-gold text-sm font-medium hover:underline"
          >
            {expanded ? "Read less ↑" : "Read more ↓"}
          </button>
        </div>
      )}
    </div>
  );
}
