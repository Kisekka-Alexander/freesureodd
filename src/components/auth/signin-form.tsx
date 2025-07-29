"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const signInSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

interface SignInFormValues {
  email: string;
  password: string;
}

export function SignInForm() {
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (values: SignInFormValues) => {
    const result = await login(values.email, values.password);

    if (result.success) {
      toast.success("Signed in successfully!");
      router.push("/");
    } else {
      toast.error(result.error || "Sign in failed");
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={signInSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Field
                as={Input}
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-sm text-destructive"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <Field
                as={Input}
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-sm text-destructive"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
