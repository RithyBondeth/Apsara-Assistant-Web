import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import {
  Camera,
  ChevronLeft,
  Info,
  ImageIcon,
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { QrCard } from "@/components/landing/qr-mock";

function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex h-8 shrink-0 items-center justify-between px-4 text-[10px] font-semibold",
        dark ? "text-white" : "text-[#0b0b0c]",
      )}
    >
      <span>9:41</span>
      <span
        className={cn(
          "absolute left-1/2 top-[5px] h-[16px] w-[50px] -translate-x-1/2 rounded-full",
          dark ? "bg-black" : "bg-[#0b0b0c]",
        )}
      />
      <div className="flex items-end gap-[3px]" aria-hidden="true">
        <span className="self-center text-[8px] leading-none font-bold">5G</span>
        <span className="flex h-2 items-end gap-px">
          {[3, 5, 7, 9].map((height) => (
            <span
              key={height}
              className="w-[2px] rounded-sm bg-current"
              style={{ height }}
            />
          ))}
        </span>
        <span className="h-[7px] w-[13px] rounded-[2px] border border-current p-px">
          <span className="block h-full w-[8px] rounded-[1px] bg-current" />
        </span>
      </div>
    </div>
  );
}

function Avatar({
  src,
  alt,
  size = "md",
  online = false,
  ring,
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  ring?: string;
}) {
  const sizes = { sm: "size-6", md: "size-9", lg: "size-10" };
  const pixels = { sm: "24px", md: "36px", lg: "40px" };

  return (
    <span
      className={cn(
        "relative block shrink-0 rounded-full",
        sizes[size],
        ring && "p-[2px]",
      )}
      style={ring ? { background: ring } : undefined}
    >
      <span className="relative block size-full overflow-hidden rounded-full bg-slate-200 ring-1 ring-black/5">
        <Image src={src} alt={alt} fill sizes={pixels[size]} className="object-cover" />
      </span>
      {online && (
        <span className="absolute bottom-0 right-0 size-2 rounded-full border-[1.5px] border-white bg-[#31a24c]" />
      )}
    </span>
  );
}

function MessageBubble({
  children,
  side,
  className,
  meta,
}: {
  children: ReactNode;
  side: "incoming" | "outgoing";
  className?: string;
  meta?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", side === "outgoing" ? "items-end" : "items-start")}> 
      <div
        data-chat-bubble
        className={cn(
          "!text-[13px] !font-normal !leading-[1.45] !tracking-[-0.005em]",
          className,
        )}
      >
        {children}
      </div>
      {meta && <div data-chat-meta className="mt-1 px-1 !text-[10px] leading-none text-black/45">{meta}</div>}
    </div>
  );
}

