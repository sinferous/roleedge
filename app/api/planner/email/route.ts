import { getStore } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { templates } from "@/lib/email/templates";
import { buildPlan, planToText } from "@/lib/planner";
import { withPublicGuards } from "@/lib/security/guards";
import { plannerEmailSchema } from "@/lib/validation";

export const POST = withPublicGuards(
  { route: "planner-email", schema: plannerEmailSchema, rateLimit: { max: 3, windowSeconds: 600 } },
  async ({ data }) => {
    // The plan is rebuilt from the answers; text from the browser is never trusted or stored.
    const plan = buildPlan(data.answers);
    await getStore().createPlannerResult({
      leadId: null,
      email: data.email,
      answers: data.answers,
      planVersion: data.planVersion,
      consentAt: new Date().toISOString(),
    });
    const sent = await sendEmail(templates.plannerPlan(data.email, planToText(plan)));
    return Response.json({ status: sent.ok ? "sent" : "queued" }, { status: 201 });
  },
);
