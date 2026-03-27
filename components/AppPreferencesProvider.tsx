import { getAccountData } from "@/app/account/actions";
import { PreferencesProvider } from "./preferences";

const DEFAULT_PREFERENCES = {
  currency: "USD",
  language: "en",
};

export async function AppPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const accountData = await getAccountData();
  const preferences = {
    currency:
      accountData?.preferences?.currency || DEFAULT_PREFERENCES.currency,
    language:
      accountData?.preferences?.language || DEFAULT_PREFERENCES.language,
  };

  return (
    <PreferencesProvider value={preferences}>{children}</PreferencesProvider>
  );
}
