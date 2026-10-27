import type { TemplateResult } from 'lit';

import type { DotNotationKeys, NavbarCardConfig } from '@/types';

type BaseInputOptions = {
  configKey: DotNotationKeys<NavbarCardConfig>;
  label: string;
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
};

type IconInputOptions = BaseInputOptions & {
  inputType: 'icon';
};

type SwitchInputOptions = BaseInputOptions & {
  inputType: 'switch';
  defaultValue?: boolean;
  helper?: string | TemplateResult;
};

export type ColorInputOptions = BaseInputOptions & {
  inputType: 'color';
};

export type TemplatableInputOptions =
  | StringInputOptions
  | EntityInputOptions
  | IconInputOptions
  | SwitchInputOptions
  | ColorInputOptions;

export type FieldAction = {
  label: string;
  icon: string;
  onClick?: () => void;
  href?: string;
  active?: boolean;
};
