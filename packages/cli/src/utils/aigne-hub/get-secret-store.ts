import createSecretStore from "@aigne/secrets";
import { AIGNE_ENV_FILE } from "./constants.js";

const getSecretStore = () => {
  return createSecretStore({ filepath: AIGNE_ENV_FILE, secretStoreKey: "aigne-hub-keyring" });
};

export default getSecretStore;
