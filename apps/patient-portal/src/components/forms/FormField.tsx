'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Info, Check, X, ChevronDown, Star, Heart, Circle } from 'lucide-react';

interface SelectOption { value: string; label: string; disabled?: boolean; helpText?: string; }
interface BaseFormField { id: string; type: string; label: string; description?: string; placeholder?: string; helpText?: string; required?: boolean; disabled?: boolean; defaultValue?: unknown; prefillKey?: string; ariaLabel?: string; }
interface TextFormField extends BaseFormField { type: 'text' | 'email' | 'phone' | 'ssn'; maxLength?: number; autoComplete?: string; }
interface NumberFormField extends BaseFormField { type: 'number'; min?: number; max?: number; step?: number; prefix?: string; suffix?: string; }
interface DateFormField extends BaseFormField { type: 'date' | 'time' | 'datetime'; minDate?: string; maxDate?: string; }
interface SelectFormField extends BaseFormField { type: 'select' | 'multiselect' | 'radio' | 'checkboxGroup'; options: SelectOption[]; }
interface TextareaFormField extends BaseFormField { type: 'textarea' | 'multiline'; rows?: number; maxLength?: number; showCharCount?: boolean; }
interface CheckboxFormField extends BaseFormField { type: 'checkbox'; checkboxLabel?: string; }
interface YesNoFormField extends BaseFormField { type: 'yesNo'; yesLabel?: string; noLabel?: string; }
interface ConsentFormField extends BaseFormField { type: 'consent'; consentText: string; detailedText?: string; showDetailLink?: boolean; detailLinkLabel?: string; }
interface SliderFormField extends BaseFormField { type: 'slider'; sliderOptions: { min: number; max: number; step: number; showValue?: boolean; showLabels?: boolean; leftLabel?: string; rightLabel?: string; }; }
interface RatingFormField extends BaseFormField { type: 'rating'; ratingOptions: { maxRating: number; icon?: 'star' | 'heart' | 'circle'; }; }
interface HeaderFormField extends BaseFormField { type: 'header'; level?: 1 | 2 | 3 | 4 | 5 | 6; }
interface ParagraphFormField extends BaseFormField { type: 'paragraph'; content: string; }
interface SpacerFormField extends BaseFormField { type: 'spacer'; height?: number; }

type FormFieldType = TextFormField | NumberFormField | DateFormField | SelectFormField | TextareaFormField | CheckboxFormField | YesNoFormField | ConsentFormField | SliderFormField | RatingFormField | HeaderFormField | ParagraphFormField | SpacerFormField | BaseFormField;

export interface FormFieldProps { field: FormFieldType; value: unknown; onChange: (value: unknown) => void; error?: string; disabled?: boolean; prefillValue?: unknown; }

export const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, error, disabled = false, prefillValue }) => {
  const isDisabled = disabled || field.disabled;
  const actualValue = value ?? prefillValue ?? field.defaultValue;

  switch (field.type) {
    case 'text': case 'email': case 'phone': case 'ssn':
      return <TextField field={field as TextFormField} value={actualValue as string} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'number':
      return <NumberField field={field as NumberFormField} value={actualValue as number} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'date': case 'time': case 'datetime':
      return <DateField field={field as DateFormField} value={actualValue as string} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'select': case 'radio':
      return <SelectField field={field as SelectFormField} value={actualValue as string} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'multiselect': case 'checkboxGroup':
      return <MultiSelectField field={field as SelectFormField} value={actualValue as string[]} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'textarea': case 'multiline':
      return <TextareaField field={field as TextareaFormField} value={actualValue as string} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'checkbox':
      return <CheckboxField field={field as CheckboxFormField} value={actualValue as boolean} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'yesNo':
      return <YesNoField field={field as YesNoFormField} value={actualValue as boolean} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'consent':
      return <ConsentField field={field as ConsentFormField} value={actualValue as boolean} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'slider':
      return <SliderField field={field as SliderFormField} value={actualValue as number} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'rating':
      return <RatingField field={field as RatingFormField} value={actualValue as number} onChange={onChange} error={error} disabled={isDisabled} />;
    case 'header':
      return <HeaderField field={field as HeaderFormField} />;
    case 'paragraph':
      return <ParagraphField field={field as ParagraphFormField} />;
    case 'divider':
      return <DividerField />;
    case 'spacer':
      return <SpacerField height={(field as SpacerFormField).height} />;
    case 'address':
      return <AddressField field={field} value={actualValue as Record<string, string>} onChange={onChange} error={error} disabled={isDisabled} />;
    default:
      return <div className="p-4 bg-amber-50 rounded-lg my-2"><p className="text-sm text-amber-800">Unsupported field type: {field.type}</p></div>;
  }
};

