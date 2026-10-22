import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';
const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
if (!projectId || !dataset) throw new Error('Configure SANITY_PROJECT_ID and SANITY_DATASET in the repository .env before running Studio.');
export default defineConfig({ name: 'publication', title: 'Publication editorial desk', projectId, dataset, plugins: [structureTool()], schema: { types: schemaTypes } });
