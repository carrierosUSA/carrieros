export type ConfigurationEnvironment = Readonly<Record<string, string | undefined>>;

export type CoreConfigurationState = {
  supabaseUrl: boolean;
  supabaseAnonKey: boolean;
  supabaseServiceRole: boolean;
  openAiKey: boolean;
  documentBucket: boolean;
};

const PLACEHOLDER = /YOUR_|example|placeholder/i;

function usable(value: string | undefined): value is string {
  const normalized = value?.trim();
  return Boolean(normalized && normalized.length >= 8 && !PLACEHOLDER.test(normalized));
}

export function evaluateCoreConfiguration(env: ConfigurationEnvironment): CoreConfigurationState {
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = env.ALPH_DOCUMENT_BUCKET?.trim() ?? "";
  return {
    supabaseUrl: /^https:\/\/[a-z0-9]{20}\.supabase\.co\/?$/i.test(env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""),
    supabaseAnonKey: usable(anonKey),
    supabaseServiceRole: usable(serviceRole) && serviceRole !== anonKey,
    openAiKey: usable(env.OPENAI_API_KEY),
    documentBucket: bucket.length >= 3 && bucket.length <= 100 && /^[a-z0-9][a-z0-9._-]*$/i.test(bucket),
  };
}
