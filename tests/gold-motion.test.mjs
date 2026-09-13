import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceMotion} from '../utils/home/motion.ts';
test('retargeting preserves motion rather than resetting position or velocity',()=>{
 const start={position:0,velocity:120};
 const next=advanceMotion(start,100,1/60);
 assert.ok(next.position>0&&next.position<10);
 const reversed=advanceMotion(next,-100,1/60);
 assert.ok(Math.abs(reversed.position-next.position)<10);
 assert.deepEqual(start,{position:0,velocity:120});
});
test('spring converges at different frame rates and remains stable after suspension',()=>{
 for(const step of [1/120,1/60,1/30]){
 let state={position:0,velocity:0};
 for(let t=0;t<2;t+=step)state=advanceMotion(state,100,step);
 assert.ok(Math.abs(state.position-100)<.01);
 assert.ok(Math.abs(state.velocity)<.1);
 }
 assert.ok(Number.isFinite(advanceMotion({position:0,velocity:10},100,30).position));
});
