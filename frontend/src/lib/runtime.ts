import { readConfig } from './config';
export function runtimeConfig() { return readConfig({ ...import.meta.env, ...process.env }); }
