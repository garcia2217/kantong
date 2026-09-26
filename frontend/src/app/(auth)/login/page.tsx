import { redirect } from "next/navigation";

interface LoginRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Sign-in lives on the landing page now. The backend still sends OAuth
// failures here as ?error=..., so carry that through to the panel.
export default async function LoginRedirect({ searchParams }: LoginRedirectProps) {
  const { error } = await searchParams;
  const query = typeof error === "string" ? `?error=${encodeURIComponent(error)}` : "";
  redirect(`/${query}#sign-in`);
}
