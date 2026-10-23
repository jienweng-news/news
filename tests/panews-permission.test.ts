import {expect,it} from 'vitest';
import {reportingEvidenceSource} from '../automation/sources';
const source={id:'panews',url:'https://www.panewslab.com/rss.xml',automation_enabled:true,rights_status:'reviewed',allowed_reuse:'metadata-discovery',proposed_poll_minutes:5,classification:'crypto-newsroom',review:{permission_status:'owner-confirmed'}};
it('accepts licensed reporting only after explicit permission and source activation',()=>{
 expect(reportingEvidenceSource(source)).toBe(true);
 expect(reportingEvidenceSource({...source,review:{permission_status:'pending'}})).toBe(false);
 expect(reportingEvidenceSource({...source,automation_enabled:false})).toBe(false);
 expect(reportingEvidenceSource({...source,id:'other-newsroom'})).toBe(false);
});
