// Allow CSS file imports as side effects
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
