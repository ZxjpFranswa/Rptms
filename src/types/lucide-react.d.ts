declare module "lucide-react" {
  import * as React from "react";

  // Generic “named icon component” support.
  // Different versions of lucide expose slightly different named exports.
  export type LucideIconComponent = React.ComponentType<any>;

  const namedIcons: Record<string, LucideIconComponent>;

  // Allow any named export to satisfy TS.
  export const Search: LucideIconComponent;
  export const Printer: LucideIconComponent;
  export const CheckCircle: LucideIconComponent;
  export const X: LucideIconComponent;
  export const Download: LucideIconComponent;
  export const Filter: LucideIconComponent;
  export const Eye: LucideIconComponent;
  export const Edit2: LucideIconComponent;
  export const Calendar: LucideIconComponent;
  export const DollarSign: LucideIconComponent;

  export default namedIcons;

}

