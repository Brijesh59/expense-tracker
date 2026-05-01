// CategoryIcons.tsx
import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
};

const strokeProps = (color: string) => ({
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/* ================= Icons ================= */

export const RentIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M3 10.5 12 3l9 7.5" />
    <Path {...strokeProps(color)} d="M5 10v10h14V10" />
    <Path {...strokeProps(color)} d="M9 20v-6h6v6" />
  </Svg>
);

export const SocietyMaintenanceIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M4 21V9l8-6 8 6v12" />
    <Path {...strokeProps(color)} d="M9 21v-6h6v6" />
    <Circle {...strokeProps(color)} cx="8" cy="11" r="0.5" />
    <Circle {...strokeProps(color)} cx="16" cy="11" r="0.5" />
  </Svg>
);

export const ElectricityIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </Svg>
);

export const WaterIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M12 2s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z" />
  </Svg>
);

export const CookingGasIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="9" y="3" width="6" height="4" />
    <Path {...strokeProps(color)} d="M7 7h10l1 14H6L7 7z" />
    <Path {...strokeProps(color)} d="M10 12h4" />
  </Svg>
);

export const InternetIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M5 12.5a10 10 0 0 1 14 0" />
    <Path {...strokeProps(color)} d="M8.5 16a5 5 0 0 1 7 0" />
    <Circle {...strokeProps(color)} cx="12" cy="20" r="0.5" />
  </Svg>
);

export const MobileRechargeIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="7" y="2" width="10" height="20" rx="2" />
    <Path {...strokeProps(color)} d="M12 7v5" />
    <Path {...strokeProps(color)} d="m9.5 9.5 2.5-2.5 2.5 2.5" />
  </Svg>
);

export const OTTIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="3" y="5" width="18" height="12" rx="2" />
    <Path {...strokeProps(color)} d="m10 9 5 3-5 3V9z" />
  </Svg>
);

export const InsuranceHealthIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path {...strokeProps(color)} d="M12 8v8M8 12h8" />
  </Svg>
);

export const InsuranceTermIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path {...strokeProps(color)} d="M9 12h6M12 9v6" />
  </Svg>
);

export const LoanEMIIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="3" y="6" width="18" height="12" rx="2" />
    <Path {...strokeProps(color)} d="M7 10h10M7 14h5" />
  </Svg>
);

export const GroceryIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M6 7h15l-2 9H8L6 7z" />
    <Path {...strokeProps(color)} d="M6 7 5 3H2" />
    <Circle {...strokeProps(color)} cx="9" cy="20" r="1" />
    <Circle {...strokeProps(color)} cx="18" cy="20" r="1" />
  </Svg>
);

export const MilkIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M9 2h6v4l2 3v13H7V9l2-3V2z" />
    <Path {...strokeProps(color)} d="M9 6h6" />
  </Svg>
);

export const FruitsIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M12 7c-4 0-7 3-7 7a5 5 0 0 0 10 3 5 5 0 0 0 4-8c-1.5-1.5-4-2-7-2z" />
    <Path {...strokeProps(color)} d="M12 7c0-2 1-4 3-5" />
  </Svg>
);

export const HouseholdIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="9" y="2" width="6" height="5" />
    <Path {...strokeProps(color)} d="M8 7h8l2 15H6L8 7z" />
  </Svg>
);

export const TransportIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="5" y="3" width="14" height="14" rx="2" />
    <Circle {...strokeProps(color)} cx="9" cy="9" r="1" />
    <Circle {...strokeProps(color)} cx="15" cy="9" r="1" />
  </Svg>
);

export const MedicalIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="3" y="8" width="18" height="12" rx="2" />
    <Path {...strokeProps(color)} d="M12 11v6M9 14h6" />
  </Svg>
);

export const FamilyIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Circle {...strokeProps(color)} cx="12" cy="5" r="3" />
    <Path {...strokeProps(color)} d="M5 21a7 7 0 0 1 14 0" />
  </Svg>
);

export const HouseHelpIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M4 11 12 4l8 7" />
    <Path {...strokeProps(color)} d="M6 10v10h12V10" />
  </Svg>
);

export const DiningIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M4 3v8M8 3v8M6 11v10" />
    <Path {...strokeProps(color)} d="M17 3v18" />
  </Svg>
);

export const EntertainmentIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M4 10h16v10H4z" />
    <Circle {...strokeProps(color)} cx="9" cy="15" r="0.5" />
    <Circle {...strokeProps(color)} cx="15" cy="15" r="0.5" />
  </Svg>
);

export const ShoppingIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Path {...strokeProps(color)} d="M6 8h12l1 13H5L6 8z" />
    <Path {...strokeProps(color)} d="M9 8a3 3 0 0 1 6 0" />
  </Svg>
);

export const PersonalCareIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="8" y="3" width="8" height="5" />
    <Path {...strokeProps(color)} d="M9 8h6l1 13H8L9 8z" />
  </Svg>
);

export const SkinCareIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Rect {...strokeProps(color)} x="10" y="2" width="4" height="5" />
    <Path {...strokeProps(color)} d="M8 7h8l1 14H7L8 7z" />
  </Svg>
);

export const OthersIcon = ({ size = 24, color = "#111" }: Props) => (
  <Svg {...baseProps} width={size} height={size}>
    <Circle {...strokeProps(color)} cx="5" cy="12" r="1" />
    <Circle {...strokeProps(color)} cx="12" cy="12" r="1" />
    <Circle {...strokeProps(color)} cx="19" cy="12" r="1" />
  </Svg>
);