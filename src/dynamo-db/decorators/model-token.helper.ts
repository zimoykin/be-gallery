export function getModelToken(modelName: string, connectionName?: string) {
  let result = `model:${modelName.toLowerCase()}`;
  if (connectionName) {
    result += `_${connectionName}`;
  }
  return result;
}
