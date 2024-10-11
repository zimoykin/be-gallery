import { Inject } from '@nestjs/common';
import { getModelToken } from './model-token.helper';

export const InjectRepository = (
  modelName: string,
  connectionName?: string,
) => {
  return Inject(getModelToken(modelName, connectionName));
};
