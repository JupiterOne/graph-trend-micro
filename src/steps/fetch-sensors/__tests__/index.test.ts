import { STEP_ID } from '../index';
import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfig } from '../../../../test/config';
import { setupRecording, Recording } from '../../../../test/recording';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe(STEP_ID, () => {
  test('success', async () => {
    recording = setupRecording({
      name: STEP_ID,
      directory: __dirname,
    });

    const stepConfig = buildStepTestConfig(STEP_ID);
    const stepResults = await executeStepWithDependencies(stepConfig);
    expect(stepResults).toMatchStepMetadata(stepConfig);
  });
});
