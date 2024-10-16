import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

// pages
import { ClaimedAsset, EditAsset, Error, Home } from "@pages/index.js";
import { Loading } from "./components";

// context
import { GlobalDispatchContext } from "@/context/GlobalContext";
import {
  InteractiveParams,
  SET_ERROR,
  SET_HAS_SETUP_BACKEND,
  SET_INTERACTIVE_PARAMS,
  SET_GAME_STATE,
} from "@/context/types";

// utils
import { backendAPI, setupBackendAPI } from "./utils/backendAPI";
import { getThemeData, getThemeName } from "./utils";

const App = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useContext(GlobalDispatchContext);

  const { hasHomePage } = getThemeData();
  const themeName = getThemeName();

  const interactiveParams: InteractiveParams = useMemo(() => {
    return {
      assetId: searchParams.get("assetId") || "",
      displayName: searchParams.get("displayName") || "",
      identityId: searchParams.get("identityId") || "",
      interactiveNonce: searchParams.get("interactiveNonce") || "",
      interactivePublicKey: searchParams.get("interactivePublicKey") || "",
      profileId: searchParams.get("profileId") || "",
      ownerProfileId: searchParams.get("ownerProfileId") || "",
      sceneDropId: searchParams.get("sceneDropId") || "",
      themeName,
      uniqueName: searchParams.get("uniqueName") || "",
      urlSlug: searchParams.get("urlSlug") || "",
      username: searchParams.get("username") || "",
      visitorId: searchParams.get("visitorId") || "",
    };
  }, [searchParams]);

  const setInteractiveParams = useCallback(
    ({
      assetId,
      displayName,
      identityId,
      interactiveNonce,
      interactivePublicKey,
      profileId,
      ownerProfileId,
      sceneDropId,
      themeName,
      uniqueName,
      urlSlug,
      username,
      visitorId,
    }: InteractiveParams) => {
      const isInteractiveIframe = visitorId && interactiveNonce && interactivePublicKey && assetId ? true : false;
      dispatch!({
        type: SET_INTERACTIVE_PARAMS,
        payload: {
          interactiveParams: {
            assetId,
            displayName,
            identityId,
            interactiveNonce,
            interactivePublicKey,
            isInteractiveIframe,
            profileId,
            ownerProfileId,
            sceneDropId,
            themeName,
            uniqueName,
            urlSlug,
            username,
            visitorId,
          },
        },
      });
    },
    [dispatch],
  );

  const setupBackend = () => {
    setupBackendAPI(interactiveParams)
      .then(() =>
        dispatch!({
          type: SET_HAS_SETUP_BACKEND,
          payload: { hasSetupBackend: true },
        }),
      )
      .catch(() => navigate("*"))
      .finally(() => setHasInitBackendAPI(true));
  };

  const getWorldAndVisitorData = () => {
    backendAPI
      .get("/world-and-visitor")
      .then((response) => {
        setIsLoading(false);
        dispatch!({
          type: SET_GAME_STATE,
          payload: { ...response.data, error: "" },
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch!({
          type: SET_ERROR,
          payload: { error: "There was an error while getting world and visitor details" },
        });
      });
  };

  useEffect(() => {
    if (interactiveParams.assetId) {
      setInteractiveParams({
        ...interactiveParams,
      });
    }
  }, [interactiveParams, setInteractiveParams]);

  useEffect(() => {
    if (!hasInitBackendAPI) setupBackend();
    else getWorldAndVisitorData();
  }, [hasInitBackendAPI, interactiveParams]);

  if (!themeName || isLoading) return <Loading />;

  return (
    <Routes>
      <Route path={`/${themeName}`} element={hasHomePage ? <Home /> : <EditAsset />} />
      <Route path={`/${themeName}/edit`} element={<EditAsset />} />
      <Route path={`/${themeName}/claimed`} element={<ClaimedAsset />} />

      <Route path="*" element={<Error />} />
    </Routes>
  );
};

export default App;
