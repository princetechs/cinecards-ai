export {};

declare global {
  interface Window {
    cinecardsBuildPlanFromForm?: (form: HTMLFormElement) => void;
    cinecardsBuildPlanFromButton?: (button: HTMLButtonElement) => void;
  }
}
