import { TomatoConfig } from '../types/tomato'; import { UpdateLogEntry } from '../types/rl';
export const exportConfig=(config:TomatoConfig)=>JSON.stringify(config,null,2);
export const importConfig=(text:string):TomatoConfig=>JSON.parse(text) as TomatoConfig;
export const logToJson=(log:UpdateLogEntry[])=>JSON.stringify(log,null,2);
export const logToCsv=(log:UpdateLogEntry[])=>['episode,step,algorithm,previousStateId,action,reward,nextStateId,done,terminalReason,oldValue,target,error,newValue',...log.map(r=>[r.episode,r.step,r.algorithm,r.previousStateId,r.action,r.reward,r.nextStateId,r.done,r.terminalReason??'',r.oldValue??'',r.target??'',r.error??'',r.newValue??''].map(v=>`"${String(v).replaceAll('"','""')}"`).join(','))].join('\n');
