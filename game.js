const KEY='math_dusk_choice_tree_v20';
const LEGACY_KEY='math_dusk_choice_tree_v20_backup';
const ACH_KEY='math_dusk_achievements_v20';
const BY_ID=Object.fromEntries(STORY.map((s,i)=>[s.id,i]));
const initial=()=>({idx:0,stats:{research:48,engineering:34,relations:42,spirit:60,money:38,stress:40,creativity:44,family:45,mentor:42,students:35,prestige:30,autonomy:42,adapt:32},flags:{},history:[],done:false,endingId:null,endingRecorded:false});
const emptyAwards=()=>({milestones:{},endings:{}});
function readLocal(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
let state=initial();
const old=readLocal(KEY)||readLocal(LEGACY_KEY);
if(old&&old.stats&&Array.isArray(old.history)&&Number.isInteger(old.idx)&&old.idx>=0&&old.idx<STORY.length){state={...initial(),...old};}
let awards=readLocal(ACH_KEY)||emptyAwards();
if(!awards||typeof awards!=='object')awards=emptyAwards();
awards.milestones=awards.milestones||{};awards.endings=awards.endings||{};
function save(){saveLocal(KEY,state)}
function saveAwards(){saveLocal(ACH_KEY,awards)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function clamp(v){return Math.max(0,Math.min(100,v))}
function fp(i){return POV[STORY[i].first]||THIRD[STORY[i].third]}
function tp(i){return THIRD[STORY[i].third]}
function unlockMilestone(sceneId){for(const [id,title,desc,source] of MILESTONES){if(source===sceneId&&!awards.milestones[id]){awards.milestones[id]={at:new Date().toISOString()};saveAwards()}}}
function recordEnding(){if(!state.done||!state.endingId||state.endingRecorded)return;
 const id=state.endingId;const record=awards.endings[id]||{count:0,firstAt:new Date().toISOString()};
 record.count=(record.count||0)+1;record.lastAt=new Date().toISOString();awards.endings[id]=record;
 state.endingRecorded=true;saveAwards();save();}
const FOCUS_SCENES=['s0','s4','s6','s11','s14','s16','s18','s19','s21','s24','s27'];
const DEFAULT_FLAGS=()=>({undergrad:'unsettled',doctoralTrack:'unsettled',paperKind:'theory',postdocFocus:'research',studentStayed:false,studentLeft:false,studentPublication:false,facultyRetry:false,tenureReview:false,aiChoice:'',familyRepaired:false,lateRetrain:false});
function ensureFlags(){state.flags={...DEFAULT_FLAGS(),...(state.flags||{})};for(const [k,v] of Object.entries(initial().stats)){if(!Number.isFinite(state.stats[k]))state.stats[k]=v;}}
ensureFlags();
function applyHistoryFlags(sceneId,i){
 const f=state.flags;
 if(sceneId==='s0')f.undergrad=['pure','mixed','broad'][i];
 if(sceneId==='s4')f.doctoralTrack=['difficult','incremental','computation'][i];
 if(sceneId==='s6')f.paperKind=['theory','incremental','joint'][i];
 if(sceneId==='s11')f.postdocFocus=['research','collaboration','technical'][i];
 if(sceneId==='s17')f.studentLeft=true;
 if(sceneId==='student_stays')f.studentStayed=true;
 if(sceneId==='s20')f.studentPublication=true;
 if(sceneId==='s21')f.tenurePassed=true;
 if(sceneId==='faculty_waitlist' && i===0)f.facultyRetry=true;
 if(sceneId==='tenure_hurdle'&&i!==2)f.tenureReview=true;
 if(sceneId==='family_crossroad'&&i<2)f.familyRepaired=true;
 if(sceneId==='s27')f.aiChoice=['pure','hybrid','independent'][i];
 if(sceneId==='ai_reskill'&&i<2)f.lateRetrain=true;
}
function effectiveOptions(sc){
 let list=sc.choices.map(c=>({...c}));
 if(sc.id==='s27' && state.stats.engineering<60 && state.flags.undergrad!=='mixed'){
  list[1]={...list[1],text:'先补足技术训练，再争取建设跨学科平台',sub:'早年的研究路线带来额外学习成本，但机会仍在。'};
 }
 if(sc.id==='s14' && state.flags.facultyRetry){list[0]={...list[0],sub:'经过额外一年的准备，教职委员会终于认可了你的计划。'};}
 if(sc.id==='s20' && state.flags.studentStayed){list[0]={...list[0],sub:'几年前耐心指导与共同规划，终于结出果实。'};}
 return list;
}
function specialNext(sc,i,ch){
 const id=sc.id,f=state.flags,st=state.stats;
 if(id==='s6'){
  if(i===0&&f.doctoralTrack==='difficult')return 'doctoral_stall';
  if(i===1)return 'doctoral_subproblem';
  if(i===2||f.doctoralTrack==='computation')return 'doctoral_joint';
  return 's7';
 }
 if(id==='s11'){
  if(i===2)return (st.engineering>=61||f.undergrad==='mixed')?'research_center_offer':'technical_apprentice';
  if(i===0&&st.stress>=65)return 'postdoc_pressure';
  return 's12';
 }
 if(id==='s13')return (!f.facultyRetry && ((f.paperKind==='incremental'&&st.prestige<53)||(st.relations<52&&st.prestige<48)))?'faculty_waitlist':'s14';
 if(id==='s16')return 's18'; // chronology: spring 2022 before autumn 2022
 if(id==='s18')return (st.students>=65&&st.mentor>=45)?'student_stays':'s17';
 if(id==='s17'||id==='student_stays')return 's19';
 if(id==='s19')return (f.studentStayed&&st.students>=65)?'s20':'student_alternate';
 if(id==='s20'||id==='student_alternate')return ((st.prestige<38&&st.research<85)||st.stress>=87)?'tenure_hurdle':'s21';
 if(id==='s25')return (st.family<43||st.stress>=76)?'family_crossroad':'s27';
 if(id==='s27'&&i===1)return (st.engineering>=60||f.undergrad==='mixed')?'ai_bridge':'ai_reskill';
 if(id==='student_alternate')return 's21';
 return null;
}
function nextAfter(sc,i,ch){
 const special=specialNext(sc,i,ch);if(special)return special;
 if(ch.next&&Object.prototype.hasOwnProperty.call(BY_ID,ch.next))return ch.next;
 const index=BY_ID[sc.id];
 if(index>=0&&index<31)return STORY[index+1].id;
 return null;
}
function contextLine(sc){const f=state.flags, st=state.stats;
 if(sc.id==='s4')return f.undergrad==='mixed'?'本科时的计算训练使你更关注几何直觉与算法之间的联系。':f.undergrad==='pure'?'你仍然确信严格证明是自己最想投入的事情。':'你希望数学之美与现实中的机会不必彼此排斥。';
 if(sc.id==='s8')return f.paperKind==='joint'?'这篇论文来自计算和理论的联合工作，署名中有你与合作者的名字。':f.paperKind==='incremental'?'这篇论文并非最初设想的宏大定理，而是一项可靠的阶段成果。':'这是你在长时间理论攻关后写出的第一篇严谨论文。';
 if(sc.id==='s12')return st.family>=52?'过去你曾试着把家人纳入自己的职业计划，这使得今晚的谈话相对平静。':'你为研究付出了大量时间，家人开始怀疑你是否真正听见了他们的担忧。';
 if(sc.id==='s14')return f.facultyRetry?'这次面试承载了你额外一年的博士后训练和重新准备。':f.postdocFocus==='collaboration'?'博士后期间建立的合作网络，使你有了更多可以谈论的共同工作。':'你希望让委员会理解你的独立数学研究计划。';
 if(sc.id==='s21')return f.tenureReview?'经过补充评审，你终于迎来了正式的教职决定。':f.studentPublication?'学生的独立成果也成为你在系里建立研究团队的证明。':'多年的研究、教学和合作累积成了今天的职业评审。';
 if(sc.id==='s24')return st.engineering>=65?'过去的计算训练使你更快理解 AI 的新能力，但你依然要面对数学家的身份问题。':'你尚不熟悉这些工具，它们的快速进步使你感到陌生，却没有让你的数学训练失去价值。';
 if(sc.id==='s27')return f.undergrad==='mixed'?'多年前学过的计算方法，现在为你提供了一条熟悉但未必轻松的转型路径。':'这次讨论让你想起少年时对纯数学的崇敬；如今每条道路都有代价。';
 return '';
}
function currentScene(){const source=STORY[state.idx];let date=source.date; if(state.flags.facultyRetry){if(source.id==='s14')date='2021 · 二月';if(source.id==='s15')date='2021 · 八月';if(source.id==='s16')date='2021 · 九月';}if(state.flags.lateRetrain&&source.id==='s28')date='2030 · 九月';return {...source,date,choices:effectiveOptions(source),fateEcho:contextLine(source)};}
function unlockArrival(id){unlockMilestone(id);}
function choose(i){if(state.done)return;
 ensureFlags();const sc=currentScene(),ch=sc.choices[i];if(!ch)return;
 Object.entries(ch.effects||{}).forEach(([k,v])=>{state.stats[k]=clamp((state.stats[k]||0)+v)});
 applyHistoryFlags(sc.id,i);
 state.history.push({scene:sc.title,choice:ch.text,after:ch.after||'',id:sc.id});
 if(ch.end){state.done=true;state.endingId=ch.end;}
 else{
  const next=nextAfter(sc,i,ch);
  if(next&&Object.prototype.hasOwnProperty.call(BY_ID,next)){state.idx=BY_ID[next];unlockArrival(next);}
  else {state.done=true;state.endingId='open_research';}
 }
 if(state.done)recordEnding();save();render();
}

function scoreHtml(){return Object.entries(LABELS).map(([k,l])=>`<div class='stat'><div class='row'><span>${l}</span><strong>${Math.round(state.stats[k]||0)}</strong></div><div class='track'><div class='fill' style='width:${Math.round(state.stats[k]||0)}%'></div></div></div>`).join('')}
function historyHtml(){return state.history.map((h,i)=>`<div class='hist'><strong>${i+1}. ${esc(h.scene)}</strong><div>${esc(h.choice)}</div>${h.after?`<div style='margin-top:5px;color:#c7bda9'>${esc(h.after)}</div>`:''}</div>`).join('')}
function ending(){return ENDINGS[state.endingId]||ENDINGS.open_research}
function turningPoints(){const keys=['s0','s4','s6','s11','s14','s18','s21','s24','s27'];
 return state.history.filter(h=>keys.includes(h.id)).map(h=>`<div class='hist'><strong>${esc(h.scene)}</strong><div>${esc(h.choice)}</div></div>`).join('')||'<div class="hist">暂无记录</div>';
}
function showEnding(){if(state.done)recordEnding();const [title,lead]=ending(),box=document.getElementById('overlay');
 box.innerHTML=`<div class='modal'><h2>${esc(title)}</h2><p class='lead'>${esc(lead)}</p><p class='lead'>这是你在本次旅程里抵达的结局，已记入跨周目成就档案。你可以重新开始，探索纯数学、教学、休养、公共传播等其他人生。</p><div class='stats'>${scoreHtml()}</div><div class='history'><h2 style='font-size:24px;margin-top:28px'>决定人生走向的选择</h2>${turningPoints()}</div><div class='history'><h2 style='font-size:24px;margin-top:28px'>全部经历</h2>${historyHtml()}</div><div class='modal-actions'><button onclick='closeOverlay()'>返回</button><button onclick='showAchievements()'>查看全部成就</button><button onclick='downloadSave()'>导出存档</button><button onclick='resetGame()'>重新开始</button></div></div>`;box.className='overlay show';}
function achCount(){return Object.keys(awards.milestones).length+Object.keys(awards.endings).length}
function achTotal(){return MILESTONES.length+ENDING_IDS.length}
function showAchievements(){const box=document.getElementById('overlay');const miles=MILESTONES.map(([id,title,desc])=>{const hit=awards.milestones[id];return `<div class='achievement ${hit?'unlocked':''}'><div class='ach-state'>${hit?'◆':'◇'}</div><div><strong>${esc(title)}</strong><p>${hit?esc(desc):'尚未达成'}</p></div></div>`}).join('');
 const ends=ENDING_IDS.map(id=>{const rec=awards.endings[id];return `<div class='achievement ${rec?'unlocked':''}'><div class='ach-state'>${rec?'◆':'◇'}</div><div><strong>${rec?esc(ENDINGS[id][0]):'尚未发现的结局'}</strong><p>${rec?`已达成 ${rec.count} 次 · ${esc(ENDINGS[id][1])}`:'继续探索不同的选择'}</p></div></div>`}).join('');
 box.innerHTML=`<div class='modal'><h2>人生档案 · 成就</h2><p class='lead'>已解锁 ${achCount()} / ${achTotal()} 项。成就和结局记录独立保存，重新开始游戏也不会清除。</p><h3 class='ach-title'>人生里程碑 · ${Object.keys(awards.milestones).length}/${MILESTONES.length}</h3><div class='ach-grid'>${miles}</div><h3 class='ach-title'>已经走过的结局 · ${Object.keys(awards.endings).length}/${ENDING_IDS.length}</h3><div class='ach-grid'>${ends}</div><div class='modal-actions'><button onclick='closeOverlay()'>回到游戏</button><button onclick='downloadSave()'>备份存档与成就</button></div></div>`;box.className='overlay show';}
function showHelp(){const box=document.getElementById('overlay');box.innerHTML=`<div class='modal'><h2>玩法说明</h2><p class='lead'>左边是主角眼前所见，右边是旁观者视角。保留美国读博、博士后、研究型大学教职和几何分析主线。本科与博士时的选择会影响论文路线、职位、学生关系与后续机会；AI 到来后，已有技术训练的人和重新学习的人将经历不同事件。少量路线允许提前离开大学，但没有教学型大学分线。过程不显示分值，达成结局才会显示结果。成就会跨周目保留。</p><div class='modal-actions'><button onclick='closeOverlay()'>关闭</button></div></div>`;box.className='overlay show';}
function closeOverlay(){const box=document.getElementById('overlay');box.className='overlay';box.innerHTML='';}
function downloadSave(){const payload={version:'math-dusk-v21',state,achievements:awards};const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='math-dusk-save-and-achievements-v21.json';a.click();URL.revokeObjectURL(a.href);}
function uploadSave(){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=()=>{const f=input.files&&input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const obj=JSON.parse(r.result),st=obj.state||obj;if(!(st&&st.stats&&Array.isArray(st.history)&&Number.isInteger(st.idx)&&st.idx>=0&&st.idx<STORY.length))throw new Error();state={...initial(),...st};if(obj.achievements&&typeof obj.achievements==='object'){const a=obj.achievements;awards.milestones={...awards.milestones,...(a.milestones||{})};for(const [k,v] of Object.entries(a.endings||{})){const old=awards.endings[k];awards.endings[k]=!old||old.count<v.count?v:old;}saveAwards();}if(state.done&&!state.endingRecorded)recordEnding();save();render();}catch(e){alert('存档文件无效。')}};r.readAsText(f)};input.click();}
function resetGame(){if(!confirm('确定重新开始？当前进度会被覆盖，但成就与结局记录会保留。'))return;state=initial();save();closeOverlay();render();}
function render(){ensureFlags();const sc=currentScene();unlockMilestone(sc.id);if(state.done&&!state.endingRecorded)recordEnding();
 document.getElementById('visuals').innerHTML=`<div class='vpanel'><img src='${fp(state.idx)}' alt='${esc(sc.title)}，第一人称'><div class='vlabel'>第一人称</div></div><div class='vpanel'><img src='${tp(state.idx)}' alt='${esc(sc.title)}，第三人称'><div class='vlabel'>第三人称</div></div>`;
 const opts=state.done?`<button class='option' onclick='showEnding()'><span class='num'>✓</span><span><span class='main'>查看结局：${esc(ending()[0])}</span><span class='sub'>本次结局已记录在成就档案中</span></span><span class='arr'>›</span></button>`:sc.choices.map((c,i)=>`<button class='option' onclick='choose(${i})'><span class='num'>${i+1}</span><span><span class='main'>${esc(c.text)}</span><span class='sub'>${esc(c.sub)}</span></span><span class='arr'>›</span></button>`).join('');
 document.getElementById('lower').innerHTML=`<div class='story'><div class='kicker'><span>人生抉择</span><span>•</span><span>${esc(sc.date)}</span></div><h1>${esc(sc.title)}</h1><div class='meta'><span class='badge'>${esc(sc.who)}</span><span>${esc(sc.face)}</span></div><div class='text'>${sc.fateEcho?`<div class='fate-echo'>${esc(sc.fateEcho)}</div>`:''}${esc(sc.text)}</div><div class='quote'>${esc(sc.line)}</div></div><div class='choices'><div class='question'>${esc(sc.question)}</div><div class='choice-scroll'>${opts}</div></div>`;
 const ach=document.getElementById('achievement-btn');if(ach)ach.textContent='成就 '+achCount()+'/'+achTotal();save();
}
render();
