import { Inject } from '@nestjs/common';
import { getModelToken } from './model-token.helper';

export const InjectRepository = <T>(modelCls: new () => T, connectionName?: string): ParameterDecorator => {
  return Inject(getModelToken(modelCls.name.toLowerCase(), connectionName));
};
