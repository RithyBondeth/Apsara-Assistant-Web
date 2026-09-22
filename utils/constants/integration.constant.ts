import { TIntegrationPlatform } from "@/utils/interfaces/integration/integration.interface";
import { AppMessages } from "@/hooks/utils/use-app-translations";

export interface IPlatformCopy {
  label: string;
  /** What external_id means on this platform. */
  idLabel: string;
  idHint: string;
  tokenLabel: string;
  tokenHint: string;
  /** Where the seller goes to finish the connection on the platform's side. */
  steps: string[];
  /** Stripe asks for a second secret: the signing secret of the webhook
   *  endpoint, which is issued by Stripe rather than generated here. */
  secretLabel?: string;
  secretHint?: string;
}

type TPlatformMessages = AppMessages["integrations"]["platforms"];

/**
 * The per-platform wording, in the seller's language. The text lives in the
 * app translations; this only reshapes it into the record the components
 * were written against.
 */
export function platformCopy(messages: TPlatformMessages): Record<TIntegrationPlatform, IPlatformCopy> {
  const build = (platform: TIntegrationPlatform): IPlatformCopy => {
    const m = messages[platform];
    return {
      label: m.label,
      idLabel: m.idLabel,
      idHint: m.idHint,
      tokenLabel: m.tokenLabel,
      tokenHint: m.tokenHint,
      steps: [m.step1, m.step2, m.step3],
      secretLabel: "secretLabel" in m ? m.secretLabel : undefined,
      secretHint: "secretHint" in m ? m.secretHint : undefined,
    };
  };
  return { messenger: build("messenger"), telegram: build("telegram"), stripe: build("stripe") };
}
