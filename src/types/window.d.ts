export {};

declare global {
  interface Window {
    aiscreensBuildPlanFromForm?: (form: HTMLFormElement) => void;
    aiscreensBuildPlanFromButton?: (button: HTMLButtonElement) => void;
  }
}
