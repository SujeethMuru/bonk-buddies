const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const screens={menu:$('#menu'),game:$('#game'),results:$('#results')};
const field=$('#field'), hammer=$('#hammer'), toast=$('#toast');
const settings={easy:{up:1250,gap:800,max:2},normal:{up:900,gap:560,max:3},hard:{up:620,gap:350,max:4}};
let level='normal',running=false,paused=false,pauseStarted=0,score=0,hits=0,misses=0,combo=0,bestCombo=0,timeLeft=120000;
let spawnTimer,clockTimer,powerTimer,lastTick,audioOn=true,audioCtx,musicTimer,activePower=null,powerUntil=0;

async function removeGreen(img){
  if(!img.complete) await new Promise(r=>img.onload=r);
  const c=document.createElement('canvas'),x=c.getContext('2d',{willReadFrequently:true});
  c.width=img.naturalWidth;c.height=img.naturalHeight;x.drawImage(img,0,0);
  const d=x.getImageData(0,0,c.width,c.height),p=d.data;
  for(let i=0;i<p.length;i+=4){const r=p[i],g=p[i+1],b=p[i+2],dominance=g-Math.max(r,b);if(g>70&&g>r*1.12&&g>b*1.12)p[i+3]=dominance>45?0:Math.max(0,255-dominance*5.5)}
  x.putImageData(d,0,0);
  img.src=c.toDataURL('image/png');
}
Promise.all($$('.keyed').map(removeGreen));

for(let i=0;i<9;i++){const h=document.createElement('div');h.className='hole';h.dataset.i=i;field.appendChild(h)}
$$('[data-level]').forEach(b=>b.onclick=()=>{$$('[data-level]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');level=b.dataset.level;blip(520,.05)});
$('#startBtn').onclick=startGame;$('#againBtn').onclick=startGame;$('#menuBtn').onclick=()=>show('menu');
$('#quitBtn').onclick=()=>$('#quitModal').classList.remove('hidden');
$('#pauseBtn').onclick=pauseGame;$('#resumeBtn').onclick=resumeGame;
$('#keepPlaying').onclick=()=>$('#quitModal').classList.add('hidden');
$('#confirmQuit').onclick=()=>{running=false;clearTimers();field.querySelectorAll('.hole').forEach(clearHole);$('#quitModal').classList.add('hidden');show('menu')};
$('#soundBtn').onclick=()=>{audioOn=!audioOn;$('#soundBtn').textContent=audioOn?'♫ ON':'♫ OFF';if(!audioOn)stopMusic();else if(running)startMusic()};
document.addEventListener('pointermove',e=>{hammer.style.left=e.clientX+'px';hammer.style.top=e.clientY+'px'});
document.addEventListener('pointerdown',()=>{hammer.classList.remove('swing');void hammer.offsetWidth;hammer.classList.add('swing')});
field.addEventListener('pointerdown',e=>{
  if(!running)return;
  const hole=e.target.closest('.hole');
  if(activePower==='range'){
    const targets=$$('.hole.up').map(h=>{const r=h.getBoundingClientRect();return{h,d:Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2))}}).sort((a,b)=>a.d-b.d);
    if(targets[0]&&targets[0].d<180){hitBuddy(targets[0].h,targets[0].h.querySelector('.buddy').src.includes('charan')?'charan':'yesh');return}
  }
  if(hole&&!hole.classList.contains('up')){misses++;combo=0;updateHud();blip(100,.04)}
});

