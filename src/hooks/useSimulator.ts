import { useState, useCallback } from "react";
import type { SimulatorState, ConnectionMethod } from "@/types";

const initialState: SimulatorState = {
  domain: "",
  domainAge: "new",
  dkimSelector: "google",
  connectionMethod: "ip",
  ipAddress: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUsername: "",
  smtpPassword: "",
  apiKey: "",
  apiProvider: "sendgrid",
  volume: [1000],
  subject: "",
  emailContent: "",
};

export function useSimulator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<SimulatorState>(initialState);

  const updateState = useCallback(<K extends keyof SimulatorState>(
    key: K,
    value: SimulatorState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setCurrentStep(1);
  }, []);

  // Derived values
  const setDomain = (value: string) => updateState("domain", value);
  const setDomainAge = (value: string) => updateState("domainAge", value);
  const setDkimSelector = (value: string) => updateState("dkimSelector", value);
  const setConnectionMethod = (value: ConnectionMethod) => updateState("connectionMethod", value);
  const setIpAddress = (value: string) => updateState("ipAddress", value);
  const setSmtpHost = (value: string) => updateState("smtpHost", value);
  const setSmtpPort = (value: number) => updateState("smtpPort", value);
  const setSmtpUsername = (value: string) => updateState("smtpUsername", value);
  const setSmtpPassword = (value: string) => updateState("smtpPassword", value);
  const setApiKey = (value: string) => updateState("apiKey", value);
  const setApiProvider = (value: string) => updateState("apiProvider", value);
  const setVolume = (value: number[]) => updateState("volume", value);
  const setSubject = (value: string) => updateState("subject", value);
  const setEmailContent = (value: string) => updateState("emailContent", value);

  return {
    currentStep,
    state,
    goToStep,
    nextStep,
    prevStep,
    reset,
    // Individual setters for backward compatibility
    setDomain,
    setDomainAge,
    setDkimSelector,
    setConnectionMethod,
    setIpAddress,
    setSmtpHost,
    setSmtpPort,
    setSmtpUsername,
    setSmtpPassword,
    setApiKey,
    setApiProvider,
    setVolume,
    setSubject,
    setEmailContent,
  };
}
