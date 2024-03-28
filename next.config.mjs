/** @type {import('next').NextConfig} */

import pwa from "next-pwa";

const withPWA = pwa({
  dest: "public",
  reloadOnOnline: false,
});
const nextConfig = {};

export default withPWA(nextConfig);
