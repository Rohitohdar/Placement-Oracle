"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { BriefcaseBusiness, FileBadge2, Github, Layers3, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FocusEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/navigation/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SectionTitle } from "@/components/ui/section-title";
import { StatusBanner } from "@/components/ui/status-banner";
import { skillsOptions } from "@/lib/dashboard-data";
import {
  api,
  calculateGithubScore,
  DASHBOARD_STORAGE_KEY,
  extractGithubUsername,
  extractHackerRankUsername,
  extractLinkedinUsername,
  GithubStats,
  getStoredEmail,
  isValidEmail,
  isAuthenticated,
  normalizeGithubUrl,
  normalizeHackerRankUrl,
  normalizeLinkedinUrl,
  setFlashMessage,
  StoredDashboardPayload
} from "@/lib/api";

type FormState = {
  name: string;
  email: string;
  cgpa: string;
  branch: string;
  year: string;
  projects: string;
  internships: string;
  dsaScore: string;
  communicationScore: string;
  working: string;
  yearsOfExperience: string;
  github: string;
  linkedin: string;
  hackerrank: string;
  targetCompany: string;
  targetPackage: string;
  skills: string[];
  resumeName: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  cgpa: "",
  branch: "",
  year: "",
  projects: "",
  internships: "",
  dsaScore: "70",
  communicationScore: "70",
  working: "no",
  yearsOfExperience: "",
  github: "",
  linkedin: "",
  hackerrank: "",
  targetCompany: "",
  targetPackage: "",
  skills: ["Java", "React"],
  resumeName: ""
};

