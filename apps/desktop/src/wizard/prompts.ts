export type WizardSelectOption<T = string> = {
  value: T;
  label: string;
  hint?: string;
};

export type WizardSelectParams<T = string> = {
  message: string;
  options: Array<WizardSelectOption<T>>;
  initialValue?: T;
};

export type WizardMultiSelectParams<T = string> = {
  message: string;
  options: Array<WizardSelectOption<T>>;
  initialValues?: T[];
};

export type WizardTextParams = {
  message: string;
  initialValue?: string;
  placeholder?: string;
  validate?: (value: string) => string | undefined;
};

export type WizardConfirmParams = {
  message: string;
  initialValue?: boolean;
};

export type WizardFormField = {
  key: string;
  label: string;
  type: "text" | "password" | "confirm" | "select";
  initialValue?: unknown;
  placeholder?: string;
  options?: Array<{ value: unknown; label: string; hint?: string }>;
};

export type WizardFormParams = {
  title: string;
  message?: string;
  fields: WizardFormField[];
};

export type WizardProgress = {
  update: (message: string) => void;
  stop: (message?: string) => void;
};

export type WizardPrompter = {
  intro: (title: string) => Promise<void>;
  outro: (message: string) => Promise<void>;
  note: (message: string, title?: string) => Promise<void>;
  select: <T>(params: WizardSelectParams<T>) => Promise<T>;
  multiselect: <T>(params: WizardMultiSelectParams<T>) => Promise<T[]>;
  text: (params: WizardTextParams) => Promise<string>;
  input: (params: WizardTextParams) => Promise<string>; // Alias for text
  confirm: (params: WizardConfirmParams) => Promise<boolean>;
  form: (params: WizardFormParams) => Promise<Record<string, unknown>>;
  progress: (label: string) => WizardProgress;
};

export class WizardCancelledError extends Error {
  constructor(message = "wizard cancelled") {
    super(message);
    this.name = "WizardCancelledError";
  }
}

export class WizardBackError extends Error {
  constructor() {
    super("wizard back");
    this.name = "WizardBackError";
  }
}
