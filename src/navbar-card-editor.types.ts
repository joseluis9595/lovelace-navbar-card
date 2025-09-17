import { TemplateResult } from 'lit';
import { NavbarCardConfig, DotNotationKeys } from '@/types';

type BaseInputOptions = {
  configKey: DotNotationKeys<NavbarCardConfig>;
  label: string;
  tooltip?: string | TemplateResult;
  templateHelper?: string | TemplateResult;
  disabled?: boolean;
};

type StringInputOptions = BaseInputOptions & {
  inputType: 'string';
  placeholder?: string;
  textHelper?: string | TemplateResult;
};

type EntityInputOptions = BaseInputOptions & {
  inputType: 'entity';
  includeDomains?: string[];
  excludeDomains?: string[];
};

type IconInputOptions = BaseInputOptions & {
  inputType: 'icon';
};

type NumberInputOptions = BaseInputOptions & {
  inputType: 'number';
  min?: number;
  max?: number;
};

type SwitchInputOptions = BaseInputOptions & {
  inputType: 'switch';
  defaultValue?: boolean;
};

export type TemplatableInputOptions =
  | StringInputOptions
  | EntityInputOptions
  | IconInputOptions
  | NumberInputOptions
  | SwitchInputOptions;