export default function ProfilePage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubStats, setGithubStats] = useState<GithubStats | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated()) {
        router.replace("/login");
        return;
      }

      try {
        setBootstrapping(true);
        setForm((current) => ({
          ...current,
          email: current.email || getStoredEmail()
        }));

        const response = await api.get("/api/profile/me");
        const user = response.data;

        setForm({
          name: user.name ?? "",
          email: user.email ?? getStoredEmail(),
          cgpa: user.cgpa != null ? String(user.cgpa) : "",
          branch: user.branch ?? "",
          year: user.year != null ? String(user.year) : "",
          projects: user.projects != null ? String(user.projects) : "",
          internships: user.internships != null ? String(user.internships) : "",
          dsaScore: user.dsaScore != null ? String(Math.round(user.dsaScore)) : "70",
          communicationScore:
            user.communicationScore != null ? String(Math.round(user.communicationScore)) : "70",
          working: user.working ? "yes" : "no",
          yearsOfExperience: user.yearsOfExperience != null && user.yearsOfExperience > 0 ? String(user.yearsOfExperience) : "",
          github: user.github ?? "",
          linkedin: user.linkedin ?? "",
          hackerrank: user.hackerrank ?? "",
          targetCompany: user.targetCompany ?? "",
          targetPackage: user.targetPackage != null ? String(user.targetPackage) : "",
          skills: Array.isArray(user.skills) && user.skills.length > 0 ? user.skills : ["Java", "React"],
          resumeName: user.resumePath ? "Resume already uploaded" : ""
        });

        if (user.github) {
          const username = extractGithubUsername(user.github);
          if (username) {
            try {
              const githubResponse = await api.get<GithubStats>(`/api/github/${username}`);
              setGithubStats(githubResponse.data);
            } catch {
              // Keep profile editable even if GitHub enrichment is unavailable.
            }
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace("/login");
          return;
        }

        setForm((current) => ({
          ...current,
          email: current.email || getStoredEmail()
        }));
      } finally {
        setBootstrapping(false);
      }
    };

    loadProfile();
  }, [router]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleSkill = (skill: string) => {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill]
    }));
  };

  const resetFormState = () => {
    setForm({
      ...initialState,
      email: getStoredEmail()
    });
    setResumeFile(null);
    setGithubStats(null);
    setGithubError("");
    setSubmitError("");
    setSuccessMessage("Form reset successfully.");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
    }
  };

  const handleResume = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setSubmitError("Resume file must be 10 MB or smaller.");
      return;
    }

    setResumeFile(file ?? null);
    setSubmitError("");
    setSuccessMessage(file ? "Resume selected successfully." : "");
    updateField("resumeName", file?.name ?? "");
  };

  const githubScore = useMemo(() => calculateGithubScore(githubStats), [githubStats]);

  const fetchGithubStats = async (event?: FocusEvent<HTMLInputElement>) => {
    const targetValue = event?.target.value ?? form.github;
    const username = extractGithubUsername(targetValue);

    if (!targetValue.trim()) {
      setGithubStats(null);
      setGithubError("");
      return;
    }

    if (!username) {
      setGithubStats(null);
      setGithubError("Invalid GitHub profile URL");
      return;
    }

    const normalizedGithub = normalizeGithubUrl(targetValue);
    if (normalizedGithub) {
      updateField("github", normalizedGithub);
    }

    try {
      setGithubLoading(true);
      setGithubError("");
      const response = await api.get<GithubStats>(`/api/github/${username}`);
      setGithubStats(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setGithubError(
          error.response?.data?.message ?? "Unable to fetch GitHub profile details right now."
        );
      } else {
        setGithubError("Unable to fetch GitHub profile details right now.");
      }
      setGithubStats(null);
    } finally {
      setGithubLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setSubmitError("Name is required.");
      return;
    }

    if (!isValidEmail(form.email)) {
      setSubmitError("Enter a valid email address.");
      return;
    }

    if (Number(form.cgpa) < 0 || Number(form.cgpa) > 10) {
      setSubmitError("CGPA must be between 0 and 10.");
      return;
    }

    if (!form.branch) {
      setSubmitError("Select your branch.");
      return;
    }

    if (!form.year) {
      setSubmitError("Select your year.");
      return;
    }

    if (form.skills.length === 0) {
      setSubmitError("Select at least one skill.");
      return;
    }

    if (form.github.trim() && !extractGithubUsername(form.github)) {
      setSubmitError("Invalid GitHub profile URL");
      return;
    }

    if (form.hackerrank.trim() && !extractHackerRankUsername(form.hackerrank)) {
      setSubmitError("Invalid HackerRank profile URL");
      return;
    }

    if (form.targetPackage && Number(form.targetPackage) < 0) {
      setSubmitError("Target package must be 0 or higher.");
      return;
    }

    if (form.working === "yes" && (!form.yearsOfExperience || Number(form.yearsOfExperience) <= 0)) {
      setSubmitError("Enter valid years of experience when you are working.");
      return;
    }

    if (form.yearsOfExperience && (Number(form.yearsOfExperience) < 0 || Number(form.yearsOfExperience) > 20)) {
      setSubmitError("Years of experience must be between 0 and 20.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      const normalizedGithub = normalizeGithubUrl(form.github);
      const normalizedLinkedin = normalizeLinkedinUrl(form.linkedin);
      const normalizedHackerRank = normalizeHackerRankUrl(form.hackerrank);
      const linkedinIgnored = Boolean(form.linkedin.trim()) && !extractLinkedinUsername(form.linkedin);

      let resolvedGithubStats = githubStats;
      if (normalizedGithub && !resolvedGithubStats) {
        const username = extractGithubUsername(normalizedGithub);
        if (username) {
          try {
            const githubResponse = await api.get<GithubStats>(`/api/github/${username}`);
            resolvedGithubStats = githubResponse.data;
            setGithubStats(githubResponse.data);
            setGithubError("");
          } catch (githubFetchError) {
            if (axios.isAxiosError(githubFetchError)) {
              setGithubError(
                githubFetchError.response?.data?.message ??
                  "GitHub enrichment failed, but profile submission can continue."
              );
            } else {
              setGithubError("GitHub enrichment failed, but profile submission can continue.");
            }
          }
        }
      }

      const multipartData = new FormData();
      multipartData.append("name", form.name);
      multipartData.append("email", form.email);
      multipartData.append("cgpa", form.cgpa || "0");
      multipartData.append("branch", form.branch);
      multipartData.append("year", form.year || "0");
      multipartData.append("projects", form.projects || "0");
      multipartData.append("internships", form.internships || "0");
      multipartData.append("dsaScore", form.dsaScore || "0");
      multipartData.append("communicationScore", form.communicationScore || "0");
      multipartData.append("githubScore", String(calculateGithubScore(resolvedGithubStats ?? null)));
      multipartData.append("working", String(form.working === "yes"));
      multipartData.append("yearsOfExperience", form.working === "yes" ? form.yearsOfExperience || "0" : "0");
      multipartData.append("github", normalizedGithub);
      multipartData.append("linkedin", normalizedLinkedin);
      multipartData.append("hackerrank", normalizedHackerRank);
      multipartData.append("targetCompany", form.targetCompany);
      multipartData.append("targetPackage", form.targetPackage || "0");
      form.skills.forEach((skill) => multipartData.append("skills", skill));
      if (resumeFile) {
        multipartData.append("resume", resumeFile);
      }

      const profileResponse = await api.post("/api/profile", multipartData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const analyzePayload = {
        ...profileResponse.data,
        cgpa: Number(profileResponse.data.cgpa ?? form.cgpa ?? 0),
        year: Number(profileResponse.data.year ?? form.year ?? 0),
        projects: Number(profileResponse.data.projects ?? form.projects ?? 0),
        internships: Number(profileResponse.data.internships ?? form.internships ?? 0),
        dsaScore: Number(profileResponse.data.dsaScore ?? form.dsaScore ?? 0),
        communicationScore: Number(
          profileResponse.data.communicationScore ?? form.communicationScore ?? 0
        ),
        working: profileResponse.data.working ?? form.working === "yes",
        yearsOfExperience: Number(
          profileResponse.data.yearsOfExperience ?? (form.working === "yes" ? form.yearsOfExperience : 0)
        ),
        githubScore: Number(
          profileResponse.data.githubScore ??
            calculateGithubScore(resolvedGithubStats ?? null)
        ),
        targetCompany: profileResponse.data.targetCompany ?? form.targetCompany,
        targetPackage: Number(profileResponse.data.targetPackage ?? form.targetPackage ?? 0)
      };

      const analysisResponse = await api.post("/api/analyze", analyzePayload);

      const payload: StoredDashboardPayload = {
        userId: profileResponse.data.id,
        profileName: form.name,
        githubStats: resolvedGithubStats ?? null,
        analysis: analysisResponse.data,
        formSnapshot: {
          dsaScore: Number(form.dsaScore || 0),
          communicationScore: Number(form.communicationScore || 0),
          githubScore: calculateGithubScore(resolvedGithubStats ?? null),
          projects: Number(form.projects || 0),
          internships: Number(form.internships || 0),
          working: form.working === "yes",
          yearsOfExperience: Number(form.working === "yes" ? form.yearsOfExperience || 0 : 0),
          targetCompany: form.targetCompany,
          targetPackage: Number(form.targetPackage || 0)
        }
      };

      window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(payload));
      setFlashMessage("Profile saved and analyzed successfully.");
      if (linkedinIgnored) {
        setFlashMessage("Profile saved successfully. LinkedIn URL was skipped because it was not a public profile link.");
      }
      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(error.response?.data?.message ?? "Unable to save and analyze the profile.");
      } else {
        setSubmitError("Unable to save and analyze the profile.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen text-slate-950 dark:text-white">
      <TopNav />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        {bootstrapping ? (
          <GlassCard className="mb-8 p-8 text-center">
            <div className="inline-flex items-center gap-3 text-lg text-slate-200">
              <LoadingSpinner className="h-5 w-5" />
              Loading your saved profile...
            </div>
          </GlassCard>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <GlassCard className="h-fit p-8 lg:sticky lg:top-8" delay={0}>
            <SectionTitle
              eyebrow="Profile Builder"
              title="Shape the profile that powers your placement insights."
              description="Collect academic signals, project depth, and professional links in one clean student profile."
            />

            <div className="mt-8 space-y-4">
              {[
                "Submit the profile directly to Spring Boot with multipart upload.",
                "Auto-enrich GitHub stats when a GitHub profile is provided.",
                "Run placement analysis immediately and open the live dashboard."
              ].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                  whileHover={{ x: 4 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                >
                  {item}
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <SideMetric icon={BriefcaseBusiness} label="Placement Flow" value="Guided" />
              <SideMetric icon={TrendingUp} label="Live Analysis" value="Enabled" />
              <SideMetric icon={Github} label="GitHub Sync" value="Optional" />
              <SideMetric icon={FileBadge2} label="Resume Upload" value="Ready" />
            </div>
          </GlassCard>

          <GlassCard className="p-8 lg:p-10" delay={0.1}>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Name">
                  <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </Field>
                <Field label="CGPA">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.cgpa}
                    onChange={(e) => updateField("cgpa", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Branch">
                  <Select value={form.branch} onChange={(e) => updateField("branch", e.target.value)} required>
                    <option value="">Select branch</option>
                    <option value="CSE">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="ECE">Electronics</option>
                    <option value="EEE">Electrical</option>
                    <option value="ME">Mechanical</option>
                  </Select>
                </Field>
                <Field label="Year">
                  <Select value={form.year} onChange={(e) => updateField("year", e.target.value)} required>
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </Select>
                </Field>
                <Field label="Projects">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={form.projects}
                    onChange={(e) => updateField("projects", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Internships">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={form.internships}
                    onChange={(e) => updateField("internships", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Resume Upload">
                  <label className="flex min-h-14 cursor-pointer items-center justify-between rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 text-sm text-slate-200 transition hover:bg-white/10">
                    <span>{form.resumeName || "Upload resume"}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Browse</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleResume}
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                </Field>
                <Field label="DSA Score">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.dsaScore}
                    onChange={(e) => updateField("dsaScore", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Communication Score">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.communicationScore}
                    onChange={(e) => updateField("communicationScore", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Are you working?">
                  <Select value={form.working} onChange={(e) => updateField("working", e.target.value)} required>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Select>
                </Field>
                <Field label="Years of Experience">
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={form.yearsOfExperience}
                    onChange={(e) => updateField("yearsOfExperience", e.target.value)}
                    disabled={form.working !== "yes"}
                    placeholder={form.working === "yes" ? "2" : "Optional"}
                  />
                </Field>
              </div>

              <div className="mt-8">
                <label className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Layers3 className="h-4 w-4 text-cyan-200" />
                  Skills
                </label>
                <div className="flex flex-wrap gap-3">
                  {skillsOptions.map((skill) => {
                    const active = form.skills.includes(skill);

                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          active
                            ? "bg-white text-slate-950 shadow-[0_12px_24px_rgba(255,255,255,0.16)]"
                            : "border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
                        }`}
                      >
                      {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <Field label="Target Company">
                  <Input
                    value={form.targetCompany}
                    onChange={(e) => updateField("targetCompany", e.target.value)}
                    placeholder="Amazon / startup / Microsoft"
                  />
                </Field>
                <Field label="Target Package (LPA)">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.targetPackage}
                    onChange={(e) => updateField("targetPackage", e.target.value)}
                    placeholder="12"
                  />
                </Field>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <Field label="GitHub URL">
                  <Input
                    value={form.github}
                    onChange={(e) => updateField("github", e.target.value)}
                    onBlur={fetchGithubStats}
                    placeholder="https://github.com/username"
                  />
                </Field>
                <Field label="LinkedIn URL">
                  <Input
                    value={form.linkedin}
                    onChange={(e) => updateField("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </Field>
                <Field label="HackerRank URL">
                  <Input
                    value={form.hackerrank}
                    onChange={(e) => updateField("hackerrank", e.target.value)}
                    placeholder="https://hackerrank.com/username"
                  />
                </Field>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoCard
                  label="GitHub Status"
                  value={githubLoading ? "Loading..." : githubError ? "Error" : githubStats ? "Connected" : "Optional"}
                  detail={
                    githubError
                      ? githubError
                      : githubStats
                        ? `${githubStats.repos} repos | ${githubStats.followers} followers | ${githubStats.stars} stars`
                        : "Enter a GitHub URL to enrich the profile automatically."
                  }
                />
                <InfoCard
                  label="Derived GitHub Score"
                  value={`${githubScore}`}
                  detail="Used in placement analysis after GitHub stats are fetched."
                />
                <InfoCard
                  label="Submission Flow"
                  value={submitting ? "Processing..." : "Ready"}
                  detail={
                    form.working === "yes"
                      ? "Experienced profile weighting will prioritize projects and real work experience."
                      : "Profile save, GitHub enrichment, and placement analysis happen in one flow."
                  }
                />
              </div>

              {successMessage ? <StatusBanner variant="success" message={successMessage} className="mt-6" /> : null}
              {submitError ? <StatusBanner variant="error" message={submitError} className="mt-6" /> : null}

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="premium-button inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <LoadingSpinner /> : <Sparkles className="h-4 w-4" />}
                  {submitting ? "Saving and analyzing..." : "Save Profile and Analyze"}
                </button>
                <button
                  type="button"
                  onClick={resetFormState}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block space-y-3">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="premium-input h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition placeholder:text-slate-400 focus:border-violet-300/50 focus:bg-white/10"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="premium-input h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-violet-300/50 focus:bg-white/10"
    />
  );
}

type InfoCardProps = {
  label: string;
  value: string;
  detail: string;
};

function InfoCard({ label, value, detail }: InfoCardProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
    </div>
  );
}

function SideMetric({
  icon: Icon,
  label,
  value
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
        <Icon className="h-4 w-4 text-cyan-200" />
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
