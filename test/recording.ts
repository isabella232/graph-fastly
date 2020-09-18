import { Recording, setupRecording } from '@jupiterone/integration-sdk-testing';

type SetupParameters = Parameters<typeof setupRecording>[0];

export function setupIntegrationRecording({
  name,
  directory,
  ...overrides
}: SetupParameters): Recording {
  return setupRecording({
    directory,
    name,
    redactedRequestHeaders: ['fastly-key'],
    ...overrides,
  });
}
