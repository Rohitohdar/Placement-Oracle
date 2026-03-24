"use client";

import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import axios from "axios";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, Cpu, Download, Radar, Sparkles, Tags, Trophy, WandSparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/navigation/top-nav";
import { GlassCard } from "@/components/ui/glass-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionTitle } from "@/components/ui/section-title";
import { StatusBanner } from "@/components/ui/status-banner";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { SkillsChart } from "@/components/dashboard/skills-chart";
import { companyAccents } from "@/lib/dashboard-data";
import {
  api,
  consumeFlashMessage,
  DASHBOARD_STORAGE_KEY,
  extractGithubUsername,
  GithubStats,
  isAuthenticated,
  StoredDashboardPayload,
  UserProfile
} from "@/lib/api";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<StoredDashboardPayload | null>(null);
  const [companyMode, setCompanyMode] = useState<"dream" | "safe">("dream");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    setSuccessMessage(consumeFlashMessage());
    const hydrateDashboard = async () => {
      if (!isAuthenticated()) {
        router.replace("/login");
        return;
      }

      try {
        const stored = window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
        if (stored) {
          setDashboardData(JSON.parse(stored) as StoredDashboardPayload);
          return;
        }

        const profileResponse = await api.get<UserProfile>("/api/profile/me");
        const profile = profileResponse.data;

        if (!hasCompletedProfile(profile)) {
          setError("Complete your profile to unlock your placement dashboard.");
          return;
        }

        let githubStats: GithubStats | null = null;
        const githubUsername = extractGithubUsername(profile.github ?? "");
        if (githubUsername) {
          try {
            const githubResponse = await api.get<GithubStats>(`/api/github/${githubUsername}`);
            githubStats = githubResponse.data;
          } catch {
            githubStats = null;
          }
        }

        const analysisResponse = await api.post("/api/analyze", profile);
        const hydratedPayload: StoredDashboardPayload = {
          userId: profile.id,
          profileName: profile.name,
          githubStats,
          analysis: analysisResponse.data,
          formSnapshot: {
            dsaScore: Number(profile.dsaScore ?? 0),
            communicationScore: Number(profile.communicationScore ?? 0),
            githubScore: Number(profile.githubScore ?? 0),
            projects: Number(profile.projects ?? 0),
            internships: Number(profile.internships ?? 0),
            working: Boolean(profile.working),
            yearsOfExperience: Number(profile.yearsOfExperience ?? 0),
            targetCompany: profile.targetCompany ?? "",
            targetPackage: Number(profile.targetPackage ?? 0)
          }
        };

        window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(hydratedPayload));
        setDashboardData(hydratedPayload);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace("/login");
          return;
        }

        setError("Unable to load the saved dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    hydrateDashboard();
  }, [router]);

  const chartData = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    return [
      { skill: "DSA", score: dashboardData.formSnapshot.dsaScore },
      { skill: "Projects", score: Math.min(dashboardData.formSnapshot.projects * 10, 100) },
      { skill: "GitHub", score: dashboardData.formSnapshot.githubScore },
      { skill: "Communication", score: dashboardData.formSnapshot.communicationScore },
      { skill: "Internships", score: Math.min(dashboardData.formSnapshot.internships * 20, 100) },
      ...(dashboardData.formSnapshot.working
        ? [{ skill: "Experience", score: Math.min((dashboardData.formSnapshot.yearsOfExperience / 5) * 100, 100) }]
        : [])
    ];
  }, [dashboardData]);

  const visibleCompanies = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    return companyMode === "safe"
      ? dashboardData.analysis.safeCompanyResults
      : dashboardData.analysis.companyResults;
  }, [companyMode, dashboardData]);

  if (loading) {
    return (
      <main className="min-h-screen text-slate-950 dark:text-white">
        <TopNav />
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-10 lg:px-10">
          <GlassCard className="p-8 text-center">
            <div className="inline-flex items-center gap-3 text-lg text-slate-200">
              <LoadingSpinner className="h-5 w-5" />
              Loading your placement dashboard...
            </div>
          </GlassCard>
        </section>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main className="min-h-screen text-slate-950 dark:text-white">
        <TopNav />
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-10 lg:px-10">
          <GlassCard className="p-8 text-center">
            <p className="text-lg text-slate-200">{error}</p>
            <Link
              href="/profile"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950"
            >
              Complete Profile
            </Link>
          </GlassCard>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-slate-950 dark:text-white">
      <TopNav />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10">
        <div className="space-y-8">
          {successMessage ? <StatusBanner variant="success" message={successMessage} /> : null}
          <GlassCard className="p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-6">
                <SectionTitle
                  eyebrow="Dashboard"
                  title={`Your live placement analysis for ${dashboardData.profileName}.`}
                  description="This dashboard is driven by the Spring Boot analysis response, including live company predictions and personalized gap analysis."
                />
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/profile"
                    className="premium-button inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Edit Profile
                  </Link>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white">
                    <BadgeCheck className="h-4 w-4 text-cyan-200" />
                    User ID: {dashboardData.userId}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      downloadPdfReport(dashboardData);
                      setSuccessMessage("Report downloaded successfully.");
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <MetricTile icon={Radar} label="Readiness" value={`${Math.round(dashboardData.analysis.overallScore)}%`} />
                  <MetricTile
                    icon={BriefcaseBusiness}
                    label="Company Matches"
                    value={`${dashboardData.analysis.companyResults.length}`}
                  />
                  <MetricTile
                    icon={Cpu}
                    label="Skill Signals"
                    value={`${Object.keys(dashboardData.analysis.breakdown).length}`}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-6 rounded-[30px] border border-white/10 bg-black/10 p-8">
                <ScoreRing value={Math.round(dashboardData.analysis.overallScore)} />
                <div className="text-center">
                  <p className="text-lg font-medium text-white">
                    {dashboardData.analysis.overallScore >= 75
                      ? "Placement readiness is strong"
                      : dashboardData.analysis.overallScore >= 55
                        ? "Placement readiness is improving"
                        : "Placement readiness needs focused work"}
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                    GitHub enrichment:
                    {" "}
                    {dashboardData.githubStats
                      ? `${dashboardData.githubStats.repos} repos, ${dashboardData.githubStats.followers} followers, ${dashboardData.githubStats.stars} stars`
                      : "not connected"}
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                    {dashboardData.formSnapshot.working
                      ? `Experienced profile: ${dashboardData.formSnapshot.yearsOfExperience} years of experience is included in the score weighting.`
                      : "Fresher profile: the current weighting emphasizes DSA, projects, internships, and communication."}
                  </p>
                </div>

                <div className="w-full space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <ProgressBar label="Confidence Curve" value={Math.min(Math.round(dashboardData.analysis.overallScore + 6), 100)} />
                  <ProgressBar label="Interview Readiness" value={Math.round(dashboardData.analysis.overallScore)} />
                  <ProgressBar label="Profile Completeness" value={Math.min(Math.round(dashboardData.analysis.overallScore + 12), 100)} />
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <GlassCard className="p-8" delay={0.1}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Company Matches</h2>
                <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                  <button
                    type="button"
                    onClick={() => setCompanyMode("dream")}
                    className={`rounded-full px-3 py-2 transition ${
                      companyMode === "dream" ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    Dream Companies
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyMode("safe")}
                    className={`rounded-full px-3 py-2 transition ${
                      companyMode === "safe" ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    Safe Companies
                  </button>
                </div>
              </div>
              {companyMode === "safe" && dashboardData.analysis.safeCompanyMessage ? (
                <StatusBanner
                  variant="success"
                  message={dashboardData.analysis.safeCompanyMessage}
                  className="mt-4"
                />
              ) : null}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {visibleCompanies.length > 0 ? visibleCompanies.map((company, index) => (
                  <motion.div
                    key={company.companyName}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.18 + index * 0.08 }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-[26px] border border-white/10 bg-white/5 p-5"
                  >
                    <div
                      className={`h-1 w-full rounded-full bg-gradient-to-r ${companyAccents[index % companyAccents.length]}`}
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xl font-medium text-white">{company.companyName}</p>
                      <p className="text-lg font-semibold text-violet-200">
                        {company.probability}%
                      </p>
                    </div>
                    <div className="mt-4">
                      <ProgressBar label="Probability" value={company.probability} />
                    </div>
                    <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                      {company.status}
                    </p>
                  </motion.div>
                )) : (
                  <div className="rounded-[26px] border border-dashed border-white/10 bg-white/5 p-6 text-sm leading-7 text-slate-300 sm:col-span-2">
                    {companyMode === "safe"
                      ? "Safe Company Mode becomes active when your overall score is below 60. Right now, you can continue focusing on dream-company preparation."
                      : "No company predictions available yet. Save your profile again to refresh the analysis."}
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-8" delay={0.15}>
              <h2 className="text-2xl font-semibold text-white">Skills Bar Chart</h2>
              <p className="mt-2 text-sm text-slate-300">
                Snapshot generated from the submitted profile and GitHub enrichment.
              </p>
              <div className="mt-6">
                <SkillsChart data={chartData} />
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-8" delay={0.2}>
            <h2 className="text-2xl font-semibold text-white">Gap Analysis</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {dashboardData.analysis.suggestions.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.24 + index * 0.08 }}
                  whileHover={{ scale: 1.01 }}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-violet-400/15 p-2 text-violet-200">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <p className="text-sm leading-7 text-slate-200">{item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {dashboardData.analysis.targetAnalysis ? (
            <GlassCard className="p-8" delay={0.21}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Target-Based Analysis</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {dashboardData.formSnapshot.targetCompany
                      ? `Focused on ${dashboardData.formSnapshot.targetCompany}${
                          dashboardData.formSnapshot.targetPackage > 0
                            ? ` at ${dashboardData.formSnapshot.targetPackage} LPA`
                            : ""
                        }.`
                      : "Focused on your selected target company."}
                  </p>
                </div>
                <div
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] ${
                    dashboardData.analysis.targetAnalysis.eligible
                      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                      : "border-rose-300/20 bg-rose-400/10 text-rose-100"
                  }`}
                >
                  {dashboardData.analysis.targetAnalysis.eligible ? "Eligible" : "Not Eligible"}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Reason</p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">
                      {dashboardData.analysis.targetAnalysis.reason}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Skill Gap</p>
                    <div className="mt-4 space-y-3">
                      {dashboardData.analysis.targetAnalysis.skillGap.length > 0 ? (
                        dashboardData.analysis.targetAnalysis.skillGap.map((gap) => (
                          <div key={gap} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                            <p className="text-sm leading-6 text-slate-200">{gap}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-slate-300">
                          No major gaps detected for this target right now.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Target Roadmap</p>
                  <div className="mt-4 space-y-4">
                    {dashboardData.analysis.targetAnalysis.roadmap.map((item) => (
                      <div key={`${item.title}-${item.description}`} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="text-lg font-medium text-white">{item.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <GlassCard className="p-8" delay={0.22}>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-400/15 p-3 text-cyan-200">
                  <WandSparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Roadmap Generator</h2>
                  <p className="mt-1 text-sm text-slate-300">A practical weekly improvement plan based on your weak areas.</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {dashboardData.analysis.roadmap.map((item) => (
                  <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <p className="text-lg font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-8" delay={0.24}>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-violet-400/15 p-3 text-violet-200">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Resume Tips</h2>
                  <p className="mt-1 text-sm text-slate-300">Tighten the resume so your strongest work is obvious to recruiters.</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {dashboardData.analysis.resumeTips.map((tip) => (
                  <div key={tip} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm leading-7 text-slate-200">{tip}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-8" delay={0.245}>
            <h2 className="text-2xl font-semibold text-white">Resume Parsing Insights</h2>
            <p className="mt-2 text-sm text-slate-300">
              Skills, projects, technologies, and experience detected from the uploaded resume and matched against industry requirements.
            </p>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Detected Skills</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {dashboardData.analysis.resumeAnalysis.detectedSkills.length > 0 ? (
                      dashboardData.analysis.resumeAnalysis.detectedSkills.map((skill) => (
                        <span key={skill} className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-300">No clear skills detected from the resume yet.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Missing Skills</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {dashboardData.analysis.resumeAnalysis.missingSkills.length > 0 ? (
                      dashboardData.analysis.resumeAnalysis.missingSkills.map((skill) => (
                        <span key={skill} className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-100">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-300">Your resume already covers the current industry skill checklist well.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Detected Projects</p>
                  <div className="mt-4 space-y-3">
                    {dashboardData.analysis.resumeAnalysis.detectedProjects.length > 0 ? (
                      dashboardData.analysis.resumeAnalysis.detectedProjects.map((project) => (
                        <div key={project} className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-slate-200">
                          {project}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-300">No project statements were detected clearly from the resume content.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Technologies and Experience</p>
                  <p className="mt-3 text-sm text-slate-300">
                    Detected experience: {dashboardData.analysis.resumeAnalysis.detectedExperienceYears} years
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {dashboardData.analysis.resumeAnalysis.technologies.length > 0 ? (
                      dashboardData.analysis.resumeAnalysis.technologies.map((technology) => (
                        <span key={technology} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                          {technology}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-300">No technologies were detected clearly from the resume content.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8" delay={0.24}>
            <h2 className="text-2xl font-semibold text-white">Breakdown</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {Object.entries(dashboardData.analysis.breakdown).map(([key, value]) => (
                <div key={key} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{key}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                  <div className="mt-4">
                    <ProgressBar label="Contribution" value={Math.min(Math.round(value * 4), 100)} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8" delay={0.26}>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-400/15 p-3 text-emerald-200">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Skill Tags</h2>
                <p className="mt-1 text-sm text-slate-300">Quickly see which areas are strong, moderate, or weak.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              {dashboardData.analysis.skillTags.map((tag) => (
                <div
                  key={tag.skill}
                  className={`rounded-full border px-4 py-3 text-sm ${
                    tag.level === "STRONG"
                      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                      : tag.level === "MODERATE"
                        ? "border-amber-300/20 bg-amber-400/10 text-amber-100"
                        : "border-rose-300/20 bg-rose-400/10 text-rose-100"
                  }`}
                >
                  {tag.skill} | {tag.level} | {tag.score}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}

function hasCompletedProfile(profile: UserProfile) {
  return Boolean(profile.name && profile.email && profile.cgpa != null && profile.branch && profile.year != null);
}

function MetricTile({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Radar;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">{label}</p>
        <Icon className="h-4 w-4 text-cyan-200" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function downloadPdfReport(data: StoredDashboardPayload) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text("Placement Oracle Report", 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Name: ${data.profileName}`, 14, y);
  y += 8;
  doc.text(`Overall Score: ${data.analysis.overallScore}`, 14, y);
  y += 10;

  doc.text("Roadmap:", 14, y);
  y += 8;
  data.analysis.roadmap.forEach((item) => {
    doc.text(`- ${item.title}: ${item.description}`, 14, y, { maxWidth: 180 });
    y += 12;
  });

  doc.text("Resume Tips:", 14, y);
  y += 8;
  data.analysis.resumeTips.forEach((tip) => {
    doc.text(`- ${tip}`, 14, y, { maxWidth: 180 });
    y += 10;
  });

  doc.text("Skill Tags:", 14, y);
  y += 8;
  data.analysis.skillTags.forEach((tag) => {
    doc.text(`- ${tag.skill}: ${tag.level} (${tag.score})`, 14, y);
    y += 8;
  });

  doc.save("placement-oracle-report.pdf");
}
