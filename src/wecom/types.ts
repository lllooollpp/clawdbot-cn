import type { WeComAccountConfig } from "../config/types.js";

export interface ResolvedWeComAccount extends Required<WeComAccountConfig> {
  id: string;
}
