export interface AnnounceMeta {
  kind: 'thunderstore' | 'github';
  label: string;
  versionOrRef: string;
  timestamp: Date;
  body: string;
  bodyIsLlmSummary: boolean;
  githubUrl?: string;
  thunderstoreUrl?: string;
}

export const MAX_BODY_CHARS = 3500;
