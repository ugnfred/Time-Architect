export const isProUser = () => {
  return localStorage.getItem("PRO_USER") === "true";
};

{!isProUser() && (
  <ins className="adsbygoogle"
    data-ad-client="ca-pub-XXXX"
    data-ad-slot="YYYY"
  />
)}

localStorage.setItem("PRO_USER", "true");
