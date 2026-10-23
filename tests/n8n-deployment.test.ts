import {expect,it} from 'vitest';
import {preservedNewsroomEnabled} from '../automation/n8n/deployment';

it('preserves the coordinator activation state when preparing an n8n update',()=>{
 expect(preservedNewsroomEnabled('NEWSROOM_PRIVATE_DIR=/private\nNEWSROOM_ENABLED=1\n')).toBe('1');
 expect(preservedNewsroomEnabled('NEWSROOM_PRIVATE_DIR=/private\nNEWSROOM_ENABLED=0\n')).toBe('0');
 expect(preservedNewsroomEnabled('NEWSROOM_PRIVATE_DIR=/private\n')).toBe('0');
});
