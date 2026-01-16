/**
 * Template Services Exports
 * Public API for template engine and variable resolution
 */

export { TemplateEngine } from './template-engine';
export type { TemplateContext, RenderResult, TemplateVariable } from './template-engine';

export { VariableResolver } from './variable-resolver';
export type { ResolveResult, FieldFormatter } from './variable-resolver';

// Aliases for backward compatibility
export type { TemplateContext as MessageTemplateContext, RenderResult as TemplateRenderResult } from './template-engine';
