import React from "react";
import {
  ImageItem,
  PhoneCarousel,
} from "@/components/ui/phone-mockups-1-utils/phone-carousel";

const exampleImages: ImageItem[] = [
  {
    src: "/landing/screens/apsara-chat.svg",
    alt: "Apsara Assistant customer conversation on iPhone",
  },
  {
    src: "/landing/screens/apsara-orders.svg",
    alt: "Apsara Assistant order management on iPhone",
  },
  {
    src: "/landing/screens/apsara-analytics.svg",
    alt: "Apsara Assistant analytics dashboard on iPhone",
  },
  {
    src: "/landing/screens/apsara-inventory.svg",
    alt: "Apsara Assistant inventory management on iPhone",
  },
];

export default function PhoneMockupBasic() {
  return <PhoneCarousel images={exampleImages} />;
}
