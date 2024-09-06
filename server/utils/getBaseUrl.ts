export function getBaseUrl(host: string) {
  const protocol = process.env.INSTANCE_PROTOCOL;
  let baseUrl;
  let defaultUrlForImageHosting;

  if (host === "localhost") {
    baseUrl = `http://localhost:3001`;
    defaultUrlForImageHosting = "https://basset0-dev-topia.topia-rtsdk.com";
  } else {
    baseUrl = `${protocol}://${host}`;
    defaultUrlForImageHosting = baseUrl;
  }

  return { baseUrl, defaultUrlForImageHosting };
}
