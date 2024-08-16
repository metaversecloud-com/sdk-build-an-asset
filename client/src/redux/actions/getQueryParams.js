import { getThemeName } from "../../themeData2.js";

export const getQueryParams = () => {
  const queryParameters = new URLSearchParams(window.location.search);
  const visitorId = queryParameters.get("visitorId");
  const interactiveNonce = queryParameters.get("interactiveNonce");
  const assetId = queryParameters.get("assetId");
  const interactivePublicKey = queryParameters.get("interactivePublicKey");
  const urlSlug = queryParameters.get("urlSlug");
  const uniqueName = queryParameters.get("uniqueName");
  const profileId = queryParameters.get("profileId");
  const ownerProfileId = queryParameters.get("ownerProfileId");
  const username = queryParameters.get("username");
  const displayName = queryParameters.get("displayName");
  const identityId = queryParameters.get("identityId");
  const themeName = getThemeName();

  return `visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}&uniqueName=${uniqueName}&profileId=${profileId}&ownerProfileId=${ownerProfileId}&username=${username}&displayName=${displayName}&identityId=${identityId}&themeName=${themeName}`;
};