interface FieldWrapperProps { label: string; description?: string; helpText?: string; required?: boolean; error?: string; children: React.ReactNode; }

const FieldWrapper: React.FC<FieldWrapperProps> = ({ label, description, helpText, required, error, children }) => (
  <div className="mb-5">
    {label && <Label className="text-sm font-semibold text-gray-800 mb-1.5 block">{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>}
    {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
    {children}
    {helpText && !error && <div className="flex items-center gap-1 mt-1.5"><Info className="w-3.5 h-3.5 text-gray-400" /><p className="text-xs text-gray-500">{helpText}</p></div>}
    {error && <div className="flex items-center gap-1 mt-1.5"><AlertCircle className="w-3.5 h-3.5 text-red-500" /><p className="text-xs text-red-500">{error}</p></div>}
  </div>
);

interface TextFieldProps { field: TextFormField; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean; }

const TextField: React.FC<TextFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const inputType = useMemo(() => {
    if (field.type === 'email') return 'email';
    if (field.type === 'phone') return 'tel';
    return 'text';
  }, [field.type]);

  return (
    <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
      <Input type={inputType} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} maxLength={field.maxLength} disabled={disabled} autoComplete={field.autoComplete} aria-label={field.ariaLabel || field.label} className={cn('w-full', error && 'border-red-500', disabled && 'bg-gray-100')} />
    </FieldWrapper>
  );
};

interface NumberFieldProps { field: NumberFormField; value: number; onChange: (value: number) => void; error?: string; disabled?: boolean; }

const NumberField: React.FC<NumberFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) onChange(num);
    else if (e.target.value === '') onChange(0);
  }, [onChange]);

  return (
    <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
      <div className="flex items-center gap-2">
        {field.prefix && <span className="text-gray-500">{field.prefix}</span>}
        <Input type="number" value={value?.toString() || ''} onChange={handleChange} placeholder={field.placeholder} min={field.min} max={field.max} step={field.step} disabled={disabled} className={cn('w-full', error && 'border-red-500', disabled && 'bg-gray-100')} />
        {field.suffix && <span className="text-gray-500">{field.suffix}</span>}
      </div>
    </FieldWrapper>
  );
};

interface DateFieldProps { field: DateFormField; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean; }

const DateField: React.FC<DateFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const inputType = useMemo(() => {
    if (field.type === 'time') return 'time';
    if (field.type === 'datetime') return 'datetime-local';
    return 'date';
  }, [field.type]);

  const formattedValue = useMemo(() => {
    if (!value) return '';
    try {
      const date = new Date(value);
      if (field.type === 'date') return date.toISOString().split('T')[0];
      if (field.type === 'time') return date.toTimeString().slice(0, 5);
      return date.toISOString().slice(0, 16);
    } catch { return value; }
  }, [value, field.type]);

  return (
    <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
      <Input type={inputType} value={formattedValue} onChange={(e) => onChange(e.target.value)} min={field.minDate} max={field.maxDate} disabled={disabled} className={cn('w-full', error && 'border-red-500', disabled && 'bg-gray-100')} />
    </FieldWrapper>
  );
};

interface SelectFieldProps { field: SelectFormField; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean; }

