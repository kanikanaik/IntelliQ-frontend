export type StepState = "completed" | "active" | "pending";

export type WizardStep = {
  number: number;
  label: string;
  state: StepState;
};

export const WIZARD_STEPS: WizardStep[] = [
  { number: 1, label: "Topic Selection", state: "completed" },
  { number: 2, label: "Content Input", state: "active" },
  { number: 3, label: "AI Settings", state: "pending" },
  { number: 4, label: "Review", state: "pending" },
];
