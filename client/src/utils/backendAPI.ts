import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { InteractiveParams } from "../context/types";

let backendAPI: AxiosInstance = axios;

const setupBackendAPI = async (interactiveParams: InteractiveParams) => {
  backendAPI = axios.create({
    baseURL: `/api`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Only do this if have interactive nonce.
  if (interactiveParams.assetId) {
    backendAPI.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (!config?.params) config.params = {};
      config.params = { ...config.params };
      config.params["assetId"] = interactiveParams.assetId;
      config.params["displayName"] = interactiveParams.displayName;
      config.params["identityId"] = interactiveParams.identityId;
      config.params["interactiveNonce"] = interactiveParams.interactiveNonce;
      config.params["interactivePublicKey"] = interactiveParams.interactivePublicKey;
      config.params["ownerProfileId"] = interactiveParams.ownerProfileId;
      config.params["profileId"] = interactiveParams.profileId;
      config.params["sceneDropId"] = interactiveParams.sceneDropId;
      config.params["themeName"] = interactiveParams.themeName;
      config.params["uniqueName"] = interactiveParams.uniqueName;
      config.params["urlSlug"] = interactiveParams.urlSlug;
      config.params["username"] = interactiveParams.username;
      config.params["visitorId"] = interactiveParams.visitorId;
      return config;
    });
  }
};

export { backendAPI, setupBackendAPI };
