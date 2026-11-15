"use client";

import * as React from "react";
import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/layout";
import { PageHeader, Card, Button, Input, Textarea } from "@/components/ui";
import { Mail, MapPin, Send, MessageSquare, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [botField, setBotField] = React.useState(""); // Honeypot field
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!subject.trim()) {
      setErrorMessage("Please enter a subject.");
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage("Please provide a message with at least 5 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          botField: botField.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to deliver message. Please try again or email rep1exposure@gmail.com directly.");
      } else {
        setSuccessMessage(data.message || "Thank you! Your message has been sent successfully. We will get back to you shortly.");
        // Clear form
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch {
      setErrorMessage("Network error occurred. Please check your connection or email rep1exposure@gmail.com directly.");
    } finally {
      setLoading(false);
    }
  };

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

            <div className="p-4 rounded-xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 text-xs text-[#A3A3A3] space-y-1.5">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] block">Direct Executive Notice</span>
              <p>
                Messages sent via this portal are dispatched directly to REP 1 executive administration (<span className="text-[#F5F5F5] font-semibold">rep1exposure@gmail.com</span>) and logged for rapid response.
              </p>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="md:col-span-7">
            <Card className="bg-[#111111] border-white/10 p-6 md:p-8 space-y-4">
              <h3 className="font-display uppercase text-lg font-bold text-white">
                Send a Message
              </h3>

              {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs space-y-1 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    Message Sent Successfully!
                  </div>
                  <p className="text-emerald-300/90 pl-6 leading-relaxed">
                    {successMessage}
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in duration-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Honeypot field - invisible to humans, catches spambots */}
                <input
                  type="text"
                  name="botField"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Full Name *</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jordan Smith"
                      required
                      disabled={loading}
                      className="bg-[#171717]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Email Address *</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jordan@example.com"
                      required
                      disabled={loading}
                      className="bg-[#171717]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Subject *</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Athlete Recruiting / Elite Pacific Inquiry"
                    required
                    disabled={loading}
                    className="bg-[#171717]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#A3A3A3] mb-1.5 block">Message *</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you? (recruiting questions, combine evaluations, partnership, etc.)"
                    className="h-32 bg-[#171717]"
                    required
                    disabled={loading}
                  />
                </div>

                <Button
                  variant="athletic"
                  size="md"
                  type="submit"
                  disabled={loading}
                  className="gap-2 bg-[#F21717] hover:bg-[#D90F0F] text-xs font-bold w-full sm:w-auto shadow-[0_0_15px_rgba(242,23,23,0.3)] transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="w-3.5 h-3.5" />
                    </>
                  )}
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
