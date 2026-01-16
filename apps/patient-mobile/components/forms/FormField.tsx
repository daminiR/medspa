/**
 * FormField Component
 *
 * Reusable form field components supporting all field types
 * defined in the form schema. Handles validation, styling,
 * and accessibility.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import type {
  FormField as FormFieldType,
  SelectOption,
  TextFormField,
  NumberFormField,
  DateFormField,
  SelectFormField,
  TextareaFormField,
  CheckboxFormField,
  YesNoFormField,
  ConsentFormField,
  SliderFormField,
  RatingFormField,
  HeaderFormField,
  ParagraphFormField,
} from '@medical-spa/types';

export interface FormFieldProps {
  field: FormFieldType;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  prefillValue?: unknown;
  testID?: string;
}

// ============================================================================
// Main FormField Component
// ============================================================================

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  prefillValue,
  testID,
}) => {
  const isDisabled = disabled || field.disabled;
  const actualValue = value ?? prefillValue ?? field.defaultValue;

  // Render based on field type
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'ssn':
      return (
        <TextField
          field={field as TextFormField}
          value={actualValue as string}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'number':
      return (
        <NumberField
          field={field as NumberFormField}
          value={actualValue as number}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'date':
    case 'time':
    case 'datetime':
      return (
        <DateField
          field={field as DateFormField}
          value={actualValue as string}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'select':
    case 'radio':
      return (
        <SelectField
          field={field as SelectFormField}
          value={actualValue as string}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'multiselect':
    case 'checkboxGroup':
      return (
        <MultiSelectField
          field={field as SelectFormField}
          value={actualValue as string[]}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'textarea':
    case 'multiline':
      return (
        <TextareaField
          field={field as TextareaFormField}
          value={actualValue as string}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'checkbox':
      return (
        <CheckboxField
          field={field as CheckboxFormField}
          value={actualValue as boolean}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'yesNo':
      return (
        <YesNoField
          field={field as YesNoFormField}
          value={actualValue as boolean}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'consent':
      return (
        <ConsentField
          field={field as ConsentFormField}
          value={actualValue as boolean}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'slider':
      return (
        <SliderField
          field={field as SliderFormField}
          value={actualValue as number}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'rating':
      return (
        <RatingField
          field={field as RatingFormField}
          value={actualValue as number}
          onChange={onChange}
          error={error}
          disabled={isDisabled}
          testID={testID}
        />
      );

    case 'header':
      return <HeaderField field={field as HeaderFormField} testID={testID} />;

    case 'paragraph':
      return <ParagraphField field={field as ParagraphFormField} testID={testID} />;

    case 'divider':
      return <DividerField testID={testID} />;

    case 'spacer':
      return <SpacerField height={field.height} testID={testID} />;

    default:
      return (
        <View style={styles.unsupportedField}>
          <Text style={styles.unsupportedText}>
            Unsupported field type: {field.type}
          </Text>
        </View>
      );
  }
};

// ============================================================================
// Field Wrapper Component
// ============================================================================

interface FieldWrapperProps {
  label: string;
  description?: string;
  helpText?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  testID?: string;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  description,
  helpText,
  required,
  error,
  children,
  testID,
}) => (
  <View style={styles.fieldWrapper} testID={testID}>
    {label && (
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    )}
    {description && <Text style={styles.description}>{description}</Text>}
    {children}
    {helpText && !error && (
      <View style={styles.helpContainer}>
        <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
        <Text style={styles.helpText}>{helpText}</Text>
      </View>
    )}
    {error && (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={14} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

// ============================================================================
// TextField Component
// ============================================================================

interface TextFieldProps {
  field: TextFormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => {
  const keyboardType = useMemo(() => {
    switch (field.type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'ssn':
        return 'number-pad';
      default:
        return 'default';
    }
  }, [field.type]);

  return (
    <FieldWrapper
      label={field.label}
      description={field.description}
      helpText={field.helpText}
      required={field.required}
      error={error}
      testID={testID}
    >
      <TextInput
        style={[
          styles.textInput,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        value={value || ''}
        onChangeText={onChange}
        placeholder={field.placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={field.autoCapitalize || 'sentences'}
        autoComplete={field.autoComplete as any}
        maxLength={field.maxLength}
        editable={!disabled}
        accessibilityLabel={field.ariaLabel || field.label}
      />
    </FieldWrapper>
  );
};

// ============================================================================
// NumberField Component
// ============================================================================

interface NumberFieldProps {
  field: NumberFormField;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const NumberField: React.FC<NumberFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => {
  const handleChange = useCallback(
    (text: string) => {
      const num = parseFloat(text.replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) {
        onChange(num);
      } else if (text === '') {
        onChange(0);
      }
    },
    [onChange]
  );

  return (
    <FieldWrapper
      label={field.label}
      description={field.description}
      helpText={field.helpText}
      required={field.required}
      error={error}
      testID={testID}
    >
      <View style={styles.numberInputContainer}>
        {field.prefix && <Text style={styles.inputAffix}>{field.prefix}</Text>}
        <TextInput
          style={[
            styles.textInput,
            styles.numberInput,
            error && styles.inputError,
            disabled && styles.inputDisabled,
          ]}
          value={value?.toString() || ''}
          onChangeText={handleChange}
          placeholder={field.placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          editable={!disabled}
          accessibilityLabel={field.ariaLabel || field.label}
        />
        {field.suffix && <Text style={styles.inputAffix}>{field.suffix}</Text>}
      </View>
    </FieldWrapper>
  );
};

// ============================================================================
// DateField Component
// ============================================================================

interface DateFieldProps {
  field: DateFormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const DateField: React.FC<DateFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = useMemo(() => {
    if (value) {
      return new Date(value);
    }
    return new Date();
  }, [value]);

  const mode = useMemo(() => {
    switch (field.type) {
      case 'time':
        return 'time';
      case 'datetime':
        return 'datetime';
      default:
        return 'date';
    }
  }, [field.type]);

  const handleChange = useCallback(
    (event: any, selectedDate?: Date) => {
      setShowPicker(Platform.OS === 'ios');
      if (selectedDate) {
        onChange(selectedDate.toISOString());
      }
    },
    [onChange]
  );

  const displayValue = useMemo(() => {
    if (!value) return '';
    const date = new Date(value);
    switch (field.type) {
      case 'time':
        return date.toLocaleTimeString();
      case 'datetime':
        return date.toLocaleString();
      default:
        return date.toLocaleDateString();
    }
  }, [value, field.type]);

  return (
    <FieldWrapper
      label={field.label}
      description={field.description}
      helpText={field.helpText}
      required={field.required}
      error={error}
      testID={testID}
    >
      <TouchableOpacity
        style={[
          styles.dateInput,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        accessibilityLabel={field.ariaLabel || field.label}
      >
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {displayValue || field.placeholder || 'Select date'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={field.minDate ? new Date(field.minDate) : undefined}
          maximumDate={field.maxDate ? new Date(field.maxDate) : undefined}
        />
      )}
    </FieldWrapper>
  );
};

// ============================================================================
// SelectField Component
// ============================================================================

interface SelectFieldProps {
  field: SelectFormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => {
  const isRadio = field.type === 'radio';

  return (
    <FieldWrapper
      label={field.label}
      description={field.description}
      helpText={field.helpText}
      required={field.required}
      error={error}
      testID={testID}
    >
      {isRadio ? (
        <View style={styles.radioGroup}>
          {field.options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.radioOption,
                value === option.value && styles.radioOptionSelected,
                option.disabled && styles.optionDisabled,
              ]}
              onPress={() => !disabled && !option.disabled && onChange(option.value)}
              disabled={disabled || option.disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: value === option.value }}
            >
              <View
                style={[
                  styles.radioCircle,
                  value === option.value && styles.radioCircleSelected,
                ]}
              >
                {value === option.value && <View style={styles.radioInner} />}
              </View>
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    value === option.value && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {option.helpText && (
                  <Text style={styles.optionHelpText}>{option.helpText}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.selectContainer}>
          <ScrollView style={styles.selectOptions} nestedScrollEnabled>
            {field.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectOption,
                  value === option.value && styles.selectOptionSelected,
                  option.disabled && styles.optionDisabled,
                ]}
                onPress={() => !disabled && !option.disabled && onChange(option.value)}
                disabled={disabled || option.disabled}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    value === option.value && styles.selectOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {value === option.value && (
                  <Ionicons name="checkmark" size={20} color="#8B5CF6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </FieldWrapper>
  );
};

// ============================================================================
// MultiSelectField Component
// ============================================================================

interface MultiSelectFieldProps {
  field: SelectFormField;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  field,
  value = [],
  onChange,
  error,
  disabled,
  testID,
}) => {
  const handleToggle = useCallback(
    (optionValue: string) => {
      const newValue = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValue);
    },
    [value, onChange]
  );

  return (
    <FieldWrapper
      label={field.label}
      description={field.description}
      helpText={field.helpText}
      required={field.required}
      error={error}
      testID={testID}
    >
      <View style={styles.checkboxGroup}>
        {field.options.map((option) => {
          const isChecked = value.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.checkboxOption,
                isChecked && styles.checkboxOptionSelected,
                option.disabled && styles.optionDisabled,
              ]}
              onPress={() => !disabled && !option.disabled && handleToggle(option.value)}
              disabled={disabled || option.disabled}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  isChecked && styles.checkboxBoxSelected,
                ]}
              >
                {isChecked && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  isChecked && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </FieldWrapper>
  );
};

// ============================================================================
// TextareaField Component
// ============================================================================

interface TextareaFieldProps {
  field: TextareaFormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => (
  <FieldWrapper
    label={field.label}
    description={field.description}
    helpText={field.helpText}
    required={field.required}
    error={error}
    testID={testID}
  >
    <TextInput
      style={[
        styles.textInput,
        styles.textareaInput,
        { minHeight: (field.rows || 4) * 24 },
        error && styles.inputError,
        disabled && styles.inputDisabled,
      ]}
      value={value || ''}
      onChangeText={onChange}
      placeholder={field.placeholder}
      placeholderTextColor="#9CA3AF"
      multiline
      numberOfLines={field.rows || 4}
      maxLength={field.maxLength}
      editable={!disabled}
      textAlignVertical="top"
      accessibilityLabel={field.ariaLabel || field.label}
    />
    {field.showCharCount && field.maxLength && (
      <Text style={styles.charCount}>
        {(value || '').length}/{field.maxLength}
      </Text>
    )}
  </FieldWrapper>
);

// ============================================================================
// CheckboxField Component
// ============================================================================

interface CheckboxFieldProps {
  field: CheckboxFormField;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => (
  <View style={styles.fieldWrapper} testID={testID}>
    <TouchableOpacity
      style={[styles.checkboxRow, error && styles.checkboxRowError]}
      onPress={() => !disabled && onChange(!value)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!value }}
    >
      <View style={[styles.checkboxBox, value && styles.checkboxBoxSelected]}>
        {value && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      <Text style={styles.checkboxLabel}>
        {field.checkboxLabel || field.label}
        {field.required && <Text style={styles.required}> *</Text>}
      </Text>
    </TouchableOpacity>
    {error && (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={14} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

// ============================================================================
// YesNoField Component
// ============================================================================

interface YesNoFieldProps {
  field: YesNoFormField;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const YesNoField: React.FC<YesNoFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => (
  <FieldWrapper
    label={field.label}
    description={field.description}
    helpText={field.helpText}
    required={field.required}
    error={error}
    testID={testID}
  >
    <View style={styles.yesNoContainer}>
      <TouchableOpacity
        style={[
          styles.yesNoButton,
          value === true && styles.yesNoButtonYes,
          disabled && styles.optionDisabled,
        ]}
        onPress={() => !disabled && onChange(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected: value === true }}
      >
        <Ionicons
          name={value === true ? 'checkmark-circle' : 'checkmark-circle-outline'}
          size={24}
          color={value === true ? '#FFFFFF' : '#22C55E'}
        />
        <Text
          style={[
            styles.yesNoText,
            value === true && styles.yesNoTextSelected,
          ]}
        >
          {field.yesLabel || 'Yes'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.yesNoButton,
          value === false && styles.yesNoButtonNo,
          disabled && styles.optionDisabled,
        ]}
        onPress={() => !disabled && onChange(false)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected: value === false }}
      >
        <Ionicons
          name={value === false ? 'close-circle' : 'close-circle-outline'}
          size={24}
          color={value === false ? '#FFFFFF' : '#EF4444'}
        />
        <Text
          style={[
            styles.yesNoText,
            value === false && styles.yesNoTextSelected,
          ]}
        >
          {field.noLabel || 'No'}
        </Text>
      </TouchableOpacity>
    </View>
  </FieldWrapper>
);

// ============================================================================
// ConsentField Component
// ============================================================================

interface ConsentFieldProps {
  field: ConsentFormField;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const ConsentField: React.FC<ConsentFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View style={styles.fieldWrapper} testID={testID}>
      <View style={[styles.consentContainer, error && styles.consentContainerError]}>
        <TouchableOpacity
          style={styles.consentCheckbox}
          onPress={() => !disabled && onChange(!value)}
          disabled={disabled}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!value }}
        >
          <View style={[styles.checkboxBox, value && styles.checkboxBoxSelected]}>
            {value && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>
        <View style={styles.consentContent}>
          <Text style={styles.consentText}>
            {field.consentText}
            {field.required && <Text style={styles.required}> *</Text>}
          </Text>
          {field.showDetailLink && field.detailedText && (
            <TouchableOpacity onPress={() => setShowDetails(!showDetails)}>
              <Text style={styles.detailLink}>
                {field.detailLinkLabel || 'View details'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {showDetails && field.detailedText && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>{field.detailedText}</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// SliderField Component
// ============================================================================

interface SliderFieldProps {
  field: SliderFormField;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const SliderField: React.FC<SliderFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  testID,
}) => {
  const { sliderOptions } = field;
  const percentage =
    ((value - sliderOptions.min) / (sliderOptions.max - sliderOptions.min)) * 100;

  return (
    <FieldWrapper
      label={field.label}
      description={field.description}
      helpText={field.helpText}
      required={field.required}
      error={error}
      testID={testID}
    >
      <View style={styles.sliderContainer}>
        {sliderOptions.showLabels && (
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>{sliderOptions.leftLabel || sliderOptions.min}</Text>
            <Text style={styles.sliderLabel}>{sliderOptions.rightLabel || sliderOptions.max}</Text>
          </View>
        )}
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: percentage + '%' }]} />
          <View style={[styles.sliderThumb, { left: percentage + '%' }]} />
        </View>
        {sliderOptions.showValue && (
          <Text style={styles.sliderValue}>{value}</Text>
        )}
      </View>
    </FieldWrapper>
  );
};

// ============================================================================
// RatingField Component
// ============================================================================

interface RatingFieldProps {
  field: RatingFormField;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
  testID?: string;
}

const RatingField: React.FC<RatingFieldProps> = ({
  field,
  value = 0,
  onChange,
  error,
  disabled,
  testID,
}) => {
  const { ratingOptions } = field;
  const iconName = useMemo(() => {
    switch (ratingOptions.icon) {
      case 'heart':
        return 'heart';
      case 'circle':
        return 'ellipse';
      default:
        return 'star';
    }
  }, [ratingOptions.icon]);

  return (
    <FieldWrapper
      label={field.label}
      description={field.description}
      helpText={field.helpText}
      required={field.required}
      error={error}
      testID={testID}
    >
      <View style={styles.ratingContainer}>
        {Array.from({ length: ratingOptions.maxRating }, (_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => !disabled && onChange(i + 1)}
            disabled={disabled}
            style={styles.ratingIcon}
            accessibilityRole="button"
            accessibilityLabel={'Rate ' + (i + 1) + ' out of ' + ratingOptions.maxRating}
          >
            <Ionicons
              name={(i < value ? iconName : iconName + '-outline') as any}
              size={32}
              color={i < value ? '#F59E0B' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </FieldWrapper>
  );
};

// ============================================================================
// Display-only Fields
// ============================================================================

interface HeaderFieldProps {
  field: HeaderFormField;
  testID?: string;
}

const HeaderField: React.FC<HeaderFieldProps> = ({ field, testID }) => {
  const fontSize = useMemo(() => {
    switch (field.level) {
      case 1:
        return 24;
      case 2:
        return 20;
      case 3:
        return 18;
      case 4:
        return 16;
      case 5:
        return 14;
      case 6:
        return 12;
      default:
        return 20;
    }
  }, [field.level]);

  return (
    <View style={styles.headerField} testID={testID}>
      <Text style={[styles.headerText, { fontSize }]}>{field.label}</Text>
      {field.description && (
        <Text style={styles.headerDescription}>{field.description}</Text>
      )}
    </View>
  );
};

interface ParagraphFieldProps {
  field: ParagraphFormField;
  testID?: string;
}

const ParagraphField: React.FC<ParagraphFieldProps> = ({ field, testID }) => (
  <View style={styles.paragraphField} testID={testID}>
    <Text style={styles.paragraphText}>{field.content}</Text>
  </View>
);

const DividerField: React.FC<{ testID?: string }> = ({ testID }) => (
  <View style={styles.dividerField} testID={testID}>
    <View style={styles.divider} />
  </View>
);

const SpacerField: React.FC<{ height?: number; testID?: string }> = ({
  height = 16,
  testID,
}) => <View style={{ height }} testID={testID} />;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  required: {
    color: '#EF4444',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInput: {
    flex: 1,
    textAlign: 'center',
  },
  inputAffix: {
    fontSize: 16,
    color: '#6B7280',
    paddingHorizontal: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  textareaInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  radioGroup: {
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  radioOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#8B5CF6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    color: '#4B5563',
  },
  optionLabelSelected: {
    color: '#7C3AED',
    fontWeight: '500',
  },
  optionHelpText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
  },
  selectOptions: {
    padding: 4,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  selectOptionSelected: {
    backgroundColor: '#F3E8FF',
  },
  selectOptionText: {
    fontSize: 15,
    color: '#4B5563',
  },
  selectOptionTextSelected: {
    color: '#7C3AED',
    fontWeight: '500',
  },
  checkboxGroup: {
    gap: 8,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  checkboxRowError: {
    backgroundColor: '#FEF2F2',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  yesNoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  yesNoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  yesNoButtonYes: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  yesNoButtonNo: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  yesNoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  yesNoTextSelected: {
    color: '#FFFFFF',
  },
  consentContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  consentContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  consentCheckbox: {
    marginRight: 12,
  },
  consentContent: {
    flex: 1,
  },
  consentText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  detailLink: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginTop: 8,
  },
  detailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  detailsText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  sliderContainer: {
    paddingVertical: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderValue: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
    marginTop: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ratingIcon: {
    padding: 4,
  },
  headerField: {
    marginVertical: 16,
  },
  headerText: {
    fontWeight: '700',
    color: '#1F2937',
  },
  headerDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  paragraphField: {
    marginVertical: 8,
  },
  paragraphText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  dividerField: {
    marginVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  unsupportedField: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    marginVertical: 8,
  },
  unsupportedText: {
    fontSize: 14,
    color: '#92400E',
  },
});

export default FormField;
