import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { PageHeader, Card, CardContent, Button, Input, Textarea } from "@/components/ui";
import { Mail, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col">
      <PublicNavbar />

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-12 flex-1 w-full space-y-10">
        <PageHeader
          eyebrow="GET IN TOUCH"
          title="Contact REP 1 Exposure"
          description="Have questions about recruiting, Elite Pacific Sports, or Student Academy memberships? Send us a message and our team will be in touch."
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Contact Info Column */}
          <div className="md:col-span-5 space-y-6">
            <Card className="bg-[#111111] border-white/10 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F21717]/15 border border-[#F21717]/30 flex items-center justify-center text-[#F21717] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display uppercase text-sm font-bold text-white">
                    Email Support
                  </h3>
                  <a href="mailto:rep1exposure@gmail.com" className="text-xs text-[#A3A3A3] hover:text-[#F21717] transition-colors mt-0.5 block">
                    rep1exposure@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/5">
                <div className="w-9 h-9 rounded-lg bg-[#00D1B2]/15 border border-[#00D1B2]/30 flex items-center justify-center text-[#00D1B2] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display uppercase text-sm font-bold text-white">
                    Headquarters
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5 leading-relaxed">
                    Brisbane, QLD, Australia<br />
                    Global Collegiate Recruiting Pathways
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display uppercase text-sm font-bold text-white">
                    Recruiter Inquiries
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">
                    College coaches & scouts get direct verified roster access.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-7">
            <Card className="bg-[#111111] border-white/10 p-6 md:p-8 space-y-4">
              <h3 className="font-display uppercase text-lg font-bold text-white">
                Send a Message
              </h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Full Name</label>
                    <Input placeholder="Jordan Smith" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Email Address</label>
                    <Input type="email" placeholder="jordan@example.com" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Subject</label>
                  <Input placeholder="Athlete Recruiting / Elite Pacific Inquiry" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Message</label>
                  <Textarea placeholder="How can we help you?" className="h-32" />
                </div>

                <Button variant="athletic" size="md" type="submit" className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold w-full sm:w-auto">
                  Send Message <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