function MessengerScreen() {
  return (
    <div className="flex size-full flex-col bg-white text-[#050505]">
      <StatusBar />
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[#e4e6eb] px-3.5">
        <ChevronLeft className="size-[19px] shrink-0 text-[#0866ff]" strokeWidth={2.4} />
        <Avatar
          src="/landing/chat/customer-sreypich.webp"
          alt="Sreypich"
          size="md"
          online
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p data-chat-name className="truncate !text-sm font-semibold !tracking-[-0.01em]">ស្រីពេជ្រ</p>
          <p data-chat-status className="mt-0.5 !text-[10px] text-[#65676b]">Active now</p>
        </div>
        <Phone className="size-[17px] fill-[#0866ff] text-[#0866ff]" strokeWidth={1.8} />
        <Video className="size-[18px] text-[#0866ff]" strokeWidth={2.3} />
        <Info className="size-[17px] text-[#0866ff]" strokeWidth={2.2} />
      </header>

      <main className="min-h-0 flex-1 overflow-hidden px-3 pt-2.5">
        <p data-chat-date className="mb-2.5 text-center !text-[10px] text-[#8a8d91]">ថ្ងៃនេះ ម៉ោង 10:24</p>
        <div className="space-y-2">
          <MessageBubble
            side="incoming"
            className="max-w-[84%] rounded-[17px] rounded-bl-[5px] bg-[#f0f2f5] px-3 py-2 text-[11px] leading-[1.55]"
          >
            សួស្តីបង ក្រមាក្រហមមួយតម្លៃប៉ុន្មាន? ដឹកទៅបាត់ដំបងបានទេ?
          </MessageBubble>
          <MessageBubble
            side="outgoing"
            className="max-w-[86%] rounded-[17px] rounded-br-[5px] bg-[#0866ff] px-3 py-2 text-[11px] leading-[1.55] text-white shadow-sm"
            meta="10:25"
          >
            បានចាស មួយតម្លៃ $12។ ដឹក ២–៣ ថ្ងៃ ថ្លៃដឹក $2។
          </MessageBubble>
          <div className="flex justify-end">
            <div className="relative h-[132px] w-[78%] overflow-hidden rounded-[16px] rounded-br-[5px] bg-slate-100 shadow-sm">
              <Image
                src="/landing/chat/red-krama.webp"
                alt="Red Cambodian krama scarf"
                fill
                sizes="210px"
                className="object-cover"
              />
            </div>
          </div>
          <MessageBubble
            side="incoming"
            className="max-w-[72%] rounded-[17px] rounded-bl-[5px] bg-[#f0f2f5] px-3 py-2 text-[11px] leading-[1.5]"
          >
            ស្អាតណាស់បង! យកមួយ។
          </MessageBubble>
          <MessageBubble
            side="outgoing"
            className="max-w-[84%] rounded-[17px] rounded-br-[5px] bg-[#0866ff] px-3 py-2 text-[11px] leading-[1.5] text-white shadow-sm"
          >
            បានបង សុំលេខទូរស័ព្ទ និងទីតាំងផ្ញើមកបាន។
          </MessageBubble>
          <MessageBubble
            side="incoming"
            className="rounded-[17px] rounded-bl-[5px] bg-[#f0f2f5] px-3 py-2 text-[10.5px] leading-[1.45]"
          >
            012 345 678<br />ក្រុងបាត់ដំបង
          </MessageBubble>
        </div>
      </main>

      <div className="flex h-14 shrink-0 items-center gap-2 border-t border-black/[0.03] px-3">
        <span className="flex size-[22px] items-center justify-center rounded-full bg-[#0866ff] text-white">
          <Plus className="size-3" strokeWidth={2.4} />
        </span>
        <Camera className="size-[16px] text-[#0866ff]" strokeWidth={2.1} />
        <div data-chat-input className="flex h-9 min-w-0 flex-1 items-center rounded-full bg-[#f0f2f5] px-3 !text-xs text-[#65676b]">
          Aa
          <Smile className="ml-auto size-3 text-[#0866ff]" />
        </div>
        <span className="text-[15px] leading-none text-[#0866ff]">♥</span>
      </div>
      <div className="mx-auto mb-1 h-[3px] w-[84px] shrink-0 rounded-full bg-black" />
    </div>
  );
}

function TelegramScreen() {
  return (
    <div className="flex size-full flex-col bg-[#d8ebef] text-[#101820]">
      <div className="bg-white"><StatusBar /></div>
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[#d7e2e5] bg-white px-3.5">
        <ChevronLeft className="size-[19px] text-[#168bd2]" strokeWidth={2.3} />
        <Avatar src="/landing/chat/customer-daniel.webp" alt="Daniel Chhay" size="md" />
        <div className="min-w-0 flex-1 leading-tight">
          <p data-chat-name className="truncate !text-sm font-semibold !tracking-[-0.01em]">Daniel Chhay</p>
          <p data-chat-status className="mt-0.5 !text-[10px] text-[#168bd2]">last seen recently</p>
        </div>
        <Search className="size-[17px] text-[#168bd2]" strokeWidth={2} />
        <MoreHorizontal className="size-[19px] text-[#168bd2]" strokeWidth={2} />
      </header>

      <main
        className="min-h-0 flex-1 overflow-hidden px-3 pt-2.5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8px 8px, rgba(74,139,154,.09) 1px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div data-chat-date className="mx-auto mb-2.5 w-fit rounded-full bg-[#6f96a0]/75 px-3 py-1 !text-[10px] font-medium text-white shadow-sm">
          August 15
        </div>
        <div className="space-y-2">
          <MessageBubble
            side="incoming"
            className="max-w-[82%] rounded-[16px] rounded-bl-[5px] bg-white px-3 py-2 text-[11px] leading-[1.45] shadow-sm ring-1 ring-black/[0.025]"
            meta="10:32"
          >
            Hi! Is the red krama still available? Can you deliver to Battambang?
          </MessageBubble>
          <MessageBubble
            side="outgoing"
            className="max-w-[86%] rounded-[16px] rounded-br-[5px] bg-[#d8f7c8] px-3 py-2 text-[11px] leading-[1.45] shadow-sm ring-1 ring-black/[0.025]"
            meta={<span className="text-[#3b8752]">10:32 ✓✓</span>}
          >
            Yes — we have 5 left. $12 each. Free delivery, 2–3 days.
          </MessageBubble>
          <MessageBubble
            side="incoming"
            className="max-w-[72%] rounded-[16px] rounded-bl-[5px] bg-white px-3 py-2 text-[11px] leading-[1.45] shadow-sm ring-1 ring-black/[0.025]"
          >
            Great. Can I pay with KHQR?
          </MessageBubble>
          <div className="flex justify-end">
            <div className="rounded-[15px] rounded-br-[5px] bg-[#d8f7c8] p-2 shadow-sm ring-1 ring-black/[0.025]">
              <p data-chat-bubble className="mb-1.5 px-1 !text-[13px] !leading-[1.45]">Sure, scan this code.</p>
              <QrCard
                shopName="Sok Silk Shop"
                amount="12.00"
                currency="USD"
                hint="Scan to pay with any KHQR app"
                hintClassName="text-[#398548]"
              />
              <p className="mt-1 text-right text-[8px] text-[#3b8752]">10:33 ✓✓</p>
            </div>
          </div>
          <MessageBubble
            side="incoming"
            className="rounded-[16px] rounded-bl-[5px] bg-white px-3 py-2 text-[11px] shadow-sm"
            meta="10:35"
          >
            Paid, bong
          </MessageBubble>
        </div>
      </main>

      <div className="flex h-14 shrink-0 items-center gap-2 bg-white px-3.5">
        <Paperclip className="size-[16px] text-[#7d8b91]" strokeWidth={1.8} />
        <span data-chat-input className="flex-1 !text-xs text-[#8a989e]">Message</span>
        <Mic className="size-[15px] text-[#7d8b91]" strokeWidth={1.9} />
        <span className="flex size-[25px] items-center justify-center rounded-full bg-[#249dd3] text-white">
          <Send className="size-3.5 fill-white" />
        </span>
      </div>
      <div className="mx-auto mb-1 h-[3px] w-[84px] shrink-0 rounded-full bg-black" />
    </div>
  );
}

function InstagramScreen() {
  return (
    <div className="flex size-full flex-col bg-white text-[#111]">
      <StatusBar />
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-[#dbdbdb] px-3.5">
        <ChevronLeft className="size-[19px]" strokeWidth={2.3} />
        <Avatar
          src="/landing/chat/customer-sreypich.webp"
          alt="Sreyneang"
          size="md"
          ring="linear-gradient(135deg,#feda75,#d62976,#4f5bd5)"
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p data-chat-name className="truncate !text-sm font-semibold !tracking-[-0.01em]">sreyneang.24</p>
          <p data-chat-status className="mt-0.5 !text-[10px] text-[#737373]">Active 12m ago</p>
        </div>
        <Phone className="size-[17px]" strokeWidth={2} />
        <Video className="size-[18px]" strokeWidth={2} />
        <Info className="size-[17px]" strokeWidth={2} />
      </header>

      <main className="min-h-0 flex-1 overflow-hidden px-3 pt-2.5">
        <p data-chat-date className="mb-2.5 text-center !text-[10px] text-[#8e8e8e]">Today 11:08 AM</p>
        <div className="space-y-2">
          <MessageBubble
            side="incoming"
            className="max-w-[78%] rounded-[17px] rounded-bl-[5px] bg-[#efefef] px-3 py-2 text-[11px] leading-[1.45]"
          >
            bong, kroma blue nv stock ot?
          </MessageBubble>
          <MessageBubble
            side="outgoing"
            className="max-w-[86%] rounded-[17px] rounded-br-[5px] bg-gradient-to-br from-[#7c3aed] via-[#c026d3] to-[#ff3040] px-3 py-2 text-[11px] leading-[1.45] text-white shadow-sm"
            meta="Seen 11:09 AM"
          >
            nv bong! sol 8, tlai $12. deuk free knong Phnom Penh
          </MessageBubble>
          <div className="flex justify-end">
            <div className="w-[78%] overflow-hidden rounded-[15px] rounded-br-[5px] shadow-sm">
              <div className="relative h-[132px] bg-slate-100">
                <Image
                  src="/landing/chat/blue-krama.webp"
                  alt="Blue Cambodian krama scarf"
                  fill
                  sizes="210px"
                  className="object-cover"
                />
              </div>
              <div data-chat-bubble className="bg-gradient-to-r from-[#ff3040] via-[#c026d3] to-[#7c3aed] px-2.5 py-2 !text-[13px] !leading-[1.45] text-white">
                nih color blue bong
              </div>
            </div>
          </div>
          <MessageBubble
            side="incoming"
            className="rounded-[17px] rounded-bl-[5px] bg-[#efefef] px-3 py-2 text-[11px]"
          >
            ok, yok 2 bong
          </MessageBubble>
          <MessageBubble
            side="outgoing"
            className="max-w-[84%] rounded-[17px] rounded-br-[5px] bg-gradient-to-br from-[#7c3aed] via-[#c026d3] to-[#ff3040] px-3 py-2 text-[11px] leading-[1.45] text-white shadow-sm"
          >
            ban bong! total $24. send address + phone mk
          </MessageBubble>
          <MessageBubble
            side="incoming"
            className="rounded-[17px] rounded-bl-[5px] bg-[#efefef] px-3 py-2 text-[10.5px] leading-[1.45]"
          >
            012 345 678<br />Toul Kork, PP
          </MessageBubble>
        </div>
      </main>

      <div className="flex h-14 shrink-0 items-center gap-2 px-3.5">
        <div className="flex h-8 flex-1 items-center gap-2 rounded-full border border-[#dbdbdb] px-1.5">
          <span className="flex size-[21px] items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#ff3040] text-white">
            <Camera className="size-3" />
          </span>
          <span data-chat-input className="flex-1 !text-xs text-[#8e8e8e]">Message...</span>
          <Mic className="size-3.5" strokeWidth={1.8} />
          <ImageIcon className="size-3.5" strokeWidth={1.8} />
          <Smile className="size-3.5" strokeWidth={1.8} />
        </div>
      </div>
      <div className="mx-auto mb-1 h-[3px] w-[84px] shrink-0 rounded-full bg-black" />
    </div>
  );
}

export type ChatDemo = {
  id: "messenger" | "telegram" | "instagram";
  platform: string;
  detail: string;
  alt: string;
  Screen: ComponentType;
};

export const chatDemos: ChatDemo[] = [
  {
    id: "messenger",
    platform: "Messenger",
    detail: "Khmer product inquiry",
    alt: "A realistic Khmer product conversation in Messenger",
    Screen: MessengerScreen,
  },
  {
    id: "telegram",
    platform: "Telegram",
    detail: "English with KHQR",
    alt: "A realistic Telegram conversation with a demo KHQR payment",
    Screen: TelegramScreen,
  },
  {
    id: "instagram",
    platform: "Instagram",
    detail: "Romanized Khmer",
    alt: "A realistic romanized Khmer sales conversation in Instagram",
    Screen: InstagramScreen,
  },
];
