import ContactForm from "../components/ContactForm";
import { FadeUpWhenVisible } from "../components/FadeUpWhenVisible";

const CONTACT_ADDRESS = "กรุงเทพมหานคร ประเทศไทย";
const CONTACT_PHONE = "+66-999-7777-000";
const CONTACT_EMAIL = "hello123@gmail.com";
const CONTACT_HOURS = "จันทร์-ศุกร์ - 08:00-19:00";

const BANGKOK_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.3489949999997!2d100.5018!3d13.7563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6032280d61f3%3A0x10100b25de24820!2z4Lir4Lij4Li04LiV4Lix4LiZ4LmA4Lij4LmM!5e0!3m2!1sth!2sth!4v1620000000000!5m2!1sth!2sth";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F5F3F7]">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <FadeUpWhenVisible>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2d1b4e] text-center">
            ติดต่อ
          </h1>
          <div className="w-12 h-0.5 bg-[#6b5b7a] mx-auto my-4" />
        </FadeUpWhenVisible>

        {/* Form */}
        <FadeUpWhenVisible delay={80}>
          <div className="bg-white rounded-2xl shadow-md border border-white/80 p-6 md:p-8 mb-10 max-w-3xl mx-auto">
            <ContactForm />
          </div>
        </FadeUpWhenVisible>

        {/* Contact info (left) + Map (right) */}
        <FadeUpWhenVisible delay={120}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* ซ้าย: ข้อมูลติดต่อ */}
          <div className="bg-white rounded-2xl shadow-md border border-white/80 p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#2d1b4e] mb-4">ข้อมูลติดต่อ</h2>
            <p className="text-[#333] font-medium mb-4">{CONTACT_ADDRESS}</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-[#6b5b7a] shrink-0" />
                <a href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`} className="text-[#333] hover:text-[#6b5b7a] no-underline">
                  {CONTACT_PHONE}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <EmailIcon className="w-5 h-5 text-[#6b5b7a] shrink-0" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#333] hover:text-[#6b5b7a] no-underline">
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="w-5 h-5 text-[#6b5b7a] shrink-0" />
                <span className="text-[#333]">{CONTACT_HOURS}</span>
              </div>
            </div>
          </div>

          {/* ขวา: แผนที่ */}
          <div className="bg-white rounded-2xl shadow-md border border-white/80 overflow-hidden aspect-[4/3] min-h-[280px]">
            <iframe
              src={BANGKOK_MAP_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="แผนที่ กรุงเทพมหานคร"
              className="block w-full h-full min-h-[280px]"
            />
          </div>
        </div>
        </FadeUpWhenVisible>
      </div>
    </div>
  );
}
