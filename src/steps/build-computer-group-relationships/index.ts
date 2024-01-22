import {
  Entity,
  Relationship,
  JobState,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';

import { STEP_ID as SENSOR_STEP, SENSOR_TYPE } from '../fetch-sensors';
import {
  STEP_ID as COMPUTER_GROUP_STEP,
  COMPUTER_GROUP_TYPE,
} from '../fetch-computer-groups';

export const STEP_ID = 'build-computer-group-relationships';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Build computer group relationships',
  entities: [],
  relationships: [
    {
      _type: 'trend_micro_sensor_has_computer_group',
      sourceType: COMPUTER_GROUP_TYPE,
      _class: RelationshipClass.HAS,
      targetType: SENSOR_TYPE,
    },
  ],
  dependsOn: [SENSOR_STEP, COMPUTER_GROUP_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const groupIdMap = await createComputerGroupIdMap(jobState);

    await jobState.iterateEntities({ _type: SENSOR_TYPE }, async (sensor) => {
      const group = groupIdMap.get(sensor.groupId as string);

      if (group) {
        const relationship = createComputerGroupRelationship(sensor, group);
        await jobState.addRelationships([relationship]);
      }
    });
  },
};

async function createComputerGroupIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const groupIdMap = new Map<string, Entity>();
  await jobState.iterateEntities({ _type: COMPUTER_GROUP_TYPE }, (group) => {
    // unfortunately need to cast because of EntityPropertyValue type
    groupIdMap.set(group.id as string, group);
  });
  return groupIdMap;
}

export default step;

export function createComputerGroupRelationship(
  sensor: Entity,
  group: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: sensor,
    to: group,
  });
}
