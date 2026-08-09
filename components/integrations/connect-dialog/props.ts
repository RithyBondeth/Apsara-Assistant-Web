import {
  IIntegrationCreate,
  TIntegrationPlatform,
} from "@/utils/interfaces/integration/integration.interface";

export interface IConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: TIntegrationPlatform;
  onCreate: (data: IIntegrationCreate) => Promise<boolean>;
  error: string | null;
  onDismissError: () => void;
}
