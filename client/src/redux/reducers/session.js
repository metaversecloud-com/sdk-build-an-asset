/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  visitor: null,
  droppedAsset: null,
  isAssetSpawnedInWorld: null,
  spawnedAsset: null,
  spawnSuccess: true,
  error: null,
  isAssetAlreadyTaken: false,
};

const reducers = {
  setVisitor: (state, action) => {
    state.visitor = action.payload;
  },
  setDroppedAsset: (state, action) => {
    state.droppedAsset = action.payload;
  },
  setDroppedAssetAndVisitor: (state, action) => {
    state.droppedAsset = action.payload.droppedAsset;
    state.visitor = action.payload.visitor;
    state.isAssetSpawnedInWorld = action.payload.isAssetSpawnedInWorld;
    state.spawnedAsset = action.payload.spawnedAsset;
    state.userAsset = action.payload.userAsset;
    state.world = action.payload.world;
  },
  setInPrivateZone: (state, action) => {
    state.inPrivateZone = action.payload;
  },
  setIsAssetSpawnedInWorld: (state, action) => {
    state.isAssetSpawnedInWorld = action.payload;
  },
  setSpawnSuccess: (state, action) => {
    state.spawnSuccess = action.payload.spawnSuccess;
    state.isAssetSpawnedInWorld = action.payload.isAssetSpawnedInWorld;
    state.spawnedAsset = action.payload.spawnedAsset;
    state.isAssetAlreadyTaken = action.payload.isAssetAlreadyTaken;
    state.world = action.payload.world;
  },
  setError: (state, action) => {
    state.error = action.payload;
  },
};

export const session = createSlice({
  name: "session",
  initialState,
  reducers,
});
