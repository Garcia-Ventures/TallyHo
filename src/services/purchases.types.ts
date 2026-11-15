export interface PurchaseResult {
  success: boolean;
  isPro: boolean;
  userCancelled?: boolean;
  error?: string;
  redirected?: boolean;
  needsEmail?: boolean;
  /** Store reports the product as already owned — caller should recover via restore. */
  alreadyOwned?: boolean;
}

export interface PurchasesProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

export interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: PurchasesProduct;
}

export interface PurchasesOffering {
  identifier: string;
  serverDescription: string;
  availablePackages: PurchasesPackage[];
  lifetime?: PurchasesPackage | null;
  annual?: PurchasesPackage | null;
  monthly?: PurchasesPackage | null;
}

export interface PurchasesOfferings {
  all: Record<string, PurchasesOffering>;
  current: PurchasesOffering | null;
}

export type ProGrantListener = () => void;
