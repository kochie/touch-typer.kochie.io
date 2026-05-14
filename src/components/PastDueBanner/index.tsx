import { getUserAndSubscription } from "@/lib/get-user-and-subscription";
import { Container } from "@/components/ui/Container";
import { DismissButton } from "./DismissButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/pro-duotone-svg-icons";

export async function PastDueBanner() {
  const { subscription } = await getUserAndSubscription();
  if (subscription?.status !== "past_due") return null;

  return (
    <div
      data-pastdue-banner
      className="bg-bad text-paper border-b border-bad/40"
      role="alert"
    >
      <Container width="default" className="py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="text-paper/90 size-5"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Your last payment didn&apos;t go through.{" "}
              <a
                href="/account#recover"
                className="underline underline-offset-2 hover:text-paper/80"
              >
                Update your payment method
              </a>{" "}
              to keep Premium active.
            </p>
          </div>
          <DismissButton />
        </div>
      </Container>
    </div>
  );
}
