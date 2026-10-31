"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_EMAIL = "demo@nodebase.dev";
const DEMO_PASSWORD = "demo123456";

export function LoginForm() {
  const router = useRouter();
  const [demoCopied, setDemoCopied] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/workflows",
      },
      {
        onSuccess: () => {
          router.push("/workflows");
        },
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            router.push(
              `/verify-email?email=${encodeURIComponent(values.email)}`,
            );
            return;
          }
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const signInGithub = async () =>
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: "/workflows",
      },
      {
        onSuccess: () => {
          router.push("/workflows");
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );
  const signInGoogle = async () =>
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/workflows",
      },
      {
        onSuccess: () => {
          router.push("/workflows");
        },
        onError: () => {
          toast.error("Something went wrong");
        },
      },
    );

  const fillDemoCredentials = async () => {
    form.setValue("email", DEMO_EMAIL, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("password", DEMO_PASSWORD, {
      shouldValidate: true,
      shouldDirty: true,
    });

    try {
      await navigator.clipboard.writeText(
        `Email: ${DEMO_EMAIL}\nPassword: ${DEMO_PASSWORD}`,
      );
    } catch {
      // clipboard may be unavailable; the fields are still filled
    }

    setDemoCopied(true);
    toast.success("Demo credentials copied and filled in");
    setTimeout(() => setDemoCopied(false), 2000);
  };

  const isPending = form.formState.isSubmitting;

  return (
    <Card className="border-border/50 shadow-xl shadow-primary/5 bg-card/90 backdrop-blur-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4 rounded-lg border border-dashed border-border/70 bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium text-foreground">Demo account</p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {DEMO_EMAIL}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {DEMO_PASSWORD}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={fillDemoCredentials}
              disabled={isPending}
            >
              {demoCopied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
              {demoCopied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={signInGithub}
            variant="outline"
            className="w-full h-10 gap-2"
            type="button"
            disabled={isPending}
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={18}
              height={18}
              className="dark:invert"
            />
            Continue with GitHub
          </Button>
          <Button
            onClick={signInGoogle}
            variant="outline"
            className="w-full h-10 gap-2"
            type="button"
            disabled={isPending}
          >
            <Image src="/google.svg" alt="Google" width={18} height={18} />
            Continue with Google
          </Button>
        </div>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="#"
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-10" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
