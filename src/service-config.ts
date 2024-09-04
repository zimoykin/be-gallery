import * as Joi from "joi";

const schema = {
  MODE: Joi.string().valid('dev', 'prod'),
  PORT: Joi.number().min(3000).max(9000),
  MONGO_CONNECTION: Joi.string().uri({ scheme: ['mongodb', 'mongodb+srv'] }).optional(),
};
export const serviceSchema = Joi.object(schema);
export type ConfigVariables = typeof schema;