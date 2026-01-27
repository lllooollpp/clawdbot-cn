import {
  discoverOllamaModels,
  discoverVolcengineModels,
} from "../../agents/models-config.providers.js";
import { discoverVeniceModels } from "../../agents/venice-models.js";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateModelsDiscoverParams,
  validateModelsListParams,
} from "../protocol/index.js";
import type { GatewayRequestHandlers } from "./types.js";

export const modelsHandlers: GatewayRequestHandlers = {
  "models.list": async ({ params, respond, context }) => {
    if (!validateModelsListParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid models.list params: ${formatValidationErrors(validateModelsListParams.errors)}`,
        ),
      );
      return;
    }
    try {
      const models = await context.loadGatewayModelCatalog();
      respond(true, { models }, undefined);
    } catch (err) {
      respond(false, undefined, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
    }
  },

  "models.discover": async ({ params, respond }) => {
    if (!validateModelsDiscoverParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid models.discover params: ${formatValidationErrors(
            validateModelsDiscoverParams.errors,
          )}`,
        ),
      );
      return;
    }

    try {
      const { provider, apiKey, baseUrl } = params;
      if (provider === "volcengine") {
        const models = await discoverVolcengineModels({ apiKey, baseUrl });
        respond(true, { models }, undefined);
      } else if (provider === "ollama") {
        // Ollama doesn't strictly need apiKey for local, but protocol allows it
        const models = await discoverOllamaModels();
        respond(true, { models }, undefined);
      } else if (provider === "venice") {
        const models = await discoverVeniceModels();
        respond(true, { models }, undefined);
      } else {
        respond(
          false,
          undefined,
          errorShape(
            ErrorCodes.INVALID_REQUEST,
            `discovery not supported for provider: ${String(provider)}`,
          ),
        );
      }
    } catch (err) {
      respond(false, undefined, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
    }
  },
};
