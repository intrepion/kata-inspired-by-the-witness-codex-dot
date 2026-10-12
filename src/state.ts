import {puzzles} from './puzzles';import type {Point} from './puzzles';import {validate} from './domain';
export type Save={version:1,solved:Record<number,Point[]>,hints:Record<number,number>};
export const fresh=():Save=>({version:1,solved:{},hints:{}});
export function unlocked(region:number,save:Save):boolean{return puzzles.filter(p=>p.region<region).every(p=>!!save.solved[p.id]);}
export function restore(raw:string|null):Save {
 const save=fresh();try {const candidate=JSON.parse(raw||'null');if(candidate?.version!==1)return save;
 for(const p of puzzles){const path=candidate.solved?.[p.id];if(unlocked(p.region,save)&&Array.isArray(path)&&validate(p,path)===null)save.solved[p.id]=path;
 const hint=candidate.hints?.[p.id];if(Number.isInteger(hint)&&hint>=0)save.hints[p.id]=Math.min(hint,p.hints.length);}
 }catch{/* Invalid storage is recoverable. */}return save;
}
