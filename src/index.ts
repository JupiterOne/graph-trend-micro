import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import validateInvocation from './validateInvocation';

import buildAdminRoleRelationships from './steps/build-administrator-role-relationships';
import buildComputerGroupRelationships from './steps/build-computer-group-relationships';
import fetchAdministrators from './steps/fetch-administrators';
import fetchAdministratorRoles from './steps/fetch-administrator-roles';
import fetchApiKeys from './steps/fetch-api-keys';
import fetchSensors from './steps/fetch-sensors';
import fetchComputerGroups from './steps/fetch-computer-groups';
import { TrendMicroIntegrationConfig } from './types';

export const invocationConfig: IntegrationInvocationConfig<TrendMicroIntegrationConfig> =
  {
    instanceConfigFields: {
      apiKey: {
        type: 'string',
        mask: true,
      },
    },
    validateInvocation,
    integrationSteps: [
      buildAdminRoleRelationships,
      buildComputerGroupRelationships,
      fetchAdministrators,
      fetchAdministratorRoles,
      fetchApiKeys,
      fetchSensors,
      fetchComputerGroups,
    ],
  };
