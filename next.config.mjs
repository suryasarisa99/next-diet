/** @type {import('next').NextConfig} */

import pwa from "next-pwa";

const withPWA = pwa({
  dest: "public",
  reloadOnOnline: false,
});
const nextConfig = {
  reactStrictMode: false,
};

// export default withPWA(nextConfig);
export default nextConfig;