function show(name){Object.values(screens).forEach(s=>s.classList.add('hidden'));screens[name].classList.remove('hidden');$('#hud').classList.toggle('hidden',name!=='game')}
function startGame(){initAudio();clearTimers();score=hits=misses=combo=bestCombo=0;timeLeft=120000;activePower=null;powerUntil=0;paused=false;$('#pauseModal').classList.add('hidden');field.querySelectorAll('.hole').forEach(clearHole);show('game');running=true;lastTick=performance.now();updateHud();scheduleSpawn();clockTimer=setInterval(tick,100);powerTimer=setInterval(spawnPower,12000);startMusic();showToast(level.toUpperCase()+' MODE!')}
function scheduleSpawn(){if(!running)return;const slow=activePower==='slow'?1.65:1;spawnTimer=setTimeout(()=>{spawnBuddy();scheduleSpawn()},settings[level].gap*slow*(.78+Math.random()*.42))}
function spawnBuddy(){const open=$$('.hole:not(.up)');const current=$$('.hole.up').length;if(!open.length||current>=settings[level].max)return;const h=open[Math.floor(Math.random()*open.length)],who=Math.random()<.5?'charan':'yesh';const img=new Image();img.className='buddy';img.src=`assets/${who}.png`;h.innerHTML='';h.appendChild(img);h.classList.add('up');h.dataset.hit='0';h.onclick=()=>hitBuddy(h,who);const duration=settings[level].up*(activePower==='slow'?1.7:1);h._timer=setTimeout(()=>{if(h.dataset.hit==='0'){combo=0;misses++;updateHud()}clearHole(h)},duration)}
function hitBuddy(h,who){if(h.dataset.hit==='1')return;h.dataset.hit='1';hits++;combo++;bestCombo=Math.max(bestCombo,combo);const mult=1+Math.floor(combo/5);score+=100*mult;h.classList.add('hit');const s=document.createElement('span');s.className='speech';s.textContent=Math.random()<.5?'OUCH!':'OW!';h.appendChild(s);bonk();showToast((who==='charan'?'CHARAN':'YESH')+' +'+(100*mult));updateHud();setTimeout(()=>clearHole(h),280)}
function clearHole(h){if(!h)return;clearTimeout(h._timer);h.className='hole';h.innerHTML='';h.onclick=null}
function tick(){const now=performance.now();timeLeft-=now-lastTick;lastTick=now;if(activePower&&now>powerUntil){activePower=null;$('#powerStatus').textContent='NONE'}if(timeLeft<=0)endGame();updateHud()}
function updateHud(){const t=Math.max(0,Math.ceil(timeLeft/1000));$('#score').textContent=String(score).padStart(4,'0');$('#timer').textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;$('#combo').textContent='x'+Math.max(1,1+Math.floor(combo/5))}
function spawnPower(){if(!running||$('.powerup'))return;const p=document.createElement('button');p.className='powerup';const slow=Math.random()<.5;p.textContent=slow?'⏳':'💥';p.title=slow?'Slow time':'Wide hammer';p.style.left=(10+Math.random()*80)+'%';p.style.top=(38+Math.random()*42)+'%';screens.game.appendChild(p);p.onclick=e=>{e.stopPropagation();activePower=slow?'slow':'range';powerUntil=performance.now()+10000;$('#powerStatus').textContent=slow?'SLOW-MO 10s':'MEGA HAMMER 10s';if(!slow)hammer.style.transform='translate(-20px,-75px) scale(1.55) rotate(-20deg)';setTimeout(()=>hammer.style.transform='',10000);powerSound();p.remove();showToast(slow?'TIME WARP!':'MEGA BONK!')};setTimeout(()=>p.remove(),5000)}
function endGame(){running=false;clearTimers();field.querySelectorAll('.hole').forEach(clearHole);show('results');$('#finalScore').textContent=String(score).padStart(4,'0');$('#finalHits').textContent=hits;$('#finalCombo').textContent='x'+bestCombo;const acc=hits+misses?Math.round(hits/(hits+misses)*100):0;$('#finalAccuracy').textContent=acc+'%';$('#rank').textContent=score>12000?'LEGENDARY BONK LORD':score>7000?'HAMMER HERO':score>3500?'BONK APPRENTICE':'ROOKIE BONKER';victorySound()}
function clearTimers(){clearTimeout(spawnTimer);clearInterval(clockTimer);clearInterval(powerTimer);stopMusic()}
function pauseGame(){if(!running||paused)return;paused=true;running=false;pauseStarted=performance.now();clearTimers();field.querySelectorAll('.hole').forEach(clearHole);$('.powerup')?.remove();$('#pauseModal').classList.remove('hidden')}
function resumeGame(){if(!paused)return;const pausedFor=performance.now()-pauseStarted;if(activePower)powerUntil+=pausedFor;paused=false;running=true;lastTick=performance.now();$('#pauseModal').classList.add('hidden');scheduleSpawn();clockTimer=setInterval(tick,100);powerTimer=setInterval(spawnPower,12000);startMusic();showToast('GO!')}
function showToast(t){toast.textContent=t;toast.classList.remove('show');void toast.offsetWidth;toast.classList.add('show')}
function initAudio(){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume()}
function tone(freq,dur,type='square',vol=.035,when=0){if(!audioOn||!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime+when);g.gain.setValueAtTime(vol,audioCtx.currentTime+when);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+when+dur);o.connect(g).connect(audioCtx.destination);o.start(audioCtx.currentTime+when);o.stop(audioCtx.currentTime+when+dur)}
function blip(f,d){initAudio();tone(f,d)}
function bonk(){initAudio();tone(120,.12,'square',.09);tone(75,.2,'sawtooth',.055,.04);tone(500,.06,'square',.025,.06)}
function powerSound(){[300,450,650,900].forEach((f,i)=>tone(f,.13,'square',.04,i*.07))}
function victorySound(){initAudio();[262,330,392,523].forEach((f,i)=>tone(f,.25,'square',.05,i*.12))}
function startMusic(){if(!audioOn||!running)return;stopMusic();let i=0;const notes=[131,165,196,165,147,185,220,185,131,165,247,196,147,185,220,294];musicTimer=setInterval(()=>{tone(notes[i++%notes.length],.11,'square',.018);if(i%4===0)tone(65,.08,'triangle',.025)},140)}
function stopMusic(){clearInterval(musicTimer)}
