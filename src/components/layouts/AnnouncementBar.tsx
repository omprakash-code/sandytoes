"use client";

const announcementText =
  "PLAN YOUR TREASURE CAY ESCAPE WITH SANDY TOES. RESERVE DIRECT FOR FAMILY-FRIENDLY VILLA STAYS STEPS FROM THE BEACH.";

export default function AnnouncementBar() {
  return (
    <div
      id="top-announcement-marquee"
      className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(90deg,rgba(8,8,8,0.78)_0%,rgba(30,20,6,0.82)_50%,rgba(8,8,8,0.78)_100%)] py-1 backdrop-blur-sm"
    >
      <div className="top-announcement-marquee__track">
        {[0, 1, 2].map((copyIndex) => (
          <div className="top-announcement-marquee__group" key={copyIndex}>
            <span className="top-announcement-marquee__item">
              {announcementText}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
