export class TemplateError extends Error {
  constructor(message: string, public template?: unknown, public originalError?: unknown) {
    super(message);
    this.name = 'TemplateError';
  }
}