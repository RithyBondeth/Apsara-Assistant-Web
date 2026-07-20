import { IPlatformMeta } from "@/utils/constants/platforms.constant";
import {
  IIntegration,
  IIntegrationCreate,
  IIntegrationUpdate,
} from "@/utils/interfaces/integration/integration.interface";

export interface IConnectDialogProps {
  platform: IPlatformMeta | null;
  /**
   * When set, the dialog edits this connection instead of creating one. The API
   * never returns credentials, so the secret fields start blank and a blank
   * field means "keep what's stored" — see ConnectForm.
   */
  integration?: IIntegration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (data: IIntegrationCreate) => Promise<void>;
  onUpdate?: (id: string, data: IIntegrationUpdate) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}
