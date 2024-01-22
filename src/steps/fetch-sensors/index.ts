import {
  Entity,
  IntegrationStep,
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';

import { createDeepSecurityClient, DeepSecurityComputer } from '../../provider';
import { createComputerGroupEntityIdentifier } from '../fetch-computer-groups';
import { TrendMicroIntegrationConfig } from '../../types';

export const STEP_ID = 'fetch-sensors';
export const SENSOR_TYPE = 'trend_micro_sensor';

const step: IntegrationStep<TrendMicroIntegrationConfig> = {
  id: STEP_ID,
  name: 'Fetch Sensors',
  entities: [
    {
      resourceName: 'Sensor',
      _type: SENSOR_TYPE,
      _class: ['HostAgent'],
    },
  ],
  relationships: [],
  async executionHandler({ instance, jobState }) {
    const client = createDeepSecurityClient(instance);

    const { computers } = await client.listComputers();

    await jobState.addEntities(computers.map(createSensorEntity));
  },
};

export default step;

export function createSensorEntity(sensor: DeepSecurityComputer): Entity {
  const id = createComputerEntityIdentifier(sensor.ID);
  return createIntegrationEntity({
    entityData: {
      source: sensor,
      assign: {
        _key: id,
        _type: SENSOR_TYPE,
        _class: ['HostAgent'],

        // normalize property names to match data model
        id,
        createdOn: sensor.created,
        name: sensor.displayName || sensor.hostName,
        hostname: sensor.hostName,
        description: sensor.description,
        platform: extractPlatform(sensor.platform),
        groupId: createComputerGroupEntityIdentifier(sensor.groupID),
        cloudProvider: sensor.ec2VirtualMachineSummary?.cloudProvider,
        awsAccountId: sensor.ec2VirtualMachineSummary?.accountID,
        ec2InstanceId: sensor.ec2VirtualMachineSummary?.instanceID,
        agentStatus: sensor.computerStatus?.agentStatus,
        applianceStatus: sensor.computerStatus?.applianceStatus,
        agentGUID: sensor.agentGUID,
        hostGUID: sensor.hostGUID,
        antiMalwareStatus: sensor.antiMalware?.moduleStatus?.agentStatus,
        webReputationStatus: sensor.webReputation?.moduleStatus?.agentStatus,
        firewallStatus: sensor.firewall?.moduleStatus?.agentStatus,
        intrusionPreventionStatus:
          sensor.intrusionPrevention?.moduleStatus?.agentStatus,
        integrityMonitoringStatus:
          sensor.integrityMonitoring?.moduleStatus?.agentStatus,
        logInspectionStatus: sensor.logInspection?.moduleStatus?.agentStatus,
        applicationControlStatus:
          sensor.applicationControl?.moduleStatus?.agentStatus,
        securityUpdateStatus: sensor.securityUpdates?.updateStatus?.status,
        function: [
          'anti-malware',
          'activity-monitor',
          'host-firewall',
          'log-monitor',
          'HIDS',
        ],
        lastSeenOn: parseTimePropertyValue(sensor.lastAgentCommunication, 'ms'), // Trend Micro unfortunately does not make the scan date available to the API for devices that do not have agents installed.
      },
    },
  });
}

/**
 * DO NOT change this constant. IDs are not long enough
 * to generate keys that match the min length
 * the data model requires
 */
const COMPUTER_ID_PREFIX = 'trend-micro-sensor';
export function createComputerEntityIdentifier(id: string): string {
  return `${COMPUTER_ID_PREFIX}:${id}`;
}

/**
 * This regular expression is used to extract the platform name
 * that matches our data model from the string returned by the
 * computer api
 */
const PLATFORM_REGEX = /(darwin|linux|unix|windows|android|ios|embedded)/i;
function extractPlatform(platform: string): string {
  const regexResult = platform.match(PLATFORM_REGEX);
  let match: string | undefined = undefined;

  if (regexResult) {
    match = regexResult[0];
  }

  return match ? match.toLowerCase() : 'other';
}
