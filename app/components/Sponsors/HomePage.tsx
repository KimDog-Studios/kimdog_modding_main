import React, { useEffect, useState, useRef } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";

type Sponsor = {
  name: string;
  image: string;
  description: string;
  buttonText: string;
  link?: string;
};

export default function SponsorSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "sponsors"),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const sponsorData: Sponsor[] = snapshot.docs.map((doc) => ({
          name: doc.data().name,
          image: doc.data().image,
          description: doc.data().description,
          buttonText: doc.data().buttonText,
          link: doc.data().link,
        }));

        const repeatCount = 10;
        const extendedSponsors = Array(repeatCount).fill(sponsorData).flat();
        setSponsors(extendedSponsors);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching sponsors:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="w-full bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 py-12 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-white text-3xl font-bold mb-10 text-center">
          Our Proud Sponsors
        </h2>

        {loading ? (
          <div className="text-center text-purple-200">Loading sponsors...</div>
        ) : (
          <div
            className="relative overflow-hidden"
            style={{ touchAction: "none" }}
            aria-label="Scrolling sponsors"
          >
            <div
              ref={scrollRef}
              className="flex whitespace-nowrap gap-10"
              style={{
                animation: "scrollSponsors 15s linear infinite",
                willChange: "transform",
              }}
            >
              {sponsors.map(
                ({ name, image, description, buttonText, link }, idx) => (
                  <div
                    key={`${name}-${idx}`}
                    className="inline-flex flex-col items-center justify-center text-center max-w-xs px-6 py-6 bg-purple-800/40 rounded-xl shadow-md backdrop-blur-sm hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={image}
                      alt={name}
                      className="h-36 w-auto object-contain mb-4 filter brightness-90 hover:brightness-110 transition duration-100"
                      loading="lazy"
                    />
                    <h3 className="text-white text-xl font-semibold mb-1">
                      {name}
                    </h3>
                    <p className="text-purple-200 text-sm mb-4">
                      {description}
                    </p>
                    {link && link.trim() !== "" && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-purple-800 hover:bg-purple-100 font-semibold text-sm py-2 px-6 rounded-full transition duration-200 shadow"
                      >
                        {buttonText}
                      </a>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scrollSponsors {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }
      `}</style>
    </section>
  );
}
