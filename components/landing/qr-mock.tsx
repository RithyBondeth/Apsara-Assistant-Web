import Image from "next/image";

const KHQR_IMAGE = "/landing/khqr-hem-rithybondeth.jpg";

export function QrMock({ className = "" }: { className?: string }) {
  return (
    <Image
      src={KHQR_IMAGE}
      width={1056}
      height={1620}
      sizes="(max-width: 640px) 126px, 160px"
      alt="ACLEDA Bank KHQR for Hem Rithybondeth"
      className={className}
    />
  );
}

/**
 * Shared KHQR preview used by every marketing visualization. The descriptive
 * props remain part of the API so callers can keep their localized chat copy,
 * while the card itself always displays the seller-provided source image.
 */
export function QrCard(props: {
  shopName: string;
  amount: string;
  currency: string;
  hint: string;
  compact?: boolean;
  hintClassName?: string;
}) {
  return (
    <QrMock
      className={`${props.compact ? "w-[92px]" : "w-[126px]"} h-auto rounded-md bg-white shadow-sm`}
    />
  );
}
