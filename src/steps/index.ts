import { accountSteps } from './account';
import { accessSteps } from './access';
import { serviceSteps } from './services';

const integrationSteps = [...accountSteps, ...accessSteps, ...serviceSteps];

export { integrationSteps };
