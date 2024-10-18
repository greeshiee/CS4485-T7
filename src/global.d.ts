export {};

declare global {
  interface Window {
    particlesJS: (tagId: string, config: object) => void;
  }
}