const SelectField: React.FC<SelectFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const isRadio = field.type === 'radio';

  if (isRadio) {
    return (
      <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
        <div className="space-y-2">
          {field.options.map((option) => (
            <button key={option.value} type="button" onClick={() => !disabled && !option.disabled && onChange(option.value)} disabled={disabled || option.disabled} className={cn('w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left', value === option.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300', (disabled || option.disabled) && 'opacity-50 cursor-not-allowed')}>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5', value === option.value ? 'border-purple-500' : 'border-gray-300')}>
                {value === option.value && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
              </div>
              <div className="flex-1">
                <span className={cn('text-sm', value === option.value ? 'text-purple-700 font-medium' : 'text-gray-700')}>{option.label}</span>
                {option.helpText && <p className="text-xs text-gray-500 mt-0.5">{option.helpText}</p>}
              </div>
            </button>
          ))}
        </div>
      </FieldWrapper>
    );
  }

  return (
    <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
      <div className="relative">
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={cn('w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring', error && 'border-red-500', disabled && 'bg-gray-100')}>
          <option value="">Select an option...</option>
          {field.options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </FieldWrapper>
  );
};

interface MultiSelectFieldProps { field: SelectFormField; value: string[]; onChange: (value: string[]) => void; error?: string; disabled?: boolean; }

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({ field, value = [], onChange, error, disabled }) => {
  const handleToggle = useCallback((optionValue: string) => {
    const newValue = value.includes(optionValue) ? value.filter((v) => v !== optionValue) : [...value, optionValue];
    onChange(newValue);
  }, [value, onChange]);

  return (
    <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
      <div className="space-y-2">
        {field.options.map((option) => {
          const isChecked = value.includes(option.value);
          return (
            <button key={option.value} type="button" onClick={() => !disabled && !option.disabled && handleToggle(option.value)} disabled={disabled || option.disabled} className={cn('w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left', isChecked ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300', (disabled || option.disabled) && 'opacity-50 cursor-not-allowed')}>
              <div className={cn('w-5 h-5 rounded flex items-center justify-center', isChecked ? 'bg-purple-500' : 'border-2 border-gray-300')}>
                {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={cn('text-sm', isChecked ? 'text-purple-700 font-medium' : 'text-gray-700')}>{option.label}</span>
            </button>
          );
        })}
      </div>
    </FieldWrapper>
  );
};

interface TextareaFieldProps { field: TextareaFormField; value: string; onChange: (value: string) => void; error?: string; disabled?: boolean; }

const TextareaField: React.FC<TextareaFieldProps> = ({ field, value, onChange, error, disabled }) => (
  <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
    <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} rows={field.rows || 4} maxLength={field.maxLength} disabled={disabled} className={cn('w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring', error && 'border-red-500', disabled && 'bg-gray-100')} />
    {field.showCharCount && field.maxLength && <p className="text-xs text-gray-400 text-right mt-1">{(value || '').length}/{field.maxLength}</p>}
  </FieldWrapper>
);

interface CheckboxFieldProps { field: CheckboxFormField; value: boolean; onChange: (value: boolean) => void; error?: string; disabled?: boolean; }

const CheckboxField: React.FC<CheckboxFieldProps> = ({ field, value, onChange, error, disabled }) => (
  <div className="mb-5">
    <button type="button" onClick={() => !disabled && onChange(!value)} disabled={disabled} className={cn('w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left', error ? 'bg-red-50' : 'bg-gray-50 hover:bg-gray-100', disabled && 'opacity-50 cursor-not-allowed')}>
      <div className={cn('w-5 h-5 rounded flex items-center justify-center mt-0.5', value ? 'bg-purple-500' : 'border-2 border-gray-300 bg-white')}>
        {value && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className="text-sm text-gray-700">{field.checkboxLabel || field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</span>
    </button>
    {error && <div className="flex items-center gap-1 mt-1.5"><AlertCircle className="w-3.5 h-3.5 text-red-500" /><p className="text-xs text-red-500">{error}</p></div>}
  </div>
);

interface YesNoFieldProps { field: YesNoFormField; value: boolean; onChange: (value: boolean) => void; error?: string; disabled?: boolean; }

const YesNoField: React.FC<YesNoFieldProps> = ({ field, value, onChange, error, disabled }) => (
  <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
    <div className="flex gap-3">
      <button type="button" onClick={() => !disabled && onChange(true)} disabled={disabled} className={cn('flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors', value === true ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-green-300', disabled && 'opacity-50 cursor-not-allowed')}>
        <Check className={cn('w-5 h-5', value === true ? 'text-white' : 'text-green-500')} />
        <span className="font-medium">{field.yesLabel || 'Yes'}</span>
      </button>
      <button type="button" onClick={() => !disabled && onChange(false)} disabled={disabled} className={cn('flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors', value === false ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300', disabled && 'opacity-50 cursor-not-allowed')}>
        <X className={cn('w-5 h-5', value === false ? 'text-white' : 'text-red-500')} />
        <span className="font-medium">{field.noLabel || 'No'}</span>
      </button>
    </div>
  </FieldWrapper>
);

interface ConsentFieldProps { field: ConsentFormField; value: boolean; onChange: (value: boolean) => void; error?: string; disabled?: boolean; }

const ConsentField: React.FC<ConsentFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="mb-5">
      <div className={cn('p-4 rounded-xl border', error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50')}>
        <button type="button" onClick={() => !disabled && onChange(!value)} disabled={disabled} className={cn('flex items-start gap-3 w-full text-left', disabled && 'opacity-50 cursor-not-allowed')}>
          <div className={cn('w-5 h-5 rounded flex items-center justify-center mt-0.5', value ? 'bg-purple-500' : 'border-2 border-gray-300 bg-white')}>
            {value && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className="text-sm text-gray-700">{field.consentText}{field.required && <span className="text-red-500 ml-1">*</span>}</span>
        </button>
        {field.showDetailLink && field.detailedText && <button type="button" onClick={() => setShowDetails(!showDetails)} className="mt-2 ml-8 text-sm text-purple-600 font-medium hover:text-purple-700">{field.detailLinkLabel || 'View details'}</button>}
      </div>
      {showDetails && field.detailedText && <div className="mt-3 p-3 bg-gray-100 rounded-lg"><p className="text-sm text-gray-600 whitespace-pre-line">{field.detailedText}</p></div>}
      {error && <div className="flex items-center gap-1 mt-1.5"><AlertCircle className="w-3.5 h-3.5 text-red-500" /><p className="text-xs text-red-500">{error}</p></div>}
    </div>
  );
};

interface SliderFieldProps { field: SliderFormField; value: number; onChange: (value: number) => void; error?: string; disabled?: boolean; }

const SliderField: React.FC<SliderFieldProps> = ({ field, value, onChange, error, disabled }) => {
  const { sliderOptions } = field;
  const currentValue = value ?? sliderOptions.min;
  const percentage = ((currentValue - sliderOptions.min) / (sliderOptions.max - sliderOptions.min)) * 100;

  return (
    <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
      <div className="py-2">
        {sliderOptions.showLabels && <div className="flex justify-between mb-2"><span className="text-xs text-gray-500">{sliderOptions.leftLabel || sliderOptions.min}</span><span className="text-xs text-gray-500">{sliderOptions.rightLabel || sliderOptions.max}</span></div>}
        <input type="range" min={sliderOptions.min} max={sliderOptions.max} step={sliderOptions.step} value={currentValue} onChange={(e) => onChange(parseFloat(e.target.value))} disabled={disabled} className={cn('w-full h-2 rounded-lg appearance-none cursor-pointer', disabled && 'opacity-50')} style={{ background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)` }} />
        {sliderOptions.showValue && <p className="text-center text-lg font-semibold text-purple-600 mt-3">{currentValue}</p>}
      </div>
    </FieldWrapper>
  );
};

interface RatingFieldProps { field: RatingFormField; value: number; onChange: (value: number) => void; error?: string; disabled?: boolean; }

const RatingField: React.FC<RatingFieldProps> = ({ field, value = 0, onChange, error, disabled }) => {
  const { ratingOptions } = field;
  const IconComponent = useMemo(() => {
    if (ratingOptions.icon === 'heart') return Heart;
    if (ratingOptions.icon === 'circle') return Circle;
    return Star;
  }, [ratingOptions.icon]);

  return (
    <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
      <div className="flex justify-center gap-2">
        {Array.from({ length: ratingOptions.maxRating }, (_, i) => (
          <button key={i} type="button" onClick={() => !disabled && onChange(i + 1)} disabled={disabled} className={cn('p-1 transition-transform hover:scale-110', disabled && 'opacity-50 cursor-not-allowed')} aria-label={`Rate ${i + 1} out of ${ratingOptions.maxRating}`}>
            <IconComponent className={cn('w-8 h-8', i < value ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />
          </button>
        ))}
      </div>
    </FieldWrapper>
  );
};

interface AddressFieldProps { field: BaseFormField; value: Record<string, string>; onChange: (value: Record<string, string>) => void; error?: string; disabled?: boolean; }

const AddressField: React.FC<AddressFieldProps> = ({ field, value = {}, onChange, error, disabled }) => {
  const handleFieldChange = (fieldName: string, fieldValue: string) => {
    onChange({ ...value, [fieldName]: fieldValue });
  };

  return (
    <FieldWrapper label={field.label} description={field.description} helpText={field.helpText} required={field.required} error={error}>
      <div className="space-y-3">
        <Input placeholder="Street Address" value={value.street1 || ''} onChange={(e) => handleFieldChange('street1', e.target.value)} disabled={disabled} className={cn(disabled && 'bg-gray-100')} />
        <Input placeholder="Apt, Suite, etc. (optional)" value={value.street2 || ''} onChange={(e) => handleFieldChange('street2', e.target.value)} disabled={disabled} className={cn(disabled && 'bg-gray-100')} />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="City" value={value.city || ''} onChange={(e) => handleFieldChange('city', e.target.value)} disabled={disabled} className={cn(disabled && 'bg-gray-100')} />
          <Input placeholder="State" value={value.state || ''} onChange={(e) => handleFieldChange('state', e.target.value)} disabled={disabled} className={cn(disabled && 'bg-gray-100')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="ZIP Code" value={value.zipCode || ''} onChange={(e) => handleFieldChange('zipCode', e.target.value)} disabled={disabled} className={cn(disabled && 'bg-gray-100')} />
          <Input placeholder="Country" value={value.country || 'USA'} onChange={(e) => handleFieldChange('country', e.target.value)} disabled={disabled} className={cn(disabled && 'bg-gray-100')} />
        </div>
      </div>
    </FieldWrapper>
  );
};

const HeaderField: React.FC<{ field: HeaderFormField }> = ({ field }) => {
  const fontSize = useMemo(() => {
    const sizes: Record<number, string> = { 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg', 4: 'text-base', 5: 'text-sm', 6: 'text-xs' };
    return sizes[field.level || 2] || 'text-xl';
  }, [field.level]);

  return (
    <div className="my-4">
      <h3 className={cn('font-bold text-gray-800', fontSize)}>{field.label}</h3>
      {field.description && <p className="text-sm text-gray-500 mt-1">{field.description}</p>}
    </div>
  );
};

const ParagraphField: React.FC<{ field: ParagraphFormField }> = ({ field }) => (
  <div className="my-2"><p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{field.content}</p></div>
);

const DividerField: React.FC = () => <div className="my-4"><hr className="border-gray-200" /></div>;

const SpacerField: React.FC<{ height?: number }> = ({ height = 16 }) => <div style={{ height }} />;

export default FormField;
