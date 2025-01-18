import { forgotPasswordAction } from "@/app/actions";
import type { Message } from "@/components/form-message";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className=" w-6/12 flex flex-col border border-gray-300 rounded-lg p-6">
        <div>
          <h1 className="text-2xl font-medium">Mot de passe oublé</h1>
          <p className="text-sm text-secondary-foreground">
            Vous avez déjà un compte?{" "}
            <Link className="text-primary underline" href="/sign-in">
              Connectez-vous
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <SubmitButton formAction={forgotPasswordAction}>
            Reinitialiser le mot de passe
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
