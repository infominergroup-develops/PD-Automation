// Google Drive Integration Service via Google Identity Services (GIS) & Google Drive REST API

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: any) => void;
          }) => GoogleTokenClient;
          revoke?: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  webContentLink?: string;
  folderName: string;
  folderId: string;
}

const STORAGE_KEY_CLIENT_ID = 'infominer_google_client_id';
const STORAGE_KEY_FOLDER_NAME = 'infominer_google_drive_folder';
const STORAGE_KEY_ACCESS_TOKEN = 'infominer_google_access_token';
const STORAGE_KEY_TOKEN_EXPIRY = 'infominer_google_token_expiry';
const DEFAULT_FOLDER_NAME = 'Infominer PD Reports';

const DEFAULT_FALLBACK_CLIENT_ID = '';

export function getStoredGoogleClientId(): string {
  return localStorage.getItem(STORAGE_KEY_CLIENT_ID) || DEFAULT_FALLBACK_CLIENT_ID;
}

export function setStoredGoogleClientId(clientId: string): void {
  if (clientId) {
    localStorage.setItem(STORAGE_KEY_CLIENT_ID, clientId.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
  }
}

export function getStoredDriveFolderName(): string {
  return localStorage.getItem(STORAGE_KEY_FOLDER_NAME) || DEFAULT_FOLDER_NAME;
}

export function setStoredDriveFolderName(folderName: string): void {
  if (folderName) {
    localStorage.setItem(STORAGE_KEY_FOLDER_NAME, folderName.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_FOLDER_NAME);
  }
}

/**
 * Retrieves valid cached access token if not expired
 */
export function getStoredAccessToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
  const expiry = localStorage.getItem(STORAGE_KEY_TOKEN_EXPIRY);
  if (!token || !expiry) return null;

  const expiryTime = parseInt(expiry, 10);
  // Keep 60 seconds buffer before true expiration
  if (Date.now() > expiryTime - 60000) {
    clearStoredGoogleToken();
    return null;
  }
  return token;
}

export function setStoredAccessToken(token: string, expiresInSeconds: number): void {
  const expiryTimestamp = Date.now() + (expiresInSeconds || 3500) * 1000;
  localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_TOKEN_EXPIRY, expiryTimestamp.toString());
}

export function clearStoredGoogleToken(): void {
  const token = localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN);
  if (token && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(token, () => {});
    } catch {
      // ignore
    }
  }
  localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEY_TOKEN_EXPIRY);
}

/**
 * Dynamically loads Google Identity Services (GIS) client script
 */
export async function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return;
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services library from Google.'));
    document.head.appendChild(script);
  });
}

/**
 * Returns an existing valid access token or requests a new one seamlessly
 */
export async function requestGoogleAccessToken(
  clientId: string,
  options?: { forceNewLogin?: boolean }
): Promise<string> {
  // Check if we already have a valid active session token
  if (!options?.forceNewLogin) {
    const cachedToken = getStoredAccessToken();
    if (cachedToken) {
      return cachedToken;
    }
  }

  if (!clientId || !clientId.trim()) {
    throw new Error('Google Client ID is missing. Please enter your Google OAuth Client ID.');
  }

  await loadGsiScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services library is not ready.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
        callback: (response: GoogleTokenResponse) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error || 'Google Authorization failed.'));
            return;
          }
          if (!response.access_token) {
            reject(new Error('No access token received from Google.'));
            return;
          }
          // Save token for subsequent uploads so user doesn't have to login repeatedly
          setStoredAccessToken(response.access_token, response.expires_in || 3600);
          resolve(response.access_token);
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || 'Google OAuth authentication failed or was cancelled.'));
        }
      });

      // If user specifically requested to switch accounts or force new login, use select_account
      // Otherwise use empty prompt so already logged-in users don't get repeated consent prompts
      if (options?.forceNewLogin) {
        client.requestAccessToken({ prompt: 'select_account' });
      } else {
        client.requestAccessToken({ prompt: '' });
      }
    } catch (err: any) {
      reject(new Error(err?.message || 'Failed to initialize Google Sign-in.'));
    }
  });
}

/**
 * Searches for or creates a folder on Google Drive
 */
export async function getOrCreateDriveFolder(
  folderName: string,
  accessToken: string,
  parentFolderId?: string
): Promise<{ folderId: string; folderName: string }> {
  const query = parentFolderId
    ? `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`
    : `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!searchRes.ok) {
    if (searchRes.status === 401) {
      clearStoredGoogleToken();
      throw new Error('Google Drive session expired. Please click "Save to Google Drive" to reconnect.');
    }
    const errText = await searchRes.text();
    throw new Error(`Google Drive folder search failed (${searchRes.status}): ${errText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return { folderId: searchData.files[0].id, folderName: searchData.files[0].name };
  }

  // Folder doesn't exist, create it
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const folderMetadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    folderMetadata.parents = [parentFolderId];
  }

  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(folderMetadata),
  });

  if (!createRes.ok) {
    if (createRes.status === 401) {
      clearStoredGoogleToken();
      throw new Error('Google Drive session expired. Please reconnect.');
    }
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Drive folder (${createRes.status}): ${errText}`);
  }

  const newFolder = await createRes.json();
  return { folderId: newFolder.id, folderName: newFolder.name };
}

/**
 * Converts Blob to Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads a PDF Blob to Google Drive via multipart upload
 */
export async function uploadPdfToDrive(
  pdfBlob: Blob,
  fileName: string,
  folderId: string,
  accessToken: string,
  description?: string
): Promise<DriveUploadResult> {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/pdf',
    parents: [folderId],
    description: description || 'Infominer Personal Discussion Credit Assessment Report',
  };

  const base64Data = await blobToBase64(pdfBlob);

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/pdf\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Data +
    closeDelimiter;

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,parents';

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredGoogleToken();
      throw new Error('Google Drive session expired. Please reconnect.');
    }
    const errText = await res.text();
    throw new Error(`Google Drive file upload failed (${res.status}): ${errText}`);
  }

  const uploadData = await res.json();

  return {
    fileId: uploadData.id,
    fileName: uploadData.name || fileName,
    webViewLink: uploadData.webViewLink || `https://drive.google.com/file/d/${uploadData.id}/view`,
    webContentLink: uploadData.webContentLink,
    folderName: getStoredDriveFolderName(),
    folderId: folderId,
  };
}
