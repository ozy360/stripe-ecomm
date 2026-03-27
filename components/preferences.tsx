"use client";

import { createContext, useContext, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Preferences {
  currency: string;
  language: string;
}

interface PreferencesContextType {
  preferences: Preferences;
  formatPrice: (amount: number) => string;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

// ─── Provider ─────────────────────────────────────────────────────────────────
interface PreferencesProviderProps {
  children: React.ReactNode;
  value: Preferences;
}

export function PreferencesProvider({
  children,
  value,
}: PreferencesProviderProps) {
  const formatPrice = useMemo(() => {
    return (amount: number) => {
      // NOTE: This is a mock conversion. In a real application, you would
      // fetch real-time conversion rates from an API. The base currency is assumed to be USD.
      let convertedAmount = amount;
      if (value.currency === "EUR") {
        convertedAmount *= 0.92; // Mock USD to EUR rate
      } else if (value.currency === "GBP") {
        convertedAmount *= 0.79; // Mock USD to GBP rate
      }

      return new Intl.NumberFormat(value.language || "en-US", {
        style: "currency",
        currency: value.currency || "USD",
      }).format(convertedAmount);
    };
  }, [value.currency, value.language]);

  const contextValue = {
    preferences: value,
    formatPrice,
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
