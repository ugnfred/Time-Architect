export const detectTimezone = async () => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const geo = await fetch("https://ipapi.co/json/");
  const data = await geo.json();

  return {
    timezone: tz,
    city: data.city,
    country: data.country_name
  };
};
