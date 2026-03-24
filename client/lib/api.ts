import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && axios.isAxiosError(error) && error.response?.status === 401) {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_EMAIL_STORAGE_KEY);
      window.localStorage.removeItem(AUTH_USER_ID_STORAGE_KEY);
      window.localStorage.removeItem("userId");
      window.localStorage.removeItem("role");
    }

    return Promise.reject(error);
  }
);

export type GithubStats = {
  repos: number;
  followers: number;
  stars: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  cgpa: number | null;
  branch: string | null;
  year: number | null;
  skills: string[];
  projects: number | null;
  internships: number | null;
  dsaScore: number | null;
  communicationScore: number | null;
  githubScore: number | null;
  github: string | null;
  linkedin: string | null;
  hackerrank: string | null;
  working: boolean | null;
  yearsOfExperience: number | null;
  targetCompany: string | null;
  targetPackage: number | null;
  resumePath: string | null;
  role: string;
};

export type CompanyResult = {
  companyName: string;
  probability: number;
  status: string;
};

export type RoadmapItem = {
  title: string;
  description: string;
};

export type SkillTag = {
  skill: string;
  level: string;
  score: number;
};

export type ResumeAnalysis = {
  detectedSkills: string[];
  missingSkills: string[];
  detectedProjects: string[];
  technologies: string[];
  detectedExperienceYears: number;
};

export type AnalysisResponse = {
  overallScore: number;
  breakdown: Record<string, number>;
  companyResults: CompanyResult[];
  safeCompanyResults: CompanyResult[];
  safeCompanyMessage: string;
  suggestions: string[];
  roadmap: RoadmapItem[];
  resumeTips: string[];
  resumeAnalysis: ResumeAnalysis;
  skillTags: SkillTag[];
  targetAnalysis: {
    eligible: boolean;
    reason: string;
    skillGap: string[];
    roadmap: RoadmapItem[];
  } | null;
};

export type ChatResponse = {
  feedback: string;
  score: {
    overall: number;
    clarity: number;
    confidence: number;
    technicalDepth: number;
  };
  suggestions: string[];
};

export type AuthResponse = {
  message: string;
  token: string;
  userId: string;
  email: string;
  role: string;
};

export type VoiceInterviewResponse = {
  feedback: string;
  score: {
    confidence: number;
    clarity: number;
  };
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  score: number;
  github: string;
};

export type StoredDashboardPayload = {
  userId: string;
  profileName: string;
  githubStats: GithubStats | null;
  analysis: AnalysisResponse;
  formSnapshot: {
    dsaScore: number;
    communicationScore: number;
    githubScore: number;
    projects: number;
    internships: number;
    working: boolean;
    yearsOfExperience: number;
    targetCompany: string;
    targetPackage: number;
  };
};

export const DASHBOARD_STORAGE_KEY = "placement-oracle-dashboard";
export const AUTH_TOKEN_STORAGE_KEY = "placement-oracle-token";
export const AUTH_ROLE_STORAGE_KEY = "placement-oracle-role";
export const AUTH_EMAIL_STORAGE_KEY = "placement-oracle-email";
export const AUTH_USER_ID_STORAGE_KEY = "placement-oracle-user-id";
export const FLASH_MESSAGE_STORAGE_KEY = "placement-oracle-flash-message";

export function storeAuthSession(response: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  const previousEmail = window.localStorage.getItem(AUTH_EMAIL_STORAGE_KEY);
  if (previousEmail && previousEmail !== response.email) {
    window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
  window.localStorage.setItem(AUTH_ROLE_STORAGE_KEY, response.role);
  window.localStorage.setItem(AUTH_EMAIL_STORAGE_KEY, response.email);
  window.localStorage.setItem(AUTH_USER_ID_STORAGE_KEY, response.userId);
  window.localStorage.setItem("userId", response.userId);
  window.localStorage.setItem("role", response.role);
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_EMAIL_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_USER_ID_STORAGE_KEY);
  window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
  window.localStorage.removeItem(FLASH_MESSAGE_STORAGE_KEY);
  window.localStorage.removeItem("userId");
  window.localStorage.removeItem("role");
}

export function getStoredRole() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_ROLE_STORAGE_KEY) ?? "";
}

export function getStoredEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_EMAIL_STORAGE_KEY) ?? "";
}

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
}

export function setFlashMessage(message: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(FLASH_MESSAGE_STORAGE_KEY, message);
}

export function consumeFlashMessage() {
  if (typeof window === "undefined") {
    return "";
  }

  const message = window.localStorage.getItem(FLASH_MESSAGE_STORAGE_KEY) ?? "";
  if (message) {
    window.localStorage.removeItem(FLASH_MESSAGE_STORAGE_KEY);
  }
  return message;
}

export function extractGithubUsername(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_-]+)\/?$/i);
  if (match?.[1]) {
    return match[1];
  }

  if (/^[a-zA-Z0-9-]+$/.test(trimmed)) {
    return trimmed;
  }

  return "";
}

export function extractLinkedinUsername(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([A-Za-z0-9_-]+)\/?$/i);
  return match?.[1] ?? "";
}

export function extractHackerRankUsername(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?hackerrank\.com\/([A-Za-z0-9_-]+)\/?$/i);
  return match?.[1] ?? "";
}

export function normalizeGithubUrl(value: string) {
  const username = extractGithubUsername(value);
  return username ? `https://github.com/${username}` : "";
}

export function normalizeLinkedinUrl(value: string) {
  const username = extractLinkedinUsername(value);
  return username ? `https://www.linkedin.com/in/${username}` : "";
}

export function normalizeHackerRankUrl(value: string) {
  const username = extractHackerRankUsername(value);
  return username ? `https://www.hackerrank.com/${username}` : "";
}

export function calculateGithubScore(stats: GithubStats | null) {
  if (!stats) {
    return 0;
  }

  const repoComponent = Math.min(stats.repos * 8, 40);
  const followerComponent = Math.min(stats.followers * 1.2, 30);
  const starComponent = Math.min(stats.stars * 1.5, 30);

  return Math.round(Math.min(repoComponent + followerComponent + starComponent, 100));
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidOptionalUrl(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallbackMessage;
  }

  return fallbackMessage;
}
