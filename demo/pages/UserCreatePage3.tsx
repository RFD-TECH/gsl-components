import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ArrowRight, UserPlus } from "lucide-react";
import {
  Button,
  Card,
  Dropdown,
  Field,
  FieldControl,
  FieldError,
  FieldLabel,
  Form,
  FormField,
  Input,
  PageSection,
  SectionDescription,
  SectionHeader,
  SectionTitle,
  Stepper,
  Step,
  StepLabel,
} from "@rfdtech/components";
import { demoUserRoles } from "demo/data/demoUsers";

const step1Schema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

const step2Schema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  department: z.string().min(1, "Department is required"),
});

const step3Schema = z.object({
  role: z.string().min(1, "Select a role"),
  status: z.string().min(1, "Select a status"),
});

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type FormValues = z.infer<typeof fullSchema>;

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Pending", label: "Pending" },
  { value: "Inactive", label: "Inactive" },
];

const totalSteps = 4;

function getStepSchemas(step: number) {
  switch (step) {
    case 1:
      return step1Schema;
    case 2:
      return step2Schema;
    case 3:
      return step3Schema;
    default:
      return z.object({});
  }
}

export function UserCreatePage3() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      status: "Active",
    },
  });

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const handleNext = useCallback(async () => {
    const schema = getStepSchemas(step);
    const fields = Object.keys(schema.shape) as (keyof FormValues)[];
    const valid = await form.trigger(fields);
    if (valid) {
      setStep((s) => Math.min(totalSteps, s + 1));
    }
  }, [step, form]);

  const handleSubmit = useCallback(async () => {
    const valid = await form.trigger();
    if (valid) {
      navigate("/users/user-new");
    }
  }, [form, navigate]);

  const isStepValid = useCallback(
    async (s: number) => {
      const schema = getStepSchemas(s);
      const fields = Object.keys(schema.shape) as (keyof FormValues)[];
      return await form.trigger(fields);
    },
    [form],
  );

  const formValues = form.watch();

  const handleStepClick = useCallback(
    async (value: number) => {
      if (value < step) {
        setStep(value);
        return;
      }
      const valid = await isStepValid(step);
      if (valid) {
        setStep(value);
      }
    },
    [step, isStepValid],
  );

  return (
    <>
      <PageSection>
        <SectionHeader>
          <SectionTitle>Create User</SectionTitle>
          <SectionDescription>
            Set up a new member account with role and permissions.
          </SectionDescription>
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back to Dashboard
          </Button>
        </SectionHeader>
      </PageSection>

      <PageSection>
        <Card bordered>
          <div className="create-user-stepper">
            <Stepper
              value={step}
              clickable
              onValueChange={handleStepClick}
            >
              <Step value={1}>
                <StepLabel>Personal Info</StepLabel>
              </Step>
              <Step value={2}>
                <StepLabel>Contact Details</StepLabel>
              </Step>
              <Step value={3}>
                <StepLabel>Role &amp; Permissions</StepLabel>
              </Step>
              <Step value={4}>
                <StepLabel>Review</StepLabel>
              </Step>
            </Stepper>
          </div>

          <div className="create-user-form">
            <Form {...form}>
              {step === 1 && (
                <div className="create-user-form__fields">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <Field invalid={!!fieldState.error}>
                        <FieldLabel>Full name</FieldLabel>
                        <FieldControl>
                          <Input placeholder="Ama Serwaa" {...field} />
                        </FieldControl>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <Field invalid={!!fieldState.error}>
                        <FieldLabel>Email</FieldLabel>
                        <FieldControl>
                          <Input type="email" placeholder="ama@gsl.edu.gh" {...field} />
                        </FieldControl>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="create-user-form__fields">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field, fieldState }) => (
                      <Field invalid={!!fieldState.error}>
                        <FieldLabel>Phone number</FieldLabel>
                        <FieldControl>
                          <Input placeholder="+233 24 123 4567" {...field} />
                        </FieldControl>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field, fieldState }) => (
                      <Field invalid={!!fieldState.error}>
                        <FieldLabel>Department</FieldLabel>
                        <FieldControl>
                          <Input placeholder="e.g. Information Technology" {...field} />
                        </FieldControl>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="create-user-form__fields">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field, fieldState }) => (
                      <Field invalid={!!fieldState.error}>
                        <FieldLabel>Role</FieldLabel>
                        <FieldControl>
                          <Dropdown
                            aria-label="Role"
                            value={field.value || null}
                            onValueChange={(value) => field.onChange(value ?? "")}
                            options={demoUserRoles}
                            placeholder="Select a role"
                          />
                        </FieldControl>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field, fieldState }) => (
                      <Field invalid={!!fieldState.error}>
                        <FieldLabel>Status</FieldLabel>
                        <FieldControl>
                          <Dropdown
                            aria-label="Status"
                            value={field.value || null}
                            onValueChange={(value) => field.onChange(value ?? "")}
                            options={statusOptions}
                            placeholder="Select status"
                          />
                        </FieldControl>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="create-user-form__review">
                  <div className="create-user-form__review-section">
                    <h4 className="create-user-form__review-heading">Personal Info</h4>
                    <div className="create-user-form__review-row">
                      <span className="create-user-form__review-label">Name</span>
                      <span className="create-user-form__review-value">
                        {formValues.name}
                      </span>
                    </div>
                    <div className="create-user-form__review-row">
                      <span className="create-user-form__review-label">Email</span>
                      <span className="create-user-form__review-value">
                        {formValues.email}
                      </span>
                    </div>
                  </div>
                  <div className="create-user-form__review-section">
                    <h4 className="create-user-form__review-heading">Contact Details</h4>
                    <div className="create-user-form__review-row">
                      <span className="create-user-form__review-label">Phone</span>
                      <span className="create-user-form__review-value">
                        {formValues.phone}
                      </span>
                    </div>
                    <div className="create-user-form__review-row">
                      <span className="create-user-form__review-label">Department</span>
                      <span className="create-user-form__review-value">
                        {formValues.department}
                      </span>
                    </div>
                  </div>
                  <div className="create-user-form__review-section">
                    <h4 className="create-user-form__review-heading">Role & Permissions</h4>
                    <div className="create-user-form__review-row">
                      <span className="create-user-form__review-label">Role</span>
                      <span className="create-user-form__review-value">
                        {formValues.role}
                      </span>
                    </div>
                    <div className="create-user-form__review-row">
                      <span className="create-user-form__review-label">Status</span>
                      <span className="create-user-form__review-value">
                        {formValues.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Form>

            <div className="create-user-form__actions">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft size={14} strokeWidth={1.5} />
                Back
              </Button>
              {step < totalSteps ? (
                <Button variant="primary" onClick={handleNext}>
                  Next
                  <ArrowRight size={14} strokeWidth={1.5} />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={form.formState.isSubmitting}
                  loadingLabel="Creating..."
                >
                  <UserPlus size={14} strokeWidth={1.5} />
                  Create User
                </Button>
              )}
            </div>
          </div>
        </Card>
      </PageSection>
    </>
  );
}
