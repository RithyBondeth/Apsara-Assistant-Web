import {
  IConnectionCheck,
  IIntegration,
} from "@/utils/interfaces/integration/integration.interface";

export interface IIntegrationCardProps {
  integration: IIntegration;
  onToggleAutoReply: (value: boolean) => unknown;
  onToggleActive: (value: boolean) => unknown;
  onDisconnect: () => unknown;
  onCheck: () => Promise<IConnectionCheck>;
  onRegisterWebhook: () => Promise<IConnectionCheck>;
  busy?: boolean;
}
