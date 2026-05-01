import React from 'react';
import {
  RentIcon, SocietyMaintenanceIcon, ElectricityIcon, WaterIcon,
  CookingGasIcon, InternetIcon, MobileRechargeIcon, OTTIcon,
  InsuranceHealthIcon, InsuranceTermIcon, LoanEMIIcon, GroceryIcon,
  MilkIcon, FruitsIcon, HouseholdIcon, TransportIcon, MedicalIcon,
  FamilyIcon, HouseHelpIcon, DiningIcon, EntertainmentIcon, ShoppingIcon,
  PersonalCareIcon, SkinCareIcon, OthersIcon,
} from './Icons';

export type IconKey =
  | 'rent' | 'society' | 'electricity' | 'water' | 'gas' | 'internet'
  | 'mobile' | 'ott' | 'insurance_health' | 'insurance_term' | 'loan'
  | 'grocery' | 'milk' | 'fruits' | 'household' | 'transport' | 'medical'
  | 'family' | 'house_help' | 'dining' | 'entertainment' | 'shopping'
  | 'personal_care' | 'skin_care' | 'others';

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

export const ICON_MAP: Record<IconKey, IconComponent> = {
  rent:             RentIcon,
  society:          SocietyMaintenanceIcon,
  electricity:      ElectricityIcon,
  water:            WaterIcon,
  gas:              CookingGasIcon,
  internet:         InternetIcon,
  mobile:           MobileRechargeIcon,
  ott:              OTTIcon,
  insurance_health: InsuranceHealthIcon,
  insurance_term:   InsuranceTermIcon,
  loan:             LoanEMIIcon,
  grocery:          GroceryIcon,
  milk:             MilkIcon,
  fruits:           FruitsIcon,
  household:        HouseholdIcon,
  transport:        TransportIcon,
  medical:          MedicalIcon,
  family:           FamilyIcon,
  house_help:       HouseHelpIcon,
  dining:           DiningIcon,
  entertainment:    EntertainmentIcon,
  shopping:         ShoppingIcon,
  personal_care:    PersonalCareIcon,
  skin_care:        SkinCareIcon,
  others:           OthersIcon,
};

export const ICON_LABELS: Record<IconKey, string> = {
  rent:             'Rent',
  society:          'Society',
  electricity:      'Electricity',
  water:            'Water',
  gas:              'Gas',
  internet:         'Internet',
  mobile:           'Mobile',
  ott:              'OTT',
  insurance_health: 'Health Ins.',
  insurance_term:   'Term Ins.',
  loan:             'Loan / EMI',
  grocery:          'Grocery',
  milk:             'Milk',
  fruits:           'Fruits',
  household:        'Household',
  transport:        'Transport',
  medical:          'Medical',
  family:           'Family',
  house_help:       'House Help',
  dining:           'Dining',
  entertainment:    'Entertainment',
  shopping:         'Shopping',
  personal_care:    'Personal Care',
  skin_care:        'Skin Care',
  others:           'Others',
};

export const ALL_ICON_KEYS = Object.keys(ICON_MAP) as IconKey[];

interface CategoryIconProps {
  iconKey: string;
  size?: number;
  color?: string;
}

export function CategoryIcon({ iconKey, size = 22, color = '#fff' }: CategoryIconProps) {
  const Component = ICON_MAP[iconKey as IconKey] ?? OthersIcon;
  return <Component size={size} color={color} />;
}
