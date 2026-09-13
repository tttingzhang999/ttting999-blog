import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterArticles } from '../utils/blog/filter.ts';
const rows = Object.freeze([
 Object.freeze({title:'Python GIL',description:'並發',date:'2025-10-24',category:'技術',tags:['python']}),
 Object.freeze({title:'Agent',description:'工具執行',date:'2026-05-10',category:'AI',tags:['tools']}),
]);
test('archive combines normalized search, exact category and year without mutation',()=>{
 assert.deepEqual(filterArticles(rows,{q:' PYTHON ',category:'技術',year:'2025'}),[rows[0]]);
 assert.deepEqual(filterArticles(rows,{q:'工具',category:'AI',year:'2026'}),[rows[1]]);
 assert.equal(filterArticles(rows,{q:'tools',category:'all',year:'all'}).length,1);
 assert.equal(filterArticles(rows,{q:'',category:'all',year:'all'}).length,2);
 assert.equal(filterArticles(rows,{q:'',category:'AI',year:'2025'}).length,0);
 assert.equal(filterArticles(rows,{q:'missing',category:'all',year:'all'}).length,0);
 assert.equal(rows[0].title,'Python GIL');
});
