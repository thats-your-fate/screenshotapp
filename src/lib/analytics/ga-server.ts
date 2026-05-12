const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.GA_MEASUREMENT_ID || "G-MXNGNR4CRJ";
const apiSecret = process.env.GA_API_SECRET;

export async function trackServerEvent({
  name,
  userId,
  params,
}: {
  name: string;
  userId?: string | null;
  params?: Record<string, unknown>;
}) {
  if (!measurementId || !apiSecret || !userId) return;

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
      measurementId,
    )}&api_secret=${encodeURIComponent(apiSecret)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        client_id: userId,
        events: [
          {
            name,
            params: params ?? {},
          },
        ],
      }),
    },
  ).catch((error) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("[ga][server]", error);
    }
  });
}
