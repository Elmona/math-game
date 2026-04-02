import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // v1: Swedish only. To add English or Finnish, detect locale from request here.
  const locale = "sv";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
