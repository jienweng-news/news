import {releaseReadiness} from '../frontend/src/lib/release';
const report=releaseReadiness(process.env);console.log(JSON.stringify(report,null,2));if(process.argv.includes('--require-ready')&&!report.ready)process.exitCode=1;
