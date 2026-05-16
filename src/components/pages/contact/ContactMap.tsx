"use client";

export default function ContactMap() {
  return (
    <section className="bg-white py-14 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Heading */}
        <div className="max-w-3xl mb-8 sm:mb-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#111111]">
            Visit Our Location
          </h2>
          <p className="mt-3 text-[#5F6368] text-sm sm:text-base lg:text-lg">
            Find us easily and experience Dazzling Screens in person.
          </p>
        </div>

        {/* Map */}
        <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[420px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3713.8484732851584!2d77.1238036!3d28.6993486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d03d7beccfa43%3A0x1665022b77ea732a!2sDazzling%20Screens!5e1!3m2!1sen!2sin!4v1767735105790!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
