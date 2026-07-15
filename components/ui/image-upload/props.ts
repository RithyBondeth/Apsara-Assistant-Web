export interface IImageUploadProps {
  /** Current image URL, or "" when none is set. */
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}
