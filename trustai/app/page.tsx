import Link from "next/link";

type Grp = {
  id: string;
  name: string;
  frame: string;
  color: string;
};

export default function Home() {
  const grps: Grp[] = [
    {
      id: "ethos",
      name: "Ethos – Credibility-based",
      frame: "Ethos",
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "pathos",
      name: "Pathos – Emotion-based",
      frame: "Pathos",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "logos",
      name: "Logos – Logic-based",
      frame: "Logos",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <div className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-semibold mb-4">
            CHI 2026 Research Study
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            AI Self-Regulation Coaching System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please select your assigned experimental condition to begin the conversation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grps.map((g) => (
            <Link
              key={g.id}
              href={`/${g.id}`}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${g.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              ></div>

              <div className="relative">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-linear-to-r ${g.color} text-white`}
                >
                  {g.frame}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {g.name}
                </h2>
                <p className="text-gray-500 text-sm">Aristotelian rhetoric</p>

                <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                  Start
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Thank you for taking part in this study.</p>
        </div>
      </div>
    </main>
  );
}
