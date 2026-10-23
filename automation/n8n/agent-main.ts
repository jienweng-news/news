import {agentHandler} from './agent';import {serve,secret} from './server';
serve(5681,agentHandler(secret('agent_token')));
