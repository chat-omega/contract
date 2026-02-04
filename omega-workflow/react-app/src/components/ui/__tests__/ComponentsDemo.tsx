/**
 * Component Library Demo
 * Visual test of all UI components for Phase 1 workflow wizard
 */

import { useState } from 'react';
import {
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
  SearchInput,
  Stepper,
  VerticalStepper,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../index';

export const ComponentsDemo = () => {
  // Select state
  const [selectValue, setSelectValue] = useState('');
  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  // Textarea state
  const [textareaValue, setTextareaValue] = useState('');

  // Checkbox state
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [indeterminateChecked, setIndeterminateChecked] = useState(false);

  // Radio state
  const [radioValue, setRadioValue] = useState('option1');
  const radioOptions = [
    { value: 'option1', label: 'Option 1', description: 'This is the first option' },
    { value: 'option2', label: 'Option 2', description: 'This is the second option' },
    { value: 'option3', label: 'Option 3', description: 'This is the third option' },
  ];

  // Search state
  const [searchValue, setSearchValue] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { label: 'Basic Info', description: 'Workflow details' },
    { label: 'Triggers', description: 'When to start' },
    { label: 'Actions', description: 'What to do' },
    { label: 'Conditions', description: 'Rules to apply' },
    { label: 'Review', description: 'Final check' },
  ];

  const handleSearch = (value: string) => {
    console.log('Searching for:', value);
    setSearchLoading(true);
    setTimeout(() => setSearchLoading(false), 1000);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Workflow Wizard UI Component Library
      </h1>

      {/* Stepper Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Stepper (Horizontal)</CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vertical Stepper Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Vertical Stepper</CardTitle>
        </CardHeader>
        <CardContent>
          <VerticalStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </CardContent>
      </Card>

      {/* Select Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Select Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Choose an option"
            options={selectOptions}
            value={selectValue}
            onChange={setSelectValue}
            placeholder="Select an option"
            helperText="This is a helper text"
          />
          <Select
            label="With error"
            options={selectOptions}
            value={selectValue}
            onChange={setSelectValue}
            error="This field is required"
          />
          <Select
            label="Disabled"
            options={selectOptions}
            value={selectValue}
            onChange={setSelectValue}
            disabled
          />
        </CardContent>
      </Card>

      {/* Textarea Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Textarea Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Description"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder="Enter a description..."
            helperText="Provide a detailed description"
            rows={4}
          />
          <Textarea
            label="With character count"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            placeholder="Type something..."
            showCharCount
            maxLength={200}
            rows={3}
          />
          <Textarea
            label="With error"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            error="This field is required"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Checkbox Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Checkbox Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checkbox
            label="Simple checkbox"
            checked={checkboxChecked}
            onChange={(e) => setCheckboxChecked(e.target.checked)}
          />
          <Checkbox
            label="With description"
            description="This is a helpful description explaining what this checkbox does"
            checked={checkboxChecked}
            onChange={(e) => setCheckboxChecked(e.target.checked)}
          />
          <Checkbox
            label="Indeterminate state"
            description="Represents a partially selected state"
            checked={indeterminateChecked}
            indeterminate={true}
            onChange={(e) => setIndeterminateChecked(e.target.checked)}
          />
          <Checkbox
            label="Disabled"
            checked={false}
            disabled
          />
        </CardContent>
      </Card>

      {/* Radio Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Radio Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            label="Choose an option"
            options={radioOptions}
            value={radioValue}
            onChange={setRadioValue}
            helperText="Select the option that best fits your needs"
          />
          <RadioGroup
            label="Horizontal layout"
            options={radioOptions}
            value={radioValue}
            onChange={setRadioValue}
            orientation="horizontal"
          />
        </CardContent>
      </Card>

      {/* SearchInput Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Search Input Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            label="Search"
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            placeholder="Search for something..."
            helperText="Results are debounced by 300ms"
          />
          <SearchInput
            label="With loading state"
            value={searchValue}
            onChange={setSearchValue}
            isLoading={searchLoading}
            placeholder="Search..."
          />
          <SearchInput
            label="Without clear button"
            value={searchValue}
            onChange={setSearchValue}
            showClearButton={false}
            placeholder="Type to search..."
          />
        </CardContent>
      </Card>

      {/* Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Select value:</strong> {selectValue || 'none'}</p>
            <p><strong>Textarea value:</strong> {textareaValue || 'empty'}</p>
            <p><strong>Checkbox:</strong> {checkboxChecked ? 'checked' : 'unchecked'}</p>
            <p><strong>Radio value:</strong> {radioValue}</p>
            <p><strong>Search value:</strong> {searchValue || 'empty'}</p>
            <p><strong>Current step:</strong> {currentStep} - {steps[currentStep - 1].label}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentsDemo;
