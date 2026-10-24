import { getBookingProvider } from "@/lib/booking/provider";
import { weekStartIst } from "@/lib/booking/slots";
import { apiError } from "@/lib/security/guards";

const services = new Set(["mba-admissions", "consulting-career-moves", "resume-linkedin"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const service = url.searchParams.get("service") ?? "";
  if (!services.has(service)) return apiError(400, "validation_failed", "Choose a service.", { fields: { service: "Choose a service." } });

  const requested = url.searchParams.get("weekStart");
  const thisWeek = weekStartIst(new Date());
  const weekStart = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && requested >= thisWeek ? weekStartIst(new Date(`${requested}T12:00:00+05:30`)) : thisWeek;

  const provider = getBookingProvider();
  const days = await provider.getSlots({ service, weekStart, tz: "Asia/Kolkata" });
  return Response.json(
    { provider: provider.name, service, timezone: "Asia/Kolkata", weekStart, days },
    { headers: { "cache-control": "no-store" } },
  );
}
