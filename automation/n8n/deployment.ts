export function preservedNewsroomEnabled(composeEnv:string){
 const match=/^NEWSROOM_ENABLED=(0|1)$/m.exec(composeEnv);
 return match?.[1]??'0';
}
