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
const DEFAULT_VERSION = '1.7.1';
const RELEASES_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
export const RELEASES_PAGE_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;

export const DIRECT_WINDOWS_DOWNLOAD_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/Novynth-Workflow-Setup-${DEFAULT_VERSION}.exe`;
export const DIRECT_LINUX_DOWNLOAD_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/Novynth-Workflow-${DEFAULT_VERSION}.AppImage`;

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
 * Fetch the latest GitHub Release metadata dynamically.
 * Resolves direct download links for Windows setup exe and Linux AppImage.
 */
export async function fetchLatestRelease(): Promise<LatestReleaseInfo> {
  try {
    const response = await fetch(RELEASES_API_URL, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned status ${response.status}`);
    }

    const data = await response.json();
    const tagName = data.tag_name || `v${DEFAULT_VERSION}`;
    const version = tagName.replace(/^v/, '');
    const htmlUrl = data.html_url || RELEASES_PAGE_URL;
    const releaseNotes = data.body || '';

    const assets: ReleaseAsset[] = (data.assets || []).map((asset: any) => ({
      name: asset.name,
      browser_download_url: asset.browser_download_url,
      size: asset.size,
    }));

    // Identify Windows Setup installer (.exe)
    const winAsset = assets.find(
      (a) => a.name.endsWith('.exe') && (a.name.includes('Setup') || a.name.includes('novynth') || a.name.includes('Employee'))
    ) || assets.find((a) => a.name.endsWith('.exe'));

    // Identify Linux AppImage (.AppImage)
    const linuxAsset = assets.find((a) => a.name.endsWith('.AppImage'));

    return {
      hasRelease: !!(winAsset || linuxAsset),
      tagName,
      version,
      releaseNotes,
      htmlUrl,
      windowsInstallerUrl: winAsset ? winAsset.browser_download_url : null,
      linuxAppImageUrl: linuxAsset ? linuxAsset.browser_download_url : null,
      assets,
    };
  } catch (error) {
    console.warn('[GitHub Release] No published release found yet on GitHub Releases:', error);
    return {
      hasRelease: false,
      tagName: `v${DEFAULT_VERSION}`,
      version: DEFAULT_VERSION,
      htmlUrl: RELEASES_PAGE_URL,
      windowsInstallerUrl: null,
      linuxAppImageUrl: null,
      assets: [],
    };
  }
}
