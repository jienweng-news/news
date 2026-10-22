import {existsSync} from 'node:fs';
const envPath=new URL('../.env',import.meta.url);if(existsSync(envPath))process.loadEnvFile(envPath);
import {releaseReadiness} from '../frontend/src/lib/release';
const report=releaseReadiness(process.env);console.log(JSON.stringify(report,null,2));if(process.argv.includes('--require-ready')&&!report.ready)process.exitCode=1;
