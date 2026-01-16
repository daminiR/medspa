'use client';

/**
 * FormField Component (Web)
 * Reusable form field components for the web patient portal.
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { FormField as FormFieldType } from '@medical-spa/types';

export interface FormFieldProps {
  field: FormFieldType;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  prefillValue?: unknown;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  prefillValue,
}) => {
  const isDisabled = disabled || field.disabled;
  const actualValue = value ?? prefillValue ?? field.defaultValue;

  const baseInputClass = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
  } ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;

  const renderLabel = () => {
    if (!field.label) return null;
    return (
      <label className="block text-sm font-semibold text-gray-800 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  };

  const renderDescription = () => {
    if (!field.description) return null;
    return <p className="text-sm text-gray-500 mb-2">{field.description}</p>;
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    );
  };

  const renderHelpText = () => {
    if (!field.helpText || error) return null;
    return <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>;
  };

  // Text/Email/Phone input
  if (['text', 'email', 'phone', 'ssn'].includes(field.type)) {
    const inputType = field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text';
    return (
      <div className="mb-5">
        {renderLabel()}
        {renderDescription()}
        <input
          type={inputType}
          value={(actualValue as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={isDisabled}
          className={baseInputClass}
        />
        {renderError()}
        {renderHelpText()}
      </div>
    );
  }

  // Number input
  if (field.type === 'number') {
    return (
      <div className="mb-5">
        {renderLabel()}
        {renderDescription()}
        <input
          type="number"
          value={(actualValue as number) || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={field.placeholder}
          disabled={isDisabled}
          className={baseInputClass}
        />
        {renderError()}
        {renderHelpText()}
      </div>
    );
  }

  // Date input
  if (field.type === 'date') {
    const dateValue = actualValue ? new Date(actualValue as string).toISOString().split('T')[0] : '';
    return (
      <div className="mb-5">
        {renderLabel()}
        {renderDescription()}
        <input
          type="date"
          value={dateValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          className={baseInputClass}
        />
        {renderError()}
        {renderHelpText()}
      </div>
    );
  }

  // Textarea
  if (field.type === 'textarea' || field.type === 'multiline') {
    return (
      <div className="mb-5">
        {renderLabel()}
        {renderDescription()}
        <textarea
          value={(actualValue as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={isDisabled}
          rows={4}
          className={`${baseInputClass} resize-none`}
        />
        {renderError()}
        {renderHelpText()}
      </div>
    );
  }

  // Select
  if (field.type === 'select' && 'options' in field) {
    return (
      <div className="mb-5">
        {renderLabel()}
        {renderDescription()}
        <select
          value={(actualValue as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          className={baseInputClass}
        >
          <option value="">Select an option...</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {renderError()}
        {renderHelpText()}
      </div>
    );
  }

  // Radio
  if (field.type === 'radio' && 'options' in field) {
    return (
      <div className="mb-5">
        {renderLabel()}
        {renderDescription()}
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                actualValue === opt.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={actualValue === opt.value}
                onChange={() => !opt.disabled && onChange(opt.value)}
                disabled={isDisabled || opt.disabled}
                className="sr-only"
              />
              <span className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                actualValue === opt.value ? 'border-purple-500' : 'border-gray-300'
              }`}>
                {actualValue === opt.value && (
                  <span className="w-3 h-3 bg-purple-500 rounded-full" />
                )}
              </span>
              <span className="text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
        {renderError()}
        {renderHelpText()}
      </div>
    );
  }

  // Checkbox Group
  if ((field.type === 'checkboxGroup' || field.type === 'multiselect') && 'options' in field) {
    const selectedValues = (actualValue as string[]) || [];
    const handleToggle = (optValue: string) => {
      const newValues = selectedValues.includes(optValue)
        ? selectedValues.filter((v) => v !== optValue)
        : [...selectedValues, optValue];
      onChange(newValues);
    };

    return (
      <div className="mb-5">
        {renderLabel()}
        {renderDescription()}
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedValues.includes(opt.value)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(opt.value)}
                onChange={() => handleToggle(opt.value)}
                disabled={isDisabled || opt.disabled}
                className="sr-only"
              />
              <span className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                selectedValues.includes(opt.value)
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300'
              }`}>
                {selectedValues.includes(opt.value) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
        {renderError()}
        {renderHelpText()}
      </div>
    );
  }

  // Checkbox
  if (field.type === 'checkbox') {
    const checkboxField = field as { checkboxLabel?: string };
    return (
      <div className="mb-5">
        <label className="flex items-start p-4 bg-gray-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={!!actualValue}
            onChange={(e) => onChange(e.target.checked)}
            disabled={isDisabled}
            className="sr-only"
          />
          <span className={`w-5 h-5 border-2 rounded mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center ${
            actualValue ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
          }`}>
            {actualValue && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-gray-700">
            {checkboxField.checkboxLabel || field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
        {renderError()}
      </div>
    );
  }

  // Yes/No
  if (field.type === 'yesNo') {
    const yesNoField = field as { yesLabel?: string; noLabel?: string };
    return (
      <div className="mb-5">
        {renderLabel()}
        {renderDescription()}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange(true)}
            disabled={isDisabled}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
              actualValue === true
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {yesNoField.yesLabel || 'Yes'}
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            disabled={isDisabled}
            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
              actualValue === false
                ? 'border-red-500 bg-red-500 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {yesNoField.noLabel || 'No'}
          </button>
        </div>
        {renderError()}
        {renderHelpText()}
      </div>
    );
  }

  // Consent
  if (field.type === 'consent') {
    const consentField = field as { consentText: string; showDetailLink?: boolean; detailLinkLabel?: string };
    return (
      <div className="mb-5">
        <label className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
        }`}>
          <input
            type="checkbox"
            checked={!!actualValue}
            onChange={(e) => onChange(e.target.checked)}
            disabled={isDisabled}
            className="sr-only"
          />
          <span className={`w-5 h-5 border-2 rounded mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center ${
            actualValue ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
          }`}>
            {actualValue && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="text-gray-700 text-sm leading-relaxed">
            {consentField.consentText}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
        {renderError()}
      </div>
    );
  }

  // Header
  if (field.type === 'header') {
    const headerField = field as { level?: number };
    const level = headerField.level || 2;
    const sizeClass = level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg';
    return (
      <div className="my-6">
        <h2 className={`font-bold text-gray-900 ${sizeClass}`}>{field.label}</h2>
        {field.description && <p className="text-gray-600 mt-1">{field.description}</p>}
      </div>
    );
  }

  // Paragraph
  if (field.type === 'paragraph') {
    const paragraphField = field as { content: string };
    return (
      <div className="my-4 text-gray-600 leading-relaxed whitespace-pre-line">
        {paragraphField.content}
      </div>
    );
  }

  // Divider
  if (field.type === 'divider') {
    return <hr className="my-6 border-gray-200" />;
  }

  // Spacer
  if (field.type === 'spacer') {
    const spacerField = field as { height?: number };
    return <div style={{ height: spacerField.height || 16 }} />;
  }

  // Unsupported field type
  return (
    <div className="mb-5 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-sm text-yellow-800">Unsupported field type: {field.type}</p>
    </div>
  );
};

export default FormField;
