import { useState, useCallback } from "react";

interface UseAISuggestionsReturn {
  isEnabled: boolean;
  isLoading: boolean;
  toggleEnabled: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAISuggestions = (): UseAISuggestionsReturn => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isEnabled,
    isLoading,
    toggleEnabled,
    setLoading,
  };
};
