export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface LatestReleaseInfo {
  hasRelease: boolean;
  tagName: string;
  version: string;
  releaseNotes?: string;
  htmlUrl: string;
  windowsInstallerUrl: string | null;
  linuxAppImageUrl: string | null;
  assets: ReleaseAsset[];
}

const GITHUB_OWNER = 'Tejaspadaki';
const GITHUB_REPO = 'EMS-V1-frontend-V1';
const DEFAULT_VERSION = '1.16.0';

// Use the backend API to avoid GitHub's strict client-side rate limits
const RELEASES_API_URL = `https://ems-backend.yuktiyantra.com/api/updates/latest`;
export const RELEASES_PAGE_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

// Point to the backend redirect endpoints which dynamically resolve the latest asset URL
export const DIRECT_WINDOWS_DOWNLOAD_URL = `https://ems-backend.yuktiyantra.com/updates/download/windows`;
export const DIRECT_LINUX_DOWNLOAD_URL = `https://ems-backend.yuktiyantra.com/updates/download/linux`;

export type OperatingSystem = 'windows' | 'linux' | 'other';

/**
 * Detect user's Operating System safely in browser environment.
 */
export function detectOS(): OperatingSystem {
  if (typeof navigator === 'undefined') return 'windows';
  const ua = navigator.userAgent || '';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'linux';
  return 'other';
}

/**
 * Fetch the latest GitHub Release metadata dynamically via the backend.
 */
export async function fetchLatestRelease(): Promise<LatestReleaseInfo> {
  try {
    const response = await fetch(RELEASES_API_URL);

    if (!response.ok) {
      console.warn(`[Update API] Backend returned status ${response.status}`);
      return {
        hasRelease: false,
        tagName: `v${DEFAULT_VERSION}`,
        version: DEFAULT_VERSION,
        htmlUrl: RELEASES_PAGE_URL,
        windowsInstallerUrl: DIRECT_WINDOWS_DOWNLOAD_URL,
        linuxAppImageUrl: DIRECT_LINUX_DOWNLOAD_URL,
        assets: [],
      };
    }

    const data = await response.json();
    
    // The backend returns: { success: true, version: "1.16.0", windows: "url", linux: "url", releaseUrl: "url" }
    if (!data.success) {
      throw new Error("Backend reported failure fetching release");
    }

    const version = data.version || DEFAULT_VERSION;
    const tagName = `v${version}`;

    return {
      hasRelease: true,
      tagName,
      version,
      releaseNotes: 'Update available via EMS Backend',
      htmlUrl: data.releaseUrl || RELEASES_PAGE_URL,
      windowsInstallerUrl: data.windows || DIRECT_WINDOWS_DOWNLOAD_URL,
      linuxAppImageUrl: data.linux || DIRECT_LINUX_DOWNLOAD_URL,
      assets: [], // We don't need raw assets anymore since backend handles it
    };
  } catch (error) {
    console.warn('[Update API] Failed to fetch release metadata from backend:', error);
    return {
      hasRelease: false,
      tagName: `v${DEFAULT_VERSION}`,
      version: DEFAULT_VERSION,
      htmlUrl: RELEASES_PAGE_URL,
      windowsInstallerUrl: DIRECT_WINDOWS_DOWNLOAD_URL,
      linuxAppImageUrl: DIRECT_LINUX_DOWNLOAD_URL,
      assets: [],
    };
  }
}
