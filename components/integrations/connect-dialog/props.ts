import { IPlatformMeta } from "@/utils/constants/platforms.constant";
import { IIntegrationCreate } from "@/utils/interfaces/integration/integration.interface";

export interface IConnectDialogProps {
  platform: IPlatformMeta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (data: IIntegrationCreate) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}
