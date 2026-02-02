const map: Record<string, string> = {
  EST: "America/New_York",
  PST: "America/Los_Angeles",
  IST: "Asia/Kolkata",
  GMT: "Europe/London",
  JST: "Asia/Tokyo"
};

export default function Page({ params }: any) {
  const timezone = map[params.tz.toUpperCase()] || "UTC";

  return (
    <>
      <h1>Current Time in {params.tz}</h1>
      <Clock timezone={timezone} />
    </>
  );
}
