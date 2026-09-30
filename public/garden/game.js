(() => {
  const stage=document.getElementById('stage'), actor=document.getElementById('walker');
  const status=document.getElementById('status'), layer=document.getElementById('routeLayer');
  const bloomVeil=document.getElementById('bloomVeil'),bloomSheet=bloomVeil.querySelector('.bloom-sheet');
  const bloomWater=document.getElementById('bloomWater'),bloomClose=document.getElementById('bloomClose');
  const bloomRose=document.getElementById('bloomRose');
  // Clean release state: each new account starts with no materials or pets.
  const _urlParams=new URLSearchParams(window.location.search);
  const _accQuery=_urlParams.get('account'),_nameQuery=_urlParams.get('name'),_emailQuery=_urlParams.get('email');
  const account=window.MONG_ACCOUNT||(_accQuery?{id:_accQuery,name:_nameQuery||_accQuery,email:_emailQuery||''}:{});
  const accountId=String(account.id||window.MONG_ACCOUNT_ID||_accQuery||'local-preview');
  const accountName=String(account.name||window.MONG_ACCOUNT_NAME||_nameQuery||'bạn');
  let currentAuthEmail='';
  try{
    const rawUser=localStorage.getItem('mei_current_user');
    if(rawUser){
      const parsed=JSON.parse(rawUser);
      if(parsed?.email)currentAuthEmail=String(parsed.email).toLowerCase().trim();
      else if(parsed?.isAdmin||parsed?.username==='meinguyen18'||parsed?.username==='admin_meimei'){
        currentAuthEmail='meinguyen18@gmail.com';
      }
    }
  }catch(_e){}
  if(!currentAuthEmail&&(localStorage.getItem('mei_is_admin')==='true'||accountId==='meinguyen18'||accountId==='admin_meimei')){
    currentAuthEmail='meinguyen18@gmail.com';
  }
  const accountEmail=String(
    account.email||
    window.MONG_ACCOUNT_EMAIL||
    _emailQuery||
    currentAuthEmail||
    ''
  ).toLowerCase().trim();
  function notifyParentSync(subKey,data){
    try{
      if(window.parent&&window.parent!==window){
        window.parent.postMessage({
          type:'GARDEN_SYNC_DATA',
          accountId,
          subKey,
          data
        },'*');
      }
    }catch(_err){}
  }
  const flowerStorageKey='mong-mien-garden:release:v1:flower:'+accountId;
  let flowerMemory={last:'',streak:0,petals:0},focusBeforeBloom=null,bloomTimers=[],audioContext=null;
  function clearBloomTimers(){bloomTimers.forEach(clearTimeout);bloomTimers=[];}
  function roseFrame(n){bloomRose.style.setProperty('--frame',n===0?'0%':n===1?'33.333%':n===2?'66.667%':'100%');}
  function playSound(kind='tap'){
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      audioContext ||=new Audio();
      if(audioContext.state==='suspended')audioContext.resume();
      const now=audioContext.currentTime;
      const tones=kind==='water'?[{f:587,t:0},{f:784,t:.11},{f:1175,t:.23}]
        :kind==='star'?[{f:523,t:0},{f:784,t:.12},{f:1047,t:.26},{f:1319,t:.4}]
        :kind==='open'?[{f:660,t:0},{f:880,t:.1}]:[{f:704,t:0}];
      tones.forEach(({f,t})=>{
        const osc=audioContext.createOscillator(),gain=audioContext.createGain();
        osc.type='sine';osc.frequency.setValueAtTime(f,now+t);
        gain.gain.setValueAtTime(.0001,now+t);
        gain.gain.exponentialRampToValueAtTime(kind==='water'?.028:.018,now+t+.025);
        gain.gain.exponentialRampToValueAtTime(.0001,now+t+.32);
        osc.connect(gain);gain.connect(audioContext.destination);
        osc.start(now+t);osc.stop(now+t+.33);
      });
    }catch(_error){}
  }
  function playWaterSound(){
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;
      if(!Audio)return;
      audioContext ||=new Audio();
      if(audioContext.state==='suspended')audioContext.resume();
      const sr=audioContext.sampleRate,length=Math.floor(sr*.38);
      const buffer=audioContext.createBuffer(1,length,sr),samples=buffer.getChannelData(0);
      let smooth=0;
      for(let i=0;i<length;i++){
        smooth=.82*smooth+.18*(Math.random()*2-1);
        samples[i]=smooth;
      }
      const now=audioContext.currentTime,source=audioContext.createBufferSource();
      const filter=audioContext.createBiquadFilter(),gain=audioContext.createGain();
      source.buffer=buffer;filter.type='lowpass';filter.frequency.value=760;
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(.075,now+.035);
      gain.gain.exponentialRampToValueAtTime(.0001,now+.37);
      source.connect(filter);filter.connect(gain);gain.connect(audioContext.destination);
      source.start(now);source.stop(now+.38);
    }catch(_error){}
  }
  const playerStorageKey='mong-mien-garden:release:v1:player:'+accountId;
  const sprite=document.getElementById('actorSprite');
  const portraitDock=document.getElementById('portraitDock'),dockArt=document.getElementById('dockArt');
  const onboardVeil=document.getElementById('onboardVeil'),onboardForm=document.getElementById('onboardForm');
  const welcomeDialogue=document.getElementById('welcomeDialogue');
  const spriteColumns={idle:2,walk:4,expressions:4,actions:5};
  const spriteAspect={idle:1,walk:.75,expressions:.625,actions:.6};
  const expressionFrames={happy:0,shy:1,sad:2,annoyed:3};
  const actionFrames={water:0,fish:1,star:2,pet:3,cottage:4};
  const spriteUrl=(gender,kind)=>window.MONG_CHAR_ASSETS?.[gender]?.[kind]||'assets/characters/'+gender+'-'+kind+(kind==='walk'?'-v2':'')+'.webp';
  function renderOnboardSprites(){document.querySelectorAll('.onboard-sprite').forEach(el=>{const h=el.getBoundingClientRect().height,w=el.getBoundingClientRect().width;el.style.backgroundImage='url("'+spriteUrl(el.classList.contains('male')?'male':'female','idle')+'")';el.style.backgroundSize='auto 100%';el.style.backgroundPosition=((w-h)/2)+'px 0';});}
  let player=null,expression='',expressionUntil=0,expressionTimer=null,walkTimer=null,walkFrame=0,activeAction='',interactionBusy=false,dialogueTimer=null,dialogueCollapse=null;
  function updateGardenSceneTitle(name){
    const titleEl=document.getElementById('gardenSceneTitleText');
    if(!titleEl)return;
    let raw=(name||player?.gardenName||'Mộng Miên').trim();
    if(!/^vườn\s+/i.test(raw)){
      raw='Vườn '+raw;
    }
    titleEl.textContent=raw;
  }
  function readPlayer(){try{const value=JSON.parse(localStorage.getItem(playerStorageKey));if(value&&(value.gender==='female'||value.gender==='male')&&typeof value.gardenName==='string'&&value.gardenName.trim())return value;}catch(_error){}return null;}
  function savePlayer(value){player=value;try{localStorage.setItem(playerStorageKey,JSON.stringify(value));}catch(_error){}updateGardenSceneTitle(value?.gardenName);notifyParentSync('player',value);}
  function spriteFrame(kind,frame){
    const gender=player?.gender||'female',columns=spriteColumns[kind];
    const height=actor.getBoundingClientRect().height||52,width=actor.getBoundingClientRect().width||39;
    const cell=height*spriteAspect[kind];
    if(sprite.dataset.source!==gender+kind){sprite.style.backgroundImage='url("'+spriteUrl(gender,kind)+'")';sprite.dataset.source=gender+kind;}
    sprite.style.backgroundSize=(columns*cell)+'px '+height+'px';
    sprite.style.backgroundPosition=((width-cell)/2-frame*cell)+'px 0';
    actor.dataset.mode=kind;
    actor.setAttribute('aria-label','Nhân vật '+(gender==='male'?'nam':'nữ')+' '+(kind==='walk'?'đang bước đi':kind==='actions'?'đang tương tác':kind==='expressions'?'đang biểu cảm':'đang đứng trong vườn'));
  }
  let dockPose='';
  function renderDockPortrait(){
    portraitDock.hidden=!player;
    if(!player)return;
    const showing=expression&&Date.now()<expressionUntil;
    const kind=showing?'expressions':'idle',frame=showing?expressionFrames[expression]:0,pose=player.gender+kind+frame;
    portraitDock.classList.toggle('expression',Boolean(showing));
    if(pose===dockPose)return;
    dockPose=pose;
    const cell=kind==='idle'?155:97;
    dockArt.style.backgroundImage='url("'+spriteUrl(player.gender,kind)+'")';
    dockArt.style.backgroundSize=(cell*spriteColumns[kind])+'px 155px';
    dockArt.style.backgroundPosition=((68-cell)/2-cell*frame-(kind==='idle'?29:0))+'px -4px';
  }
  function renderPlayer(){
    renderDockPortrait();
    if(activeAction){spriteFrame('actions',actionFrames[activeAction]);return;}
    if(traveling){spriteFrame('walk',walkFrame);return;}
    if(expression&&Date.now()<expressionUntil){spriteFrame('expressions',expressionFrames[expression]);return;}
    expression='';spriteFrame('idle',0);
  }
  function setExpression(value){
    if(!(value in expressionFrames)||!player)return;
    clearTimeout(expressionTimer);expression=value;expressionUntil=Date.now()+5000;
    renderPlayer();playSound('open');
    expressionTimer=setTimeout(()=>{expression='';expressionUntil=0;renderPlayer();},5000);
    document.getElementById('emotionMenu').hidden=true;document.getElementById('emotionToggle').setAttribute('aria-expanded','false');
  }
  function playFootstep(){
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||=new Audio();if(audioContext.state==='suspended')return;
      const now=audioContext.currentTime,osc=audioContext.createOscillator(),gain=audioContext.createGain();
      osc.type='triangle';osc.frequency.setValueAtTime(105,now);osc.frequency.exponentialRampToValueAtTime(65,now+.055);
      gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.012,now+.01);gain.gain.exponentialRampToValueAtTime(.0001,now+.075);
      osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+.08);
    }catch(_error){}
  }
  function startWalking(){clearInterval(walkTimer);walkFrame=0;renderPlayer();walkTimer=setInterval(()=>{walkFrame=(walkFrame+1)%4;renderPlayer();if(walkFrame%2===0)playFootstep();},145);}
  function stopWalking(){clearInterval(walkTimer);walkTimer=null;renderPlayer();}
  window.addEventListener('resize',()=>{renderPlayer();renderOnboardSprites();});
  async function playArrivalAction(kind){activeAction=kind;renderPlayer();playSound(kind==='water'?'water':kind==='star'?'star':'open');await new Promise(resolve=>setTimeout(resolve,1150));activeAction='';renderPlayer();}
  function dialogueClick(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext ||=new Audio();if(audioContext.state==='suspended')audioContext.resume();const t=audioContext.currentTime,o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=520+Math.random()*90;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.009,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.035);o.connect(g);g.connect(audioContext.destination);o.start(t);o.stop(t+.04);}catch(_error){}}
  function closeDialogue(){clearTimeout(dialogueTimer);clearTimeout(dialogueCollapse);welcomeDialogue.hidden=true;}
  function greetPlayer(){
    closeDialogue();welcomeDialogue.hidden=false;
    const portrait=document.getElementById('dialogueCharacter');portrait.style.backgroundImage='url("'+spriteUrl(player.gender,'idle')+'")';portrait.style.backgroundSize='auto 100%';portrait.style.backgroundPosition=((portrait.getBoundingClientRect().width-portrait.getBoundingClientRect().height)/2)+'px 0';
    const message='Chào '+accountName+'! Mừng bạn đến với '+player.gardenName+'. Hôm nay mình cùng dạo một vòng nhé?';
    const glyphs=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('vi',{granularity:'grapheme'}).segment(message)].map(x=>x.segment):Array.from(message);
    const output=document.getElementById('dialogueText');output.textContent='';let i=0;
    const type=()=>{if(i>=glyphs.length){dialogueCollapse=setTimeout(closeDialogue,2600);return;}output.textContent+=glyphs[i++];if(i%3===0)dialogueClick();dialogueTimer=setTimeout(type,31);};type();
  }
  document.getElementById('dialogueSkip').addEventListener('click',e=>{e.stopPropagation();closeDialogue();});
  welcomeDialogue.addEventListener('click',e=>e.stopPropagation());
  onboardVeil.addEventListener('click',e=>e.stopPropagation());
  onboardForm.addEventListener('submit',e=>{
    e.preventDefault();e.stopPropagation();
    const gender=new FormData(onboardForm).get('avatarGender'),gardenName=document.getElementById('gardenName').value.trim().replace(/\s+/g,' ');
    if(!['female','male'].includes(gender)||gardenName.length<2){document.getElementById('onboardError').textContent='Chọn nhân vật và đặt tên vườn ít nhất 2 chữ nhé.';return;}
    const firstVisit=!player;
    savePlayer({gender,gardenName,createdAt:player?.createdAt||Date.now()});
    if(firstVisit){grantWelcomeJace();if(checkInGarden())document.getElementById('bagToggle').classList.add('voucher-earned');}
    onboardVeil.classList.remove('open');onboardVeil.setAttribute('aria-hidden','true');renderPlayer();updateEnvironment();playSound('star');greetPlayer();
  });
  document.getElementById('emotionToggle').addEventListener('click',e=>{e.stopPropagation();const menu=document.getElementById('emotionMenu');menu.hidden=!menu.hidden;e.currentTarget.setAttribute('aria-expanded',String(!menu.hidden));playSound();});
  document.getElementById('emotionMenu').addEventListener('click',e=>{e.stopPropagation();const button=e.target.closest('[data-expression]');if(button)setExpression(button.dataset.expression);});
  const weatherMeta={sunny:['☀','Trời quang'],cloudy:['☁','Nhiều mây'],windy:['❧','Gió'],rainy:['☂','Mưa'],snowy:['❄','Tuyết']};
  const weatherCanvas=document.getElementById('weatherCanvas'),weatherCtx=weatherCanvas.getContext('2d');
  const isSafariMobile=typeof navigator!=='undefined'&&(/iP(hone|od|ad)/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||(/Safari/i.test(navigator.userAgent)&&!/Chrome|CriOS|Android/i.test(navigator.userAgent)&&('ontouchstart' in window||navigator.maxTouchPoints>0)));
  let weatherChoice='auto',timeChoice='',weatherNow='',particles=[],lastWeatherFrame=0,weatherRafId=null;
  function startWeatherLoop(){
    if(weatherRafId||document.hidden||weatherNow==='cloudy')return;
    weatherRafId=requestAnimationFrame(drawWeather);
  }
  function stopWeatherLoop(){
    if(weatherRafId){cancelAnimationFrame(weatherRafId);weatherRafId=null;}
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){stopWeatherLoop();}else{startWeatherLoop();}
  });
  const vnParts=()=>{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());return Object.fromEntries(parts.map(p=>[p.type,p.value]));};
  function scheduledWeather(parts){const slot=Math.floor(Number(parts.hour)/3),seed=Number(parts.year)*37+Number(parts.month)*23+Number(parts.day)*71+slot*13;return ['sunny','cloudy','windy','sunny','rainy','cloudy','sunny','snowy','windy','cloudy'][seed%10];}
  function updateEnvironment(){
    const p=vnParts(),hour=Number(p.hour),minute=Number(p.minute);
    const naturalPart=hour<6||hour>=19?'night':hour<8?'dawn':hour<17?'day':'dusk';
    const part=timeChoice||naturalPart;
    stage.dataset.daypart=part;
    const viewport=document.getElementById('stageViewport');
    if(viewport)viewport.dataset.daypart=part;
    document.body.dataset.daypart=part;
    document.getElementById('hourHand').style.transform='translateX(-50%) rotate('+((hour%12)*30+minute*.5)+'deg)';
    document.getElementById('minuteHand').style.transform='translateX(-50%) rotate('+(minute*6)+'deg)';
    document.getElementById('clockTime').textContent=p.hour+':'+p.minute;
    document.getElementById('gardenClock').setAttribute('aria-label','Giờ vườn '+p.hour+':'+p.minute);
    const started=player?.createdAt?gardenDay(new Date(player.createdAt)):p.year+'-'+p.month+'-'+p.day;
    const today=p.year+'-'+p.month+'-'+p.day;
    document.getElementById('gardenDayChip').textContent='Ngày '+Math.max(1,Math.floor((Date.parse(today)-Date.parse(started))/86400000)+1);
    const next=weatherChoice==='auto'?scheduledWeather(p):weatherChoice;
    if(next!==weatherNow){weatherNow=next;stage.dataset.weather=next;document.getElementById('weatherIcon').textContent=weatherMeta[next][0];document.getElementById('weatherName').textContent=weatherMeta[next][1];resetParticles();}
  }
  function resetParticles(){
    const rainyCount=isSafariMobile?40:105,snowyCount=isSafariMobile?30:72;
    const count={rainy:rainyCount,snowy:snowyCount,windy:27,cloudy:0,sunny:18}[weatherNow]||0;
    particles=Array.from({length:count},(_,i)=>({x:Math.random()*512,y:Math.random()*768,depth:.4+Math.random()*1.1,size:.7+Math.random()*1.9,speed:.65+Math.random()*.9,phase:i*.8+Math.random()*6,petal:i%4!==0}));
    if(weatherNow==='cloudy'){
      weatherCtx.clearRect(0,0,512,768);
      stopWeatherLoop();
    }else{
      startWeatherLoop();
    }
  }
  function drawWeather(time){
    weatherRafId=null;
    if(document.hidden||weatherNow==='cloudy'){
      weatherCtx.clearRect(0,0,512,768);
      return;
    }
    const frameInterval=isSafariMobile?50:32;
    if(time-lastWeatherFrame<frameInterval){
      weatherRafId=requestAnimationFrame(drawWeather);
      return;
    }
    lastWeatherFrame=time;
    weatherCtx.clearRect(0,0,512,768);
    const w=weatherNow,t=time*.001;
    for(const p of particles){
      if(w==='rainy'){
        const length=3+p.depth*7;
        weatherCtx.strokeStyle='rgba(214,231,236,'+(.13+p.depth*.17)+')';weatherCtx.lineWidth=.45+p.depth*.38;weatherCtx.lineCap='round';
        weatherCtx.beginPath();weatherCtx.moveTo(p.x,p.y);weatherCtx.lineTo(p.x-length*.32,p.y+length);weatherCtx.stroke();
        p.x-=p.speed*p.depth*.9;p.y+=p.speed*p.depth*4.7;
        if(p.y>768){p.y=-length;p.x=Math.random()*512;}
      }else if(w==='snowy'){
        p.x+=Math.sin(t*1.4+p.phase)*.3+p.depth*.13;p.y+=p.speed*p.depth*.68;
        weatherCtx.fillStyle='rgba(255,249,241,'+(.35+p.depth*.33)+')';weatherCtx.beginPath();weatherCtx.arc(p.x,p.y,p.size*p.depth*.7,0,Math.PI*2);weatherCtx.fill();
        if(p.depth>1.15){weatherCtx.strokeStyle='rgba(255,251,244,.27)';weatherCtx.lineWidth=.5;weatherCtx.beginPath();weatherCtx.moveTo(p.x-2.8,p.y);weatherCtx.lineTo(p.x+2.8,p.y);weatherCtx.moveTo(p.x,p.y-2.8);weatherCtx.lineTo(p.x,p.y+2.8);weatherCtx.stroke();}
        if(p.y>780){p.y=-15;p.x=Math.random()*512;}
      }else if(w==='windy'){
        p.x+=p.speed*p.depth*2.8;p.y+=Math.sin(t*2+p.phase)*.9+p.speed*.3;
        weatherCtx.save();weatherCtx.translate(p.x,p.y);weatherCtx.rotate(Math.sin(t*3+p.phase)*.8);
        weatherCtx.fillStyle=p.petal?'rgba(236,179,191,.6)':'rgba(202,193,142,.45)';weatherCtx.beginPath();weatherCtx.moveTo(0,-3*p.depth);weatherCtx.quadraticCurveTo(4*p.depth,-1*p.depth,1*p.depth,3*p.depth);weatherCtx.quadraticCurveTo(-3*p.depth,1*p.depth,0,-3*p.depth);weatherCtx.fill();weatherCtx.restore();
        if(p.x>535){p.x=-20;p.y=Math.random()*768;}
      }else if(w==='sunny'){
        const shimmer=.18+.18*(1+Math.sin(t*2+p.phase))/2;weatherCtx.fillStyle='rgba(255,224,169,'+shimmer+')';weatherCtx.beginPath();weatherCtx.arc(p.x,p.y,p.size*.55,0,Math.PI*2);weatherCtx.fill();p.y-=p.speed*.2;p.x+=Math.sin(t+p.phase)*.12;
        if(p.y<-20){p.y=780;p.x=Math.random()*512;}
      }
    }
    if(w==='rainy'){
      // Small rings land only on the pond or the open paved path.
      weatherCtx.strokeStyle='rgba(199,225,226,.25)';weatherCtx.lineWidth=.7;
      for(let i=0;i<12;i++){
        const pond=i<7,x=pond?319+(i*37)%178:214+(i*49)%92,y=pond?208+(i*53)%182:384+(i*73)%352;
        const radius=(t*19+i*2.7)%10;
        weatherCtx.beginPath();weatherCtx.ellipse(x,y,radius*1.5,radius*.42,0,0,Math.PI*2);weatherCtx.stroke();
      }
    }
    weatherRafId=requestAnimationFrame(drawWeather);
  }
  document.getElementById('weatherNow').addEventListener('click',e=>{e.stopPropagation();const panel=document.getElementById('weatherChoices');panel.hidden=!panel.hidden;playSound();});
  document.getElementById('weatherChoices').addEventListener('click',e=>{
    e.stopPropagation();
    const tb=e.target.closest('[data-time-choice]');
    if(tb){
      const val=tb.dataset.timeChoice;
      timeChoice=val==='auto'?'':val;
      document.querySelectorAll('[data-time-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===tb)));
      updateEnvironment();
      playSound('open');
      return;
    }
    const b=e.target.closest('[data-weather-choice]');
    if(!b)return;
    weatherChoice=b.dataset.weatherChoice;
    document.querySelectorAll('[data-weather-choice]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    updateEnvironment();
    playSound('open');
  });
  document.addEventListener('click',e=>{
    const p=document.getElementById('weatherChoices');
    if(p&&!p.hidden&&!e.target.closest('#weatherChoices')&&!e.target.closest('#weatherNow')){
      p.hidden=true;
    }
  });
  function animateRose(){
    clearBloomTimers();roseFrame(0);
    [1,2,3].forEach((frame,i)=>bloomTimers.push(setTimeout(()=>roseFrame(frame),260+i*330)));
    bloomSheet.classList.remove('celebrate');void bloomSheet.offsetWidth;bloomSheet.classList.add('celebrate');
    playSound('water');
  }
  const gardenDay=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  function flowerState(){
    try{
      const saved=JSON.parse(localStorage.getItem(flowerStorageKey));
      if(saved&&typeof saved==='object')return {
        last:typeof saved.last==='string'?saved.last:'',
        streak:Number.isSafeInteger(saved.streak)&&saved.streak>=0?saved.streak:0,
        petals:Number.isSafeInteger(saved.petals)&&saved.petals>=0?saved.petals:0
      };
    }catch(_error){}
    return flowerMemory;
  }
  function saveFlower(value){
    flowerMemory=value;
    try{localStorage.setItem(flowerStorageKey,JSON.stringify(value));}catch(_error){}
    notifyParentSync('flower',value);
  }
  const starVeil=document.getElementById('starVeil'),starSheet=starVeil.querySelector('.star-sheet');
  const starWatch=document.getElementById('starWatch'),starClose=document.getElementById('starClose');
  const starFigure=document.getElementById('starFigure'),starDust=document.getElementById('starDust');
  // New set of 12 replaces the six prototype patterns; allow one fresh preview.
  const starStorageKey='mong-mien-garden:release:v1:stars:'+accountId;
  let starMemory={last:'',total:0,shape:-1},focusBeforeStar=null;
  const constellations=[
    {name:'Bạch Dương · Aries',thought:'Có những khởi đầu đến rất khẽ, như ánh sao đầu tiên.',dots:[[87,175],[119,138],[152,116],[182,110],[213,90],[247,95]]},
    {name:'Kim Ngưu · Taurus',thought:'Cứ thong thả thôi, những điều dịu dàng vẫn ở đây.',dots:[[72,78],[113,109],[158,127],[208,111],[253,76],[208,111],[226,169],[158,127],[117,177]]},
    {name:'Song Tử · Gemini',thought:'Giữa bầu trời rộng, luôn có một ánh sáng đi cùng em.',dots:[[97,74],[103,121],[105,169],[150,188],[105,169],[206,170],[216,120],[224,76],[216,120],[103,121]]},
    {name:'Cự Giải · Cancer',thought:'Hôm nay chỉ cần một góc yên bình để nghỉ ngơi.',dots:[[96,87],[146,110],[179,141],[225,173],[179,141],[133,178]]},
    {name:'Sư Tử · Leo',thought:'Em không cần rực rỡ mọi lúc mới được nhìn thấy.',dots:[[96,146],[125,97],[174,79],[202,112],[173,141],[124,170],[96,146],[213,182]]},
    {name:'Xử Nữ · Virgo',thought:'Một việc nhỏ cũng xứng đáng được trân trọng.',dots:[[69,154],[108,102],[147,121],[188,76],[216,119],[259,144],[218,181],[171,160],[147,121]]},
    {name:'Thiên Bình · Libra',thought:'Mong đêm nay đặt lên vai em một chút bình yên.',dots:[[87,88],[158,89],[236,92],[158,89],[155,150],[94,170],[155,150],[224,172]]},
    {name:'Bọ Cạp · Scorpio',thought:'Ngay cả một ngày dài cũng có thể kết thúc thật êm.',dots:[[72,81],[105,118],[145,97],[176,135],[205,121],[237,157],[211,187],[180,174]]},
    {name:'Nhân Mã · Sagittarius',thought:'Nếu muốn đi xa, cứ mang theo một vì sao nhỏ.',dots:[[77,174],[121,127],[161,101],[235,69],[161,101],[217,139],[161,101],[148,174],[121,127]]},
    {name:'Ma Kết · Capricorn',thought:'Mỗi bước chậm đều đưa em tới một bầu trời khác.',dots:[[68,130],[112,90],[164,113],[223,80],[258,139],[212,176],[153,161],[68,130]]},
    {name:'Bảo Bình · Aquarius',thought:'Có những điều tốt lành đang lặng lẽ tìm đường đến.',dots:[[57,105],[101,83],[143,111],[187,89],[235,112],[187,89],[178,159],[132,179],[95,156]]},
    {name:'Song Ngư · Pisces',thought:'Cứ mơ thêm một chút, bầu trời vẫn đủ rộng.',dots:[[77,83],[107,114],[74,146],[107,114],[156,132],[209,121],[241,88],[209,121],[247,156]]}
  ];
  // A distinct delicate emblem sits behind each real-time constellation drawing.
  const zodiacMotifs=[
    'M160 181 V115 C151 82 123 72 108 91 C93 111 108 134 126 127 C139 123 141 108 135 101 M160 115 C169 82 197 72 212 91 C227 111 212 134 194 127 C181 123 179 108 185 101',
    'M127 104 C104 91 88 80 84 56 C104 83 122 78 139 82 M193 104 C216 91 232 80 236 56 C216 83 198 78 181 82 M127 104 C129 159 144 181 160 182 C176 181 191 159 193 104 Q160 82 127 104 Z',
    'M124 70 Q160 83 196 70 M131 174 Q160 164 189 174 M136 77 C145 104 145 143 136 168 M184 77 C175 104 175 143 184 168 M136 123 Q160 133 184 123',
    'M119 103 C111 81 132 70 148 82 C165 95 150 119 134 112 C122 108 126 95 135 96 M201 142 C209 164 188 175 172 163 C155 150 170 126 186 133 C198 137 194 150 185 149 M139 111 Q160 121 181 133',
    'M194 144 C179 180 132 175 121 141 C112 114 132 87 160 92 C181 96 185 119 171 132 C158 144 139 133 145 119 C150 110 163 113 163 122 M194 144 C224 145 231 173 215 184 Q204 192 194 181',
    'M86 91 C96 140 100 167 115 166 C131 165 125 112 127 91 M127 91 C137 140 141 167 156 166 C172 165 166 112 168 91 M168 91 C178 140 182 167 197 166 C211 164 209 129 215 114 C226 139 221 169 241 179 Q227 194 213 174',
    'M160 74 V173 M102 97 H218 M112 99 L88 143 Q106 157 124 143 Z M208 99 L190 143 Q208 157 226 143 Z M123 178 H197',
    'M77 89 C91 128 88 162 105 165 C123 166 117 113 119 89 M119 89 C133 128 130 162 147 165 C165 166 159 113 161 89 M161 89 C175 128 172 162 189 165 C201 166 206 153 209 139 C213 172 227 183 244 170 L232 159',
    'M89 179 L230 69 M188 68 H231 V111 M127 140 Q105 111 112 88 Q138 94 154 115 M127 140 Q156 162 183 153 Q178 135 154 115',
    'M107 176 C105 132 121 96 152 89 Q173 80 185 107 C166 95 151 109 160 125 C178 148 206 130 224 149 C211 150 196 161 190 178 C165 163 145 187 107 176 Z M132 100 Q119 81 108 75',
    'M84 95 C113 72 132 111 161 91 C186 72 210 110 236 87 M84 131 C113 108 132 147 161 127 C186 108 210 146 236 123 M106 164 C129 150 144 180 165 164 C189 147 205 177 225 159',
    'M87 108 C112 75 147 85 151 121 C145 151 110 158 87 130 Z M233 108 C208 75 173 85 169 121 C175 151 210 158 233 130 Z M149 121 H171 M85 111 L70 100 M235 111 L250 100 M85 130 L68 142 M235 130 L252 142'
  ];
  // Fixed positions preserve the calm sky between visits; only the observed
  // pattern is picked at random and saved with its day.
  for(let i=0;i<43;i++){
    const dot=document.createElement('i');
    const hash=n=>((Math.sin(i*78.233+n*41.13)*43758.5453)%1+1)%1;
    dot.style.cssText=`left:${6+hash(1)*88}%;top:${6+hash(2)*72}%;--s:${1+hash(3)*2}px;--o:${.3+hash(4)*.55};--d:${2+hash(5)*3}s;--delay:${-hash(6)*4}s`;
    starDust.append(dot);
  }
  function starState(){
    try{
      const saved=JSON.parse(localStorage.getItem(starStorageKey));
      if(saved&&typeof saved==='object')return {
        last:typeof saved.last==='string'?saved.last:'',
        total:Number.isSafeInteger(saved.total)&&saved.total>=0?saved.total:0,
        shape:Number.isInteger(saved.shape)&&saved.shape>=0&&saved.shape<constellations.length?saved.shape:-1
      };
    }catch(_error){}
    return starMemory;
  }
  function saveStars(state){
    starMemory=state;
    try{localStorage.setItem(starStorageKey,JSON.stringify(state));}catch(_error){}
    notifyParentSync('stars',state);
  }
  function drawConstellation(index){
    const points=constellations[index].dots;
    const ns='http://www.w3.org/2000/svg';
    starFigure.replaceChildren();
    const emblem=document.createElementNS(ns,'path');emblem.setAttribute('class','star-motif');emblem.setAttribute('d',zodiacMotifs[index]);starFigure.append(emblem);
    const path=document.createElementNS(ns,'path');
    path.setAttribute('d',points.map(([x,y],i)=>(i?'L':'M')+x+' '+y).join(' '));
    starFigure.append(path);
    points.forEach(([x,y],i)=>{
      const dot=document.createElementNS(ns,'circle');
      dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',i===0||i===points.length-1?'3.5':'2.8');
      dot.style.animationDelay=(i*.17)+'s';starFigure.append(dot);
    });
  }
  function renderStars(){
    const state=starState(),done=state.last===gardenDay()&&state.shape>=0;
    starSheet.classList.toggle('revealed',done);
    if(done){
      const chosen=constellations[state.shape];
      drawConstellation(state.shape);
      document.getElementById('starDescription').textContent=chosen.thought;
      document.getElementById('starFound').textContent='Đêm nay em gặp · '+chosen.name;
    }else{
      starFigure.replaceChildren();
      document.getElementById('starDescription').textContent='Chạm để xem bầu trời giữ lại điều gì cho em.';
      document.getElementById('starFound').textContent='';
    }
    starWatch.disabled=done;
    document.getElementById('starButtonText').textContent=done?'Đã ngắm sao hôm nay':'Ngắm sao đêm nay';
    document.getElementById('starFootnote').textContent=done?'Sao vẫn ở đây, hẹn em một đêm khác ♡':'Ngắm sao nhận 5 cánh hoa ✿';
    document.getElementById('starTotal').textContent=state.total;
  }
  function openStars(){
    focusBeforeStar=document.activeElement;renderStars();
    starVeil.classList.add('open');starVeil.setAttribute('aria-hidden','false');
    starSheet.focus({preventScroll:true});
  }
  function closeStars(){
    starVeil.classList.remove('open');starVeil.setAttribute('aria-hidden','true');
    if(focusBeforeStar&&document.contains(focusBeforeStar))focusBeforeStar.focus({preventScroll:true});
  }
  starWatch.addEventListener('click',()=>{
    const old=starState(),today=gardenDay();
    if(old.last===today)return;
    const shape=Math.floor(Math.random()*constellations.length);
    saveStars({last:today,total:old.total+1,shape});
    const flowers=flowerState();saveFlower({...flowers,petals:flowers.petals+5});
    starSheet.classList.remove('revealed');renderStars();
    playSound('star');
    status.innerHTML='<strong>Đã ngắm sao đêm nay</strong><span>+1 ngôi sao ✦ · +5 cánh hoa ✿</span>';
  });
  starClose.addEventListener('click',()=>{playSound();closeStars();});
  starVeil.addEventListener('click',e=>{e.stopPropagation();if(e.target===starVeil)closeStars();});
  starVeil.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();closeStars();}
    if(e.key==='Tab'){
      const elements=[starClose,starWatch].filter(el=>!el.disabled);
      if(!elements.includes(document.activeElement)||e.shiftKey&&document.activeElement===elements[0]||!e.shiftKey&&document.activeElement===elements.at(-1)){
        e.preventDefault();(e.shiftKey?elements.at(-1):elements[0]).focus();
      }
    }
  });
  const petKinds=[
    {id:'tan-dich-tham',name:'Tần Dịch Thâm',tag:'kiêu kỳ · nơ đen',cost:80},
    {id:'luc-hoai-can',name:'Lục Hoài Cẩn',tag:'điềm tĩnh · quyển sách',cost:80},
    {id:'chu-du-an',name:'Chu Dự An',tag:'mê game · tai nghe',cost:80},
    {id:'co-da',name:'Cố Dã',tag:'mèo rừng · khăn xanh',cost:80},
    {id:'ta-hoai-chau',name:'Tạ Hoài Châu',tag:'ragdoll · chuông bạc',cost:80},
    {id:'zane',name:'Zane',tag:'tinh nghịch · mắt xanh',cost:80},
    {id:'tieu-canh-hang',name:'Tiêu Cảnh Hằng',tag:'cổ trang · ngọc quan',cost:80},
    {id:'jace',name:'Jace',tag:'mèo chào mừng · nơ rượu',cost:80}
  ];
  const fishKinds=[
    {id:'silver',name:'Cá bạc',weight:44,joy:1,reward:0,rarity:'Thường',sellPrice:5},
    {id:'gold',name:'Cá vàng',weight:26,joy:2,reward:0,rarity:'Thường',sellPrice:5},
    {id:'koi',name:'Cá koi hoa',weight:16,joy:3,reward:0,rarity:'Thường',sellPrice:5},
    {id:'pearl',name:'Cá ngọc trai',weight:8,joy:4,reward:.15,rarity:'Hiếm',sellPrice:10},
    {id:'moon',name:'Cá ánh trăng',weight:4,joy:5,reward:.25,rarity:'Hiếm',sellPrice:10},
    {id:'star',name:'Cá đuôi sao',weight:2,joy:6,reward:.4,rarity:'Cực hiếm',sellPrice:15}
  ];
  const shopStorageKey='mong-mien-garden:release:v1:shop:'+accountId;
  const rewardStorageKey='mong-mien-garden:release:v1:rewards:'+accountId;
  let rewardMemory={vouchers:0,selected:false,lastCheckin:'',checkinStreak:0};
  function rewardState(){try{const s=JSON.parse(localStorage.getItem(rewardStorageKey));if(s&&typeof s==='object')return {vouchers:Number.isSafeInteger(s.vouchers)&&s.vouchers>=0?s.vouchers:0,selected:!!s.selected,lastCheckin:typeof s.lastCheckin==='string'?s.lastCheckin:'',checkinStreak:Number.isSafeInteger(s.checkinStreak)&&s.checkinStreak>=0?s.checkinStreak:0};}catch(_error){}return rewardMemory;}
  function saveRewards(s){rewardMemory=s;try{localStorage.setItem(rewardStorageKey,JSON.stringify(s));}catch(_error){}notifyParentSync('rewards',s);}
  function checkInGarden(){
    const today=gardenDay(),state=rewardState();
    if(state.lastCheckin===today)return false;
    const yesterday=gardenDay(new Date(Date.now()-86400000));
    state.checkinStreak=state.lastCheckin===yesterday?state.checkinStreak+1:1;
    state.lastCheckin=today;
    const earned=state.checkinStreak%7===0;
    if(earned)state.vouchers++;
    saveRewards(state);
    return earned;
  }
  function voucherDiscount(price){const s=rewardState();return s.selected&&s.vouchers>0&&price>=20?20:0;}
  function chargePetals(price,onShort){const discount=voucherDiscount(price),cost=price-discount,flowers=flowerState();if(flowers.petals<cost){onShort(cost-flowers.petals);return false;}saveFlower({...flowers,petals:flowers.petals-cost});if(discount){const s=rewardState();s.vouchers--;s.selected=false;saveRewards(s);}return true;}
  let shopMemory={rod:false,pate:0,toy:false,frames:[],equipped:'plain'},shopTab='profile',renameOpen=false;
  const shopProducts=[
    {id:'gender',tab:'profile',name:'Lọ đổi nhân vật',detail:'Đổi giữa nhân vật nam và nữ.',icon:'♧',price:20},
    {id:'rename',tab:'profile',name:'Thẻ tên khu vườn',detail:'Đặt lại tên vườn của mình.',icon:'✎',price:20},
    {id:'rod',tab:'lake',name:'Cần câu ánh trăng',detail:'Giảm hụt, tăng cơ hội gặp cá hiếm.',icon:'♧',price:120},
    ...fishKinds.map((f,i)=>({id:'fish-'+f.id,tab:'lake',name:f.name,detail:'Mua trực tiếp · một con vào giỏ.',icon:'♓',price:[18,26,39,72,105,145][i]})),
    {id:'pate',tab:'pet',name:'Pate cá thơm',detail:'Một phần ăn thay cho một con cá.',icon:'♡',price:16},
    {id:'toy',tab:'pet',name:'Bóng len tím',detail:'Đồ chơi bền, tăng niềm vui khi chơi.',icon:'✿',price:45},
    {id:'frame-plain',tab:'frame',name:'Khung nguyên bản',detail:'Trở về viền avatar mặc định.',icon:'◇',price:0},
    {id:'frame-rose',tab:'frame',name:'Viền hồng sương',detail:'Khung hoa mềm cho avatar góc trái.',icon:'✿',price:42},
    {id:'frame-moon',tab:'frame',name:'Viền ánh trăng',detail:'Khung trăng bạc cho avatar góc trái.',icon:'☾',price:52}
  ];
  function shopState(){
    try{const saved=JSON.parse(localStorage.getItem(shopStorageKey));if(saved&&typeof saved==='object')return {rod:!!saved.rod,pate:Number.isSafeInteger(saved.pate)&&saved.pate>=0?saved.pate:0,toy:!!saved.toy,frames:Array.isArray(saved.frames)?saved.frames.filter(x=>x==='rose'||x==='moon'):[],equipped:['plain','rose','moon'].includes(saved.equipped)?saved.equipped:'plain'};}catch(_error){}
    return shopMemory;
  }
  function saveShop(state){shopMemory=state;try{localStorage.setItem(shopStorageKey,JSON.stringify(state));}catch(_error){}applyShopFrame();notifyParentSync('shop',state);}
  function applyShopFrame(){const frame=shopState().equipped;portraitDock.classList.toggle('frame-rose',frame==='rose');portraitDock.classList.toggle('frame-moon',frame==='moon');}
  const bagVeil=document.getElementById('bagVeil'),bagList=document.getElementById('bagList');
  let bagFocus=null,pendingBagStation='';
  function renderBag(){
    const goods=shopState(),fish=fishState(),flowers=flowerState();
    const checkins=rewardState().checkinStreak;
    document.getElementById('bagSummary').textContent=flowers.petals+' ✿ cánh hoa · '+fishTotal(fish)+' cá · điểm danh '+(checkins?((checkins-1)%7+1):0)+'/7';
    const item=(picture,name,detail,action='',label='')=>'<article class="bag-item"><img src="assets/'+picture+'.webp" alt=""><span><strong>'+name+'</strong><small>'+detail+'</small></span>'+(action?'<button type="button" data-bag-use="'+action+'">'+label+'</button>':'')+'</article>';
    const rows=[];
    if(goods.rod)rows.push(item('moon-rod','Cần câu ánh trăng','Đang trang bị · tăng cơ hội gặp cá hiếm','lake','Đến hồ'));
    if(goods.pate)rows.push(item('pate-tin','Pate cá thơm','Còn '+goods.pate+' phần · dùng ở bát ăn','feed','Cho bé ăn'));
    if(goods.toy)rows.push(item('violet-yarn','Bóng len tím','Dùng ở góc đồ chơi · không tiêu hao','play','Chơi với bé'));
    const rewards=rewardState();
    if(rewards.vouchers)rows.push(item('voucher-7day-20','Phiếu 7 ngày · giảm 20 ✿','×'+rewards.vouchers+' · áp dụng một lần cho món từ 20 ✿','voucher',rewards.selected?'Bỏ chọn':'Dùng lần tới'));
    if(goods.equipped!=='plain')rows.push('<article class="bag-item"><span class="bag-plain-art" aria-hidden="true">◇</span><span><strong>Khung nguyên bản</strong><small>Đổi về viền avatar ban đầu</small></span><button type="button" data-bag-use="plain">Trang bị</button></article>');
    for(const frame of goods.frames){
      const rose=frame==='rose';
      rows.push(item(rose?'rose-frame':'moon-frame',rose?'Viền hồng sương':'Viền ánh trăng',goods.equipped===frame?'Đang dùng trên avatar':'Khung avatar đã sở hữu',frame,'Trang bị'));
    }
    for(const kind of fishKinds){
      const count=fish.counts[kind.id]||0;
      if(count)rows.push('<article class="bag-item"><i class="fish-mini fish-'+kind.id+'" aria-hidden="true"></i><span><strong>'+kind.name+'</strong><small>×'+count+' · dùng ở bát ăn</small></span><button type="button" data-bag-use="feed">Cho bé ăn</button></article>');
    }
    if(fish.seaweed)rows.push('<article class="bag-item"><img src="assets/pond-weed.webp" alt=""><span><strong>Rong</strong><small>×'+fish.seaweed+' · bán ở hồ</small></span><button type="button" data-bag-use="lake">Đến hồ</button></article>');
    bagList.innerHTML=rows.length?rows.join(''):'<p class="bag-empty">Túi đang trống. Ghé tiệm nhỏ hoặc thử thả câu nhé ✧</p>';
  }
  function openBag(){bagFocus=document.activeElement;renderBag();const earned=document.getElementById('bagToggle').classList.contains('voucher-earned');document.getElementById('bagNotice').textContent=earned?'Điểm danh đủ 7 ngày! Phiếu giảm 20 ✿ đã tự vào túi của em.':'';document.getElementById('bagToggle').classList.remove('voucher-earned');bagVeil.classList.add('open');bagVeil.setAttribute('aria-hidden','false');bagVeil.querySelector('.bag-sheet').focus({preventScroll:true});playSound('open');}
  function closeBag(){bagVeil.classList.remove('open');bagVeil.setAttribute('aria-hidden','true');if(bagFocus&&document.contains(bagFocus))bagFocus.focus({preventScroll:true});}
  document.getElementById('bagToggle').addEventListener('click',e=>{e.stopPropagation();openBag();});
  document.getElementById('bagClose').addEventListener('click',()=>{closeBag();playSound();});
  bagVeil.addEventListener('click',e=>{e.stopPropagation();if(e.target===bagVeil)closeBag();});
  bagVeil.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeBag();}if(e.key==='Tab'){const buttons=[...bagVeil.querySelectorAll('button:not(:disabled)')];if(!buttons.includes(document.activeElement)||e.shiftKey&&document.activeElement===buttons[0]||!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();(e.shiftKey?buttons.at(-1):buttons[0]).focus();}}});
  bagList.addEventListener('click',e=>{
    const button=e.target.closest('[data-bag-use]');if(!button)return;
    const action=button.dataset.bagUse;
    if(action==='voucher'){const s=rewardState();if(!s.vouchers)return;s.selected=!s.selected;saveRewards(s);renderBag();document.getElementById('bagNotice').textContent=s.selected?'Lần mua hoặc đón bé tới được giảm 20 ✿.':'Đã bỏ chọn phiếu.';playSound('star');return;}
    if(action==='rose'||action==='moon'||action==='plain'){
      const goods=shopState();goods.equipped=action;saveShop(goods);renderBag();document.getElementById('bagNotice').textContent='Đã đổi khung avatar ✧';playSound('star');return;
    }
    if((action==='feed'||action==='play')&&!petState().owned.length){document.getElementById('bagNotice').textContent='Chưa có bé mèo nào trong cottage. Ghé đồng cỏ đón bé trước nhé.';return;}
    pendingBagStation=action==='feed'||action==='play'?action:'';
    closeBag();travel(action==='lake'?'fishDeck':'rightExit');
  });
  const shopVeil=document.getElementById('shopVeil'),shopList=document.getElementById('shopList');let shopFocus=null;
  function shopNotice(message){document.getElementById('shopNotice').textContent=message;}
  function renderShop(){
    const state=shopState(),balance=flowerState().petals;
    document.getElementById('shopBalance').textContent=balance+' ✿';
    document.querySelectorAll('[data-shop-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.shopTab===shopTab)));
    shopList.innerHTML=shopProducts.filter(p=>p.tab===shopTab).map(p=>{
      const frame=p.id.startsWith('frame-')?p.id.slice(6):null,owned=frame&&(frame==='plain'||state.frames.includes(frame)),equipped=frame&&state.equipped===frame;
      const fixed=p.id==='rod'&&state.rod||p.id==='toy'&&state.toy;
      let button=equipped?'Đang dùng':owned?'Trang bị':fixed?'Đã có':p.price+' ✿';
      const detail=p.id==='pate'?p.detail+' Trong túi: '+state.pate:p.detail;
      const art={rod:'moon-rod',pate:'pate-tin',toy:'violet-yarn','frame-rose':'rose-frame','frame-moon':'moon-frame'}[p.id];
      const icon=art?'<img class="shop-icon shop-item-art" src="assets/'+art+'.webp" alt="">':p.id.startsWith('fish-')?'<i class="shop-icon shop-fish fish-mini fish-'+p.id.slice(5)+'" aria-hidden="true"></i>':'<span class="shop-icon '+(frame?'frame-'+frame:'')+'" aria-hidden="true">'+p.icon+'</span>';
      const offer=!owned&&!fixed?voucherDiscount(p.price):0;
      if(offer)button=(p.price-offer)+' ✿ · phiếu';
      return '<article class="shop-item">'+icon+'<div class="shop-item-copy"><strong>'+p.name+'</strong><small>'+detail+'</small></div><button class="shop-buy'+(owned&&!equipped?' equip':'')+'" type="button" data-shop-buy="'+p.id+'"'+(equipped||fixed?' disabled':'')+'>'+button+'</button>'+(p.id==='rename'?'<div class="shop-rename" id="shopRename"'+(!renameOpen?' hidden':'')+'><input id="shopNameInput" maxlength="32" aria-label="Tên vườn mới" placeholder="Tên vườn mới"><button type="button" data-shop-save-name>Lưu · '+(20-voucherDiscount(20))+' ✿</button></div>':'')+'</article>';
    }).join('');
  }
  function payPetals(price){return chargePetals(price,missing=>shopNotice('Còn thiếu '+missing+' ✿. Chăm hoa hoặc bán cá để tích thêm nhé.'));}
  function openShop(){shopFocus=document.activeElement;shopTab='profile';renameOpen=false;shopNotice('');renderShop();shopVeil.classList.add('open');shopVeil.setAttribute('aria-hidden','false');shopVeil.querySelector('.shop-sheet').focus({preventScroll:true});playSound('open');}
  function closeShop(){shopVeil.classList.remove('open');shopVeil.setAttribute('aria-hidden','true');if(shopFocus&&document.contains(shopFocus))shopFocus.focus({preventScroll:true});}
  document.getElementById('shopToggle').addEventListener('click',e=>{e.stopPropagation();openShop();});
  document.getElementById('shopClose').addEventListener('click',()=>{closeShop();playSound();});
  shopVeil.addEventListener('click',e=>{e.stopPropagation();if(e.target===shopVeil)closeShop();});
  shopVeil.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeShop();}});
  document.getElementById('shopTabs').addEventListener('click',e=>{const b=e.target.closest('[data-shop-tab]');if(!b)return;shopTab=b.dataset.shopTab;renameOpen=false;shopNotice('');renderShop();playSound();});
  shopList.addEventListener('click',e=>{
    const save=e.target.closest('[data-shop-save-name]');
    if(save){const name=document.getElementById('shopNameInput').value.trim().replace(/\s+/g,' ');if(name.length<2){shopNotice('Tên vườn cần ít nhất 2 ký tự.');return;}if(name===player.gardenName){shopNotice('Tên vườn vẫn như cũ.');return;}if(!payPetals(20))return;savePlayer({...player,gardenName:name});document.getElementById('gardenName').value=name;renameOpen=false;renderShop();shopNotice('Khu vườn giờ tên là “'+name+'” ♡');playSound('star');return;}
    const b=e.target.closest('[data-shop-buy]');if(!b)return;const id=b.dataset.shopBuy,p=shopProducts.find(x=>x.id===id);if(!p)return;
    if(id==='rename'){renameOpen=true;renderShop();document.getElementById('shopNameInput').focus();return;}
    const state=shopState(),frame=id.startsWith('frame-')?id.slice(6):null;
    if(frame&&(frame==='plain'||state.frames.includes(frame))){state.equipped=frame;saveShop(state);renderShop();shopNotice('Đã đổi khung avatar.');playSound();return;}
    if(!payPetals(p.price))return;
    if(id==='gender'){savePlayer({...player,gender:player.gender==='female'?'male':'female'});renderPlayer();renderOnboardSprites();shopNotice('Nhân vật đã đổi rồi ✧');}
    else if(id==='rod'){state.rod=true;saveShop(state);shopNotice('Cần câu ánh trăng đã sẵn sàng bên hồ.');}
    else if(id.startsWith('fish-')){const kind=id.slice(5),fish=fishState();fish.counts[kind]=(fish.counts[kind]||0)+1;saveFish(fish);shopNotice('Đã cất '+p.name+' vào giỏ.');}
    else if(id==='pate'){state.pate++;saveShop(state);shopNotice('Đã thêm một phần pate vào tủ của pet.');}
    else if(id==='toy'){state.toy=true;saveShop(state);shopNotice('Bóng len đã nằm trong cottage.');}
    else if(frame){state.frames.push(frame);state.equipped=frame;saveShop(state);shopNotice('Khung mới đã lên avatar ♡');}
    renderShop();playSound('star');
  });
  const petIdleAsset=id=>window.MONG_PET_ASSETS?.[id]?.idle||'assets/pets/'+id+'-idle-anim.webp';
  const petStateAsset=(id,state)=>window.MONG_PET_ASSETS?.[id]?.[state]||'assets/pets/'+id+'-'+state+'.webp';
  const petPlayAsset=id=>window.MONG_PET_ASSETS?.[id]?.play||'assets/pets/'+id+(id==='chu-du-an'?'-play-v2.webp':'-play.webp');
  const fishVeil=document.getElementById('fishVeil'),petVeil=document.getElementById('petVeil'),cottageVeil=document.getElementById('cottageVeil');
  const fishCast=document.getElementById('fishCast'),fishSheet=fishVeil.querySelector('.fish-sheet');
  const petGrid=document.getElementById('petGrid'),petSelector=document.getElementById('petSelector');
  const cottagePet=document.getElementById('cottagePet'),careGrid=document.getElementById('careGrid');
  const fishStorageKey='mong-mien-garden:release:v1:fish:'+accountId,petStorageKey='mong-mien-garden:release:v1:pets:'+accountId;
  let fishMemory={counts:{},casts:0,lastDay:'',usedToday:0,seaweed:0},petMemory={owned:[],displayed:[],selected:'',care:{},needs:{}},activityFocus=null,petPoseTimer=null,casting=false,cottageStation='',rosterOpen=false,lastMeowAt=0;
  function fishState(){
    try{
      const saved=JSON.parse(localStorage.getItem(fishStorageKey));
      if(saved&&typeof saved==='object')return {
        counts:Object.fromEntries(fishKinds.map(f=>[f.id,Number.isSafeInteger(saved.counts?.[f.id])&&saved.counts[f.id]>=0?saved.counts[f.id]:0])),
        casts:Number.isSafeInteger(saved.casts)&&saved.casts>=0?saved.casts:0,
        lastDay:typeof saved.lastDay==='string'?saved.lastDay:'',
        usedToday:Number.isSafeInteger(saved.usedToday)&&saved.usedToday>=0?saved.usedToday:0,
        seaweed:Number.isSafeInteger(saved.seaweed)&&saved.seaweed>=0?saved.seaweed:0
      };
    }catch(_error){}
    return fishMemory;
  }
  function todayFish(state){if(state.lastDay!==gardenDay()){state.lastDay=gardenDay();state.usedToday=0;}return state;}
  function saveFish(state){fishMemory=state;try{localStorage.setItem(fishStorageKey,JSON.stringify(state));}catch(_error){}notifyParentSync('fish',state);}
  function petState(){
    try{
      const raw=localStorage.getItem(petStorageKey)||localStorage.getItem('mong-mien-garden:release:v1:pet:'+accountId);
      const saved=raw?JSON.parse(raw):null;
      if(saved&&typeof saved==='object'){
        const owned=Array.isArray(saved.owned)?saved.owned.filter(id=>petKinds.some(p=>p.id===id)):[];
        return {
        owned,
        displayed:Array.isArray(saved.displayed)?[...new Set(saved.displayed.filter(id=>owned.includes(id)))].slice(0,5):owned.slice(0,5),
        selected:typeof saved.selected==='string'?saved.selected:'',
        care:saved.care&&typeof saved.care==='object'?saved.care:{},
        needs:saved.needs&&typeof saved.needs==='object'?saved.needs:{}
      };}
    }catch(_error){}
    return petMemory;
  }
  function savePets(state){
    petMemory=state;
    try{
      const serialized=JSON.stringify(state);
      localStorage.setItem(petStorageKey,serialized);
      localStorage.setItem('mong-mien-garden:release:v1:pet:'+accountId,serialized);
    }catch(_error){}
    notifyParentSync('pet',state);
  }
  function ensureAdminJaceGrant(){
    const targetEmail='meinguyen18@gmail.com';
    const isTargetAdmin=accountEmail===targetEmail||accountId==='meinguyen18'||accountId==='admin_meimei';
    if(!isTargetAdmin)return;

    const state=petState();
    if(state.owned.includes('jace'))return;

    // Cấp Jace một lần cho meinguyen18@gmail.com dù vườn đã tạo trước đó
    state.owned.push('jace');
    if(state.displayed.length<5&&!state.displayed.includes('jace')){
      state.displayed.push('jace');
    }
    if(!state.needs.jace){
      state.needs.jace={feed:Date.now()-6*3600000,water:Date.now()-4*3600000,play:Date.now()-1*3600000,sleep:Date.now()-6*3600000,happiness:0};
    }
    // Giữ nguyên dữ liệu và bé đang chọn:
    // Nếu trước đó chưa chọn bé nào hoặc bé đang chọn không hợp lệ, mới gán mặc định
    if(!state.selected||!state.owned.includes(state.selected)){
      state.selected=state.owned[0]||'jace';
    }
    savePets(state);
  }
  function grantWelcomeJace(){
    // The onboarding form runs once for a newly created garden. Existing accounts are left untouched.
    const state=petState();if(state.owned.includes('jace'))return;
    state.owned.push('jace');if(state.displayed.length<5)state.displayed.push('jace');
    if(!state.selected)state.selected='jace';
    state.needs.jace=state.needs.jace||{feed:Date.now()-6*3600000,water:Date.now()-4*3600000,play:Date.now()-1*3600000,sleep:Date.now()-6*3600000,happiness:0};
    savePets(state);
  }
  function getPetRoster(){
    ensureAdminJaceGrant();
    return petState();
  }
  const careCooldown={feed:3,water:2,play:1,sleep:6};
  function needsFor(state,id){
    const existing=state.needs[id];
    if(existing&&typeof existing==='object')return existing;
    const now=Date.now();
    state.needs[id]={feed:now-6*3600000,water:now-4*3600000,play:now-1*3600000,sleep:now-6*3600000};savePets(state);
    return state.needs[id];
  }
  function hoursSince(timestamp){return Math.max(0,(Date.now()-Number(timestamp||Date.now()))/3600000);}
  const moodIcons={vui:'✦',buồn:'☁',chán:'◌',khóc:'❧',nhớ:'☾',iu:'♡',ghét:'✕',chảnh:'♛'};
  function petMood(needs,id){
    const hungry=hoursSince(needs.feed),thirsty=hoursSince(needs.water),lonely=hoursSince(needs.play);
    let label,line,className='happy';
    if(hungry>=12||thirsty>=9){label=id==='tan-dich-tham'?'ghét':'khóc';line='Bé đang rất đói hoặc khát.';className='grumpy';}
    else if(hungry>=9||thirsty>=7){label='khóc';line='Bé đang chờ em chăm.';className='crying';}
    else if(hungry>=6||thirsty>=4){label='buồn';line='Bé muốn một bữa cá hoặc nước mát.';className='sad';}
    else if(lonely>=10){label='nhớ';line='Bé nhớ em, muốn được chơi cùng.';className='sad';}
    else if(lonely>=5){label='chán';line='Bé đang nhìn món đồ chơi mãi.';className='sad';}
    else if(lonely<1.5){label='iu';line='Bé vừa được chơi cùng em ♡';}
    else if(Number(needs.happiness)>=4&&needs.joyAt&&hoursSince(needs.joyAt)<4){label='vui';line='Bé vui vẻ sau bữa cá ngon.';}
    else if(id==='tan-dich-tham'){label='chảnh';line='Bé vờ như không để ý, nhưng vẫn nhìn theo em.';}
    else {label='vui';line='Bé đang thư thả trong nhà.';}
    return {label,line,className,icon:moodIcons[label]};
  }
  function careCooldownFor(id,action){
    if(action==='feed'&&id==='tan-dich-tham')return 4;
    if(action==='feed'&&id==='chu-du-an')return 2.5;
    if(action==='sleep'&&id==='tan-dich-tham')return 7;
    return careCooldown[action];
  }
  function careReadiness(needs,id,action){
    const next=Number(needs[action]||0)+careCooldownFor(id,action)*3600000;
    if(next>Date.now())return {ready:false,next,reason:{feed:'Bé đã ăn no, chưa muốn thêm cá.',water:'Bé chưa khát nước.',play:'Bé vừa chơi xong, đang nghỉ một chút.',sleep:'Bé ngủ đủ giấc rồi, thử chơi cùng bé nhé.'}[action]};
    if(action==='water'&&hoursSince(needs.feed)<1.5&&hoursSince(needs.water)<4)return {ready:false,next:Math.min(Number(needs.feed)+1.5*3600000,Number(needs.water)+4*3600000),reason:'Vừa ăn no nên bé chưa muốn uống. Thử chơi cùng bé nhé.'};
    return {ready:true,next:Date.now(),reason:''};
  }
  function playMeow(){
    if(Date.now()-lastMeowAt<30000)return;lastMeowAt=Date.now();
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      audioContext ||=new Audio();if(audioContext.state==='suspended')audioContext.resume();
      const osc=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime;
      osc.type='triangle';osc.frequency.setValueAtTime(540,now);osc.frequency.exponentialRampToValueAtTime(760,now+.15);osc.frequency.exponentialRampToValueAtTime(390,now+.48);
      gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.028,now+.07);gain.gain.exponentialRampToValueAtTime(.0001,now+.53);
      osc.connect(gain);gain.connect(audioContext.destination);osc.start(now);osc.stop(now+.54);
    }catch(_error){}
  }
  function fishTotal(state=fishState()){return fishKinds.reduce((n,f)=>n+(state.counts[f.id]||0),0);}
  function renderFish(){
    const state=todayFish(fishState());
    fishSheet.classList.toggle('rod-upgraded',shopState().rod);
    document.getElementById('fishRemaining').textContent='Hôm nay còn '+Math.max(0,5-state.usedToday)+'/5 lượt câu';
    document.getElementById('fishSeaweed').textContent=state.seaweed;
    document.getElementById('fishSell').disabled=!state.seaweed;
    fishCast.disabled=casting||state.usedToday>=5;
    fishCast.querySelector('span').textContent=state.usedToday>=5?'Hẹn hồ ngày mai':'Thả câu';
    document.getElementById('fishCount').textContent=fishTotal(state);
    const caught=fishKinds.filter(f=>state.counts[f.id]>0);
    document.getElementById('fishInventory').innerHTML=caught.length
      ?caught.map(f=>'<span class="fish-token"><i class="fish-mini fish-'+f.id+'" aria-hidden="true"></i><span>'+f.name+' <small>· '+f.rarity+'</small></span> <b>×'+state.counts[f.id]+'</b><button type="button" data-sell-fish="'+f.id+'" aria-label="Bán một '+f.name+' lấy '+f.sellPrice+' cánh hoa">Bán 1 · +'+f.sellPrice+' ✿</button></span>').join('')
      :'<span class="fish-token">Giỏ còn trống · thử thả câu nhé</span>';
  }
  function renderPetGrid(){
    const state=getPetRoster(),petals=flowerState().petals;
    document.getElementById('petPetals').textContent=petals;
    petGrid.innerHTML=petKinds.map(p=>{
      const owned=state.owned.includes(p.id);
      return '<article class="pet-card'+(owned?' owned':'')+'"><button class="pet-card-open" type="button" data-info="'+p.id+'" aria-label="Xem '+p.name+'"><img class="pet-idle" src="'+petIdleAsset(p.id)+'" alt=""><strong>'+p.name+'</strong><small>'+p.tag+'</small></button><button class="pet-adopt" type="button" data-adopt="'+p.id+'"'+(owned||p.id==='jace'?' disabled':'')+'>'+(owned?'Đã có':p.id==='jace'?'Quà người mới':'Đổi '+(p.cost-voucherDiscount(p.cost))+' ✿')+'</button></article>';
    }).join('');
  }
  function renderPetProfile(id){
    const pet=petKinds.find(p=>p.id===id),detail=document.getElementById('petDetail');if(!pet)return;
    const habits={
      'tan-dich-tham':['Thức muộn, thích nằm cuộn trong chăn nhung.','Cá mềm và một bát nước mát.','Vờ kiêu kỳ nhưng thích vờn dây nơ đen.'],
      'luc-hoai-can':['Ngủ sớm cạnh chồng sách.','Ăn chậm và thường tự đến bát nước.','Biết làm toán bằng cách đẩy đúng ba hạt đậu.'],
      'chu-du-an':['Hay ngủ trưa, tối lại tỉnh như sáo.','Cá và nước trong chiếc bát ngôi sao.','Mê bộ điều khiển màu tím và bóng len.'],
      'co-da':['Dạo quanh đồng cỏ vào chiều muộn.','Thích cá bạc và nước mát.','Dễ vui khi được chạy chơi.'],
      'ta-hoai-chau':['Thích nằm cạnh cửa sổ đón nắng.','Ăn cá chậm rãi, kén bát nước.','Chỉ chơi khi tự mình thấy hứng thú.'],
      'zane':['Hay lén vờn chiếc nơ rồi làm như vô tội.','Thích cá vàng, nước sạch.','Ngủ ít nhưng luôn tìm chỗ ấm.'],
      'tieu-canh-hang':['Ngủ ngay ngắn trên đệm gấm.','Ăn gọn ghẽ và thích nước mát.','Thích đùa với tua ngọc khi không ai nhìn.'],
      'jace':['Bé đầu tiên chào em tới vườn.','Ăn cá vừa đủ, thích bát nước sạch.','Thích vờn ruy băng màu hồng.']
    };
    const play=petPlayAsset(id),owned=petState().owned.includes(id),effective=pet.cost-voucherDiscount(pet.cost),missing=Math.max(0,effective-flowerState().petals);
    detail.innerHTML='<button class="pet-profile-close" type="button" data-hide-detail aria-label="Đóng hồ sơ">×</button><h3>'+pet.name+'</h3><p class="pet-profile-tag">'+pet.tag+'</p><div class="pet-poses"><figure><img src="'+petStateAsset(id,'sleep')+'" alt="'+pet.name+' đang ngủ"><figcaption>Ngủ</figcaption></figure><figure><img src="'+petStateAsset(id,'feed')+'" alt="'+pet.name+' đang ăn"><figcaption>Ăn</figcaption></figure><figure><img src="'+petStateAsset(id,'water')+'" alt="'+pet.name+' đang uống"><figcaption>Uống</figcaption></figure><figure><img src="'+play+'" alt="'+pet.name+' đang chơi"><figcaption>Chơi</figcaption></figure></div><div class="pet-profile-notes">'+habits[id].map(t=>'<p>✧ '+t+'</p>').join('')+'</div><p class="pet-profile-price">'+(owned?'Bé đã có một mái nhà':id==='jace'?'Bé là quà chào mừng người mới':missing?'Còn thiếu '+missing+' ✿ để đón bé':'Đã đủ '+effective+' ✿ để đón bé')+'</p>';
    detail.innerHTML+='<button class="profile-adopt" type="button" data-adopt-profile="'+id+'"'+(owned||id==='jace'?' disabled':'')+'>'+(owned?'Bé đã ở cottage':id==='jace'?'Quà dành cho người mới':'Đón bé về · '+effective+' ✿')+'</button>';
    detail.hidden=false;detail.dataset.pet=id;petGrid.setAttribute('inert','');petVeil.querySelector('.activity-close').setAttribute('inert','');detail.querySelector('.pet-profile-close').focus({preventScroll:true});
  }
  function closePetProfile(){
    const detail=document.getElementById('petDetail'),id=detail.dataset.pet;detail.hidden=true;detail.removeAttribute('data-pet');petGrid.removeAttribute('inert');petVeil.querySelector('.activity-close').removeAttribute('inert');
    const opener=petGrid.querySelector('[data-info="'+id+'"]');if(opener)opener.focus({preventScroll:true});
  }
  function selectPet(state){return state.owned.includes(state.selected)?state.selected:state.owned[0];}
  function setPetPose(id,pose){
    cottagePet.className='cottage-pet pose-'+pose;
    cottagePet.style.backgroundImage='url("'+(pose==='play'?petPlayAsset(id):petStateAsset(id,pose))+'")';
  }
  function careTime(readiness){
    const next=readiness.next;
    if(next<=Date.now())return 'Sẵn sàng';
    const minutes=Math.ceil((next-Date.now())/60000);
    const time=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit'}).format(new Date(next));
    return 'Lại lúc '+time+' · còn '+Math.floor(minutes/60)+'g '+String(minutes%60).padStart(2,'0')+'p';
  }
  function renderCottage(){
    clearTimeout(petPoseTimer);cottagePet.hidden=true;
    const state=getPetRoster(),id=selectPet(state),actions=document.getElementById('cottageActions');
    const find=document.getElementById('cottageFind');find.hidden=!!id;
    cottageVeil.querySelectorAll('.cottage-hotspot').forEach(button=>button.disabled=!state.displayed.length);
    const residents=document.getElementById('cottageResidents');
    residents.innerHTML=state.displayed.map((pid,i)=>{
      const pet=petKinds.find(p=>p.id===pid),mood=petMood(needsFor(state,pid),pid);
      return '<button class="cottage-resident slot-'+i+' '+mood.className+'" data-select-pet="'+pid+'" type="button" aria-label="'+pet.name+' · '+mood.label+'"><img class="pet-idle" src="'+petIdleAsset(pid)+'" alt=""></button>';
    }).join('');
    const manager=document.getElementById('cottageManage'),roster=document.getElementById('cottageRoster');
    manager.textContent='Bày trong nhà · '+state.displayed.length+'/5 ✧';manager.setAttribute('aria-expanded',String(rosterOpen));roster.hidden=!rosterOpen;
    roster.innerHTML='<p>Chọn tối đa 5 bé ở trong phòng. Bé chưa bày vẫn thuộc về em.</p>'+state.owned.map(pid=>{
      const p=petKinds.find(x=>x.id===pid),visible=state.displayed.includes(pid);
      return '<button type="button" data-display-pet="'+pid+'" aria-pressed="'+visible+'">'+(visible?'✓ ':'＋ ')+p.name+'</button>';
    }).join('');
    if(!id){
      actions.hidden=true;petSelector.replaceChildren();careGrid.replaceChildren();
      document.getElementById('cottageMessage').textContent='Căn phòng đã sẵn sàng. Ra đồng cỏ gặp một bé mèo nhé.';
      document.getElementById('cottageNotice').textContent='Chạm vào các góc phòng để xem chỗ ăn, uống, ngủ và chơi.';
      return;
    }
    const pet=petKinds.find(p=>p.id===id),needs=needsFor(state,id),mood=petMood(needs,id);
    document.getElementById('cottageMessage').textContent=pet.name+' · '+mood.line;
    if(!cottageStation){actions.hidden=true;document.getElementById('cottageNotice').textContent='Chạm bát ăn, bát nước, đồ chơi hoặc giường trong phòng.';return;}
    actions.hidden=false;
    const labels={feed:'Bát ăn',water:'Bát nước',play:'Đồ chơi',sleep:'Giường ngủ'};
    const readiness=careReadiness(needs,id,cottageStation);
    petSelector.innerHTML='<div class="care-topline"><span>✧ '+labels[cottageStation]+'</span><time>'+careTime(readiness)+'</time></div><label for="cottagePetSelect">Chăm bé <select id="cottagePetSelect">'+state.owned.map(pid=>{
      const p=petKinds.find(x=>x.id===pid);
      return '<option value="'+pid+'"'+(pid===id?' selected':'')+'>'+p.name+'</option>';
    }).join('')+'</select></label><div class="pet-feeling mood-'+mood.label+'" role="status" aria-label="Tâm trạng '+pet.name+': '+mood.label+'"><span class="feeling-icon" aria-hidden="true">'+mood.icon+'</span><span><strong>'+mood.label+'</strong><small>'+mood.line+'</small></span></div>';
    const actionText={feed:'Cho '+pet.name+' ăn',water:'Cho '+pet.name+' uống nước',play:'Chơi cùng '+pet.name,sleep:'Cho '+pet.name+' nghỉ'}[cottageStation];
    if(cottageStation==='feed'){
      const inventory=fishState(),pate=shopState().pate;
      careGrid.innerHTML='<p class="fish-choice-label">Chọn một món cho '+pet.name+' · giỏ có '+fishTotal(inventory)+' cá</p><div class="feed-fishes">'+fishKinds.map(f=>'<button type="button" data-feed-fish="'+f.id+'"'+(!readiness.ready||!inventory.counts[f.id]?' disabled':'')+'><i class="fish-mini fish-'+f.id+'" aria-hidden="true"></i><span>'+f.name+'<small>Vui +'+f.joy+(f.reward?' · có thể +1 ✿':'')+'</small></span><b>×'+(inventory.counts[f.id]||0)+'</b></button>').join('')+'<button type="button" data-feed-pate'+(!readiness.ready||!pate?' disabled':'')+'><img class="care-item-art" src="assets/pate-tin.webp" alt=""><span>Pate cá thơm<small>Vui +3 · mua trong tiệm</small></span><b>×'+pate+'</b></button></div>';
    }else if(cottageStation==='play'){
      careGrid.innerHTML='<p class="fish-choice-label">Chọn cách chơi với '+pet.name+'</p><div class="play-choices"><button type="button" data-care="play" data-toy="none"'+(!readiness.ready?' disabled':'')+'><span class="play-hand" aria-hidden="true">♡</span><span>Chơi cùng bé<small>Không cần đồ chơi</small></span></button><button type="button" data-care="play" data-toy="yarn"'+(!readiness.ready||!shopState().toy?' disabled':'')+'><img src="assets/violet-yarn.webp" alt=""><span>Bóng len tím<small>'+(shopState().toy?'Vui thêm +2 · không tiêu hao':'Mua ở tiệm nhỏ')+'</small></span></button></div>';
    }else careGrid.innerHTML='<button type="button" data-care="'+cottageStation+'"'+(!readiness.ready?' disabled':'')+'>'+actionText+'<small>'+(!readiness.ready?readiness.reason:'Chạm để chăm bé')+'</small></button>';
    document.getElementById('cottageNotice').textContent=readiness.reason||mood.line;
  }
  function openActivity(veil){
    activityFocus=document.activeElement;
    if(veil===fishVeil)renderFish();
    if(veil===petVeil)renderPetGrid();
    if(veil===cottageVeil){cottageStation=pendingBagStation;pendingBagStation='';renderCottage();const state=petState();if(state.owned.some(id=>petMood(needsFor(state,id),id).className!=='happy'))playMeow();}
    veil.classList.add('open');veil.setAttribute('aria-hidden','false');
    veil.querySelector('.activity-sheet').focus({preventScroll:true});
  }
  function closeActivity(veil){
    veil.classList.remove('open');veil.setAttribute('aria-hidden','true');
    clearTimeout(petPoseTimer);cottagePet.hidden=true;
    if(veil===petVeil&&!document.getElementById('petDetail').hidden)closePetProfile();
    if(activityFocus&&document.contains(activityFocus))activityFocus.focus({preventScroll:true});
  }
  for(const veil of [fishVeil,petVeil,cottageVeil]){
    veil.addEventListener('click',e=>{e.stopPropagation();if(e.target===veil)closeActivity(veil);});
    veil.querySelector('.activity-close').addEventListener('click',()=>{playSound();closeActivity(veil);});
    veil.addEventListener('keydown',e=>{
      if(veil===petVeil&&!document.getElementById('petDetail').hidden){
        if(e.key==='Escape'){e.preventDefault();closePetProfile();return;}
        if(e.key==='Tab'){const els=[...document.querySelectorAll('#petDetail button:not(:disabled)')];const first=els[0],last=els.at(-1);if(!els.includes(document.activeElement)||e.shiftKey&&document.activeElement===first||!e.shiftKey&&document.activeElement===last){e.preventDefault();(e.shiftKey?last:first).focus();}return;}
      }
      if(e.key==='Escape'){e.preventDefault();closeActivity(veil);}
      if(e.key==='Tab'){
        const els=[...veil.querySelectorAll('button:not(:disabled):not([hidden])')];
        if(!els.includes(document.activeElement)||e.shiftKey&&document.activeElement===els[0]||!e.shiftKey&&document.activeElement===els.at(-1)){
          e.preventDefault();(e.shiftKey?els.at(-1):els[0]).focus();
        }
      }
    });
  }
  fishCast.addEventListener('click',()=>{
    if(casting||todayFish(fishState()).usedToday>=5)return;
    casting=true;fishCast.disabled=true;fishSheet.classList.add('casting');
    const catchVisual=document.getElementById('fishCatchVisual');catchVisual.className='fish-catch-visual';
    document.getElementById('fishMessage').textContent='Dây câu chạm mặt nước… đợi một chút nhé.';
    playWaterSound();
    setTimeout(()=>{
      const state=todayFish(fishState());state.casts++;state.usedToday++;
      const roll=Math.random()*100;
      const upgraded=shopState().rod;
      if(roll<(upgraded?12:18)){state.seaweed++;catchVisual.className='fish-catch-visual weed caught';document.getElementById('fishMessage').textContent='Cá lách đi mất. Em câu lên một nhúm rong, có thể bán lấy 2 cánh hoa.';}
      else{
        let pick=Math.random()*100,found=fishKinds.at(-1);
        const upgradedWeights=[34,26,17,11,7,5];
        for(const [i,f] of fishKinds.entries()){pick-=upgraded?upgradedWeights[i]:f.weight;if(pick<0){found=f;break;}}
        state.counts[found.id]=(state.counts[found.id]||0)+1;
        catchVisual.className='fish-catch-visual fish-'+found.id+' caught';
        document.getElementById('fishMessage').textContent='Bắt được '+found.name+'! Em cất cá vào giỏ.';
        status.innerHTML='<strong>Câu được '+found.name+'</strong><span>Cá đã vào giỏ · có thể mang về cottage.</span>';
        playSound('water');
      }
      saveFish(state);casting=false;renderFish();fishSheet.classList.remove('casting');
    },1650);
  });
  document.getElementById('fishSell').addEventListener('click',()=>{
    const state=fishState();if(!state.seaweed)return;
    const gained=state.seaweed*2,flowers=flowerState();state.seaweed=0;saveFish(state);
    saveFlower({...flowers,petals:flowers.petals+gained});renderFish();playSound('open');
    document.getElementById('fishMessage').textContent='Đã bán rong, nhận '+gained+' cánh hoa ✿';
  });
  document.getElementById('fishInventory').addEventListener('click',event=>{
    const button=event.target.closest('[data-sell-fish]');if(!button)return;
    const fish=fishKinds.find(f=>f.id===button.dataset.sellFish),state=fishState();
    if(!fish||!Number.isSafeInteger(state.counts[fish.id])||state.counts[fish.id]<1)return;
    state.counts[fish.id]--;
    const flowers=flowerState();
    saveFish(state);saveFlower({...flowers,petals:flowers.petals+fish.sellPrice});
    renderFish();playSound('open');
    document.getElementById('fishMessage').textContent='Đã bán 1 '+fish.name+', nhận '+fish.sellPrice+' cánh hoa ✿';
  });
  function adoptPet(id){
    const pet=petKinds.find(p=>p.id===id),flowers=flowerState();if(!pet||id==='jace')return false;
    const state=petState();if(state.owned.includes(pet.id))return false;
    const effective=pet.cost-voucherDiscount(pet.cost);
    if(flowers.petals<effective){
      const missing=effective-flowers.petals,detail=document.getElementById('petDetail');
      document.getElementById('petNotice').textContent='Còn thiếu '+missing+' cánh hoa để đón '+pet.name+' về.';
      if(!detail.hidden&&detail.dataset.pet===id){
        detail.querySelector('.pet-profile-price').textContent='Còn thiếu '+missing+' ✿ để đón bé';
        detail.querySelector('.profile-adopt').textContent='Thiếu '+missing+' ✿';
        detail.classList.remove('insufficient');void detail.offsetWidth;detail.classList.add('insufficient');
      }
      playSound();return false;
    }
    if(!chargePetals(pet.cost,()=>{}))return false;
    state.owned.push(pet.id);if(state.displayed.length<5)state.displayed.push(pet.id);
    state.selected=pet.id;state.needs[pet.id]={feed:Date.now()-6*3600000,water:Date.now()-4*3600000,play:Date.now()-1*3600000,sleep:Date.now()-6*3600000,happiness:0};savePets(state);
    renderPetGrid();playSound('water');
    document.getElementById('petNotice').textContent=pet.name+' đã có nhà ở cottage rồi ♡';
    status.innerHTML='<strong>Đã nhận nuôi '+pet.name+'</strong><span>Qua cổng bên phải để chăm bé ở cottage.</span>';
    return true;
  }
  petGrid.addEventListener('click',e=>{
    const info=e.target.closest('[data-info]');if(info){renderPetProfile(info.dataset.info);playSound();return;}
    const button=e.target.closest('[data-adopt]');if(button)adoptPet(button.dataset.adopt);
  });
  document.getElementById('petDetail').addEventListener('click',e=>{
    if(e.target.closest('[data-hide-detail]')){closePetProfile();return;}
    const button=e.target.closest('[data-adopt-profile]');if(button){const id=button.dataset.adoptProfile;const adopted=adoptPet(id);if(adopted)closePetProfile();}
  });
  document.getElementById('cottageArt').addEventListener('click',e=>{
    const station=e.target.closest('[data-station]'),cat=e.target.closest('[data-select-pet]');
    if(station){cottageStation=station.dataset.station;renderCottage();playSound('open');}
    if(cat){const state=petState();state.selected=cat.dataset.selectPet;savePets(state);renderCottage();playSound();}
  });
  document.getElementById('cottageBack').addEventListener('click',()=>{cottageStation='';renderCottage();playSound();});
  document.getElementById('cottageManage').addEventListener('click',()=>{rosterOpen=!rosterOpen;renderCottage();playSound();});
  document.getElementById('cottageRoster').addEventListener('click',e=>{
    const button=e.target.closest('[data-display-pet]');if(!button)return;
    const state=petState(),id=button.dataset.displayPet;if(!state.owned.includes(id))return;
    if(state.displayed.includes(id))state.displayed=state.displayed.filter(pid=>pid!==id);
    else if(state.displayed.length<5)state.displayed.push(id);
    else{document.getElementById('cottageNotice').textContent='Trong phòng chỉ đủ chỗ cho 5 bé. Cất một bé trước nhé.';playSound();return;}
    savePets(state);renderCottage();playSound();
  });
  petSelector.addEventListener('change',e=>{
    if(e.target.id!=='cottagePetSelect')return;
    const state=petState();if(!state.owned.includes(e.target.value))return;
    state.selected=e.target.value;savePets(state);renderCottage();playSound();
  });
  careGrid.addEventListener('click',e=>{
    const button=e.target.closest('[data-care],[data-feed-fish],[data-feed-pate]');if(!button)return;
    const state=petState(),id=selectPet(state),action=button.hasAttribute('data-feed-fish')||button.hasAttribute('data-feed-pate')?'feed':button.dataset.care;
    if(!id||!['feed','water','play','sleep'].includes(action))return;
    const needs=needsFor(state,id);
    if(!careReadiness(needs,id,action).ready)return;
    let gained=false,used=null;
    if(action==='feed'){
      if(button.hasAttribute('data-feed-pate')){
        const goods=shopState();if(!goods.pate)return;goods.pate--;saveShop(goods);used={name:'pate cá',joy:3,reward:0};
      }else{
        const fish=fishState();used=fishKinds.find(f=>f.id===button.dataset.feedFish);
        if(!used||!fish.counts[used.id]){document.getElementById('cottageNotice').textContent='Giỏ chưa có loại cá ấy. Ghé hồ câu thêm nhé.';playSound();return;}
        fish.counts[used.id]--;saveFish(fish);
      }
      needs.happiness=Math.min(20,Math.max(0,Number(needs.happiness)||0)+used.joy);
      needs.joyAt=Date.now();
      gained=Math.random()<used.reward;
      if(gained){const flowers=flowerState();saveFlower({...flowers,petals:flowers.petals+1});}
    }
    const usedYarn=action==='play'&&button.dataset.toy==='yarn'&&shopState().toy;
    if(usedYarn)needs.happiness=Math.min(20,Math.max(0,Number(needs.happiness)||0)+2);
    needs[action]=Date.now();state.needs[id]=needs;savePets(state);renderCottage();
    setPetPose(id,action);cottagePet.hidden=false;
    petPoseTimer=setTimeout(()=>{cottagePet.hidden=true;},3000);
    if(action==='play')playSound('star');else playSound(action==='water'?'water':'open');
    const pet=petKinds.find(p=>p.id===id);
    document.getElementById('cottageNotice').textContent=action==='feed'?pet.name+' ăn '+used.name+' rồi · vui +'+used.joy+(gained?' · nhặt được 1 ✿!':' ♡'):{water:pet.name+' vừa uống nước sạch ♡',play:pet.name+(usedYarn?' chơi với bóng len tím · vui thêm +2 ♡':' chơi vui rồi ♡'),sleep:pet.name+' cuộn tròn nghỉ trên giường ♡'}[action];
  });
  setInterval(()=>{if(cottageVeil.classList.contains('open')&&!cottageStation)renderCottage();},60000);
  document.getElementById('cottageFind').addEventListener('click',()=>{closeActivity(cottageVeil);travel('westExit');});
  function renderFlower(){
    const state=flowerState(),today=gardenDay(),yesterday=gardenDay(new Date(Date.now()-86400000));
    const active=state.last===today||state.last===yesterday;
    const streak=active?state.streak:0,done=state.last===today;
    roseFrame(done?3:0);
    document.getElementById('bloomCount').textContent=streak;
    document.getElementById('bloomPetals').textContent=state.petals;
    document.getElementById('bloomDays').innerHTML=Array.from({length:7},(_,i)=>
      '<span class="bloom-day'+(i<Math.min(streak,7)?' done':'')+(i===Math.min(streak,6)&&!done?' next':'')+'" aria-label="Ngày '+(i+1)+(i<Math.min(streak,7)?' đã chăm':' chưa chăm')+'"><i><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5.5" r="3"/><circle cx="18" cy="10" r="3"/><circle cx="16" cy="17" r="3"/><circle cx="8" cy="17" r="3"/><circle cx="6" cy="10" r="3"/><circle cx="12" cy="11.5" r="2"/></svg></i><span>'+String(i+1).padStart(2,'0')+'</span></span>'
    ).join('');
    bloomWater.disabled=done;
    document.getElementById('bloomButtonText').textContent=done?'Đã tưới hoa hôm nay':'Tưới hoa hôm nay';
    document.getElementById('bloomDescription').textContent=done
      ?'Hoa đã đủ tươi, hẹn em một ngày nắng mới.'
      :'Hoa còn khép cánh, đợi em tưới một chút nước.';
    document.getElementById('bloomNotice').textContent=done
      ?'Ngày mai quay lại để giữ chuỗi ngày chăm hoa ♡'
      :'Mỗi ngày tưới một lần · sang ngày mới hoa lại chờ bạn';
  }
  function openBloom(){
    focusBeforeBloom=document.activeElement;
    clearBloomTimers();bloomSheet.classList.remove('celebrate');renderFlower();
    bloomVeil.classList.add('open');bloomVeil.setAttribute('aria-hidden','false');
    bloomSheet.focus({preventScroll:true});
  }
  function closeBloom(){
    clearBloomTimers();
    bloomVeil.classList.remove('open');bloomVeil.setAttribute('aria-hidden','true');
    if(focusBeforeBloom&&document.contains(focusBeforeBloom))focusBeforeBloom.focus({preventScroll:true});
  }
  bloomWater.addEventListener('click',()=>{
    const today=gardenDay(),old=flowerState();
    if(old.last===today)return;
    const yesterday=gardenDay(new Date(Date.now()-86400000));
    const state={last:today,streak:old.last===yesterday?old.streak+1:1,petals:old.petals+10};
    saveFlower(state);renderFlower();
    animateRose();
    document.getElementById('bloomNotice').textContent='Hoa vừa nở thêm một chút · +10 cánh hoa ✿';
    status.innerHTML='<strong>Đã chăm hoa hôm nay</strong><span>+'+'10 cánh hoa · '+state.streak+' ngày liên tiếp.</span>';
  });
  bloomClose.addEventListener('click',()=>{playSound();closeBloom();});
  bloomVeil.addEventListener('click',e=>{e.stopPropagation();if(e.target===bloomVeil)closeBloom();});
  bloomVeil.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();closeBloom();}
    if(e.key==='Tab'){
      const elements=[bloomClose,bloomWater].filter(el=>!el.disabled);
      const next=e.shiftKey?elements.at(-1):elements[0];
      if(!elements.includes(document.activeElement)||e.shiftKey&&document.activeElement===elements[0]||!e.shiftKey&&document.activeElement===elements.at(-1)){
        e.preventDefault();next.focus();
      }
    }
  });
  const W=1024,H=1536;
  const lakeCanvas=document.getElementById('lakeCanvas'),lakeMask=document.getElementById('lakeMask');
  const lakeCtx=lakeCanvas.getContext('2d',{alpha:true});
  const lakeBase=stage.querySelector('.garden');
  const lakeMaskCanvas=document.createElement('canvas');lakeMaskCanvas.width=454;lakeMaskCanvas.height=520;
  const lakeMaskCtx=lakeMaskCanvas.getContext('2d',{willReadFrequently:true});
  let lakeReady=false,lakeRippleRunning=false;
  const lakeRipples=[];
  function lakeAt(x,y){
    const lx=Math.floor(x-570),ly=Math.floor(y-180);
    if(!lakeReady||lx<0||ly<0||lx>=454||ly>=520)return false;
    return lakeMaskCtx.getImageData(lx,ly,1,1).data[3]>45;
  }
  function lakeRipple(x,y){
    lakeRipples.push({x:x-570,y:y-180,start:performance.now()});
    if(!lakeRippleRunning){lakeRippleRunning=true;requestAnimationFrame(drawLake);}
  }
  function drawLake(time){
    if(!lakeReady){lakeRippleRunning=false;return;}
    const ctx=lakeCtx;
    ctx.clearRect(0,0,454,520);
    ctx.lineCap='round';
    for(let i=lakeRipples.length-1;i>=0;i--){
      const ripple=lakeRipples[i],age=(time-ripple.start)/1000;
      if(age>1.7){lakeRipples.splice(i,1);continue;}
      for(let ring=0;ring<2;ring++){
        const radius=6+age*39-ring*12;if(radius<=0)continue;
        ctx.beginPath();ctx.ellipse(ripple.x,ripple.y,radius,radius*.38,0,0,Math.PI*2);
        ctx.strokeStyle='rgba(222,238,231,'+(.30*(1-age/1.7))+')';
        ctx.lineWidth=1.5;ctx.stroke();
      }
    }
    ctx.globalCompositeOperation='destination-in';ctx.drawImage(lakeMask,0,0,454,520);
    ctx.globalCompositeOperation='source-over';
    if(lakeRipples.length){requestAnimationFrame(drawLake);}else{lakeRippleRunning=false;}
  }
  function readyLake(){
    if(lakeReady||!lakeMask.naturalWidth)return;
    lakeMaskCtx.drawImage(lakeMask,0,0,454,520);
    lakeReady=true;
  }
  lakeMask.addEventListener('load',readyLake);
  lakeBase.addEventListener('load',readyLake);
  if(lakeMask.complete&&lakeBase.complete)readyLake();
  // Foreground crops reference the very same image URL as the base, including
  // in the standalone HTML. No separately rendered lake/garden layer.
  const baseSource=stage.querySelector('.garden').src;
  stage.querySelectorAll('.foreground-layer image').forEach(el=>el.setAttribute('href',baseSource));
  // Foot anchors follow paving where exposed, and the original marked
  // transitions behind foreground vegetation where the flat art conceals it.
  const nodes={
    entry:[505,1500],trunkA:[510,1390],trunkB:[522,1270],trunkC:[530,1160],
    trunkD:[520,1050],trunkE:[510,940],
    ringSouth:[502,850],ringSW:[385,810],ringWest:[310,725],ringNW:[330,665],
    ringWestTop:[400,645],ringWestShoulder:[447,631],ringWestCrown:[455,595],
    ringNorth:[500,565],ringNE:[650,628],ringEast:[708,720],ringSE:[655,812],
    leftJoin:[390,950],westBend:[285,906],westLanding:[175,832],westArch:[105,795],westExit:[50,766],
    eastLower:[635,1160],eastBend:[755,1125],eastApproach:[850,1120],
    eastArc:[720,780],eastUpper:[765,848],eastMid:[817,905],eastGateSide:[878,961],
    eastBehindGate:[934,1028],rightExit:[936,1048],
    upperFork:[502,507],
    greenApproach:[415,466],greenSteps:[335,410],greenDoor:[260,353],greenInside:[244,317],
    starApproach:[526,420],starBase:[560,326],starSteps:[580,274],starTerrace:[594,222],
    fishApproach:[565,485],fishSteps:[600,474],fishLanding:[628,440],fishDeck:[700,398]
  };
  const edges=[
    ['entry','trunkA'],['trunkA','trunkB'],['trunkB','trunkC'],['trunkC','trunkD'],
    ['trunkD','trunkE'],['trunkE','ringSouth'],
    ['ringSouth','ringSW'],['ringSW','ringWest'],['ringWest','ringNW'],
    ['ringNW','ringWestTop'],['ringWestTop','ringWestShoulder'],
    ['ringWestShoulder','ringWestCrown'],['ringWestCrown','ringNorth'],
    ['ringNorth','ringNE'],['ringNE','ringEast'],
    ['ringEast','ringSE'],['ringSE','ringSouth'],
    ['trunkE','leftJoin'],['leftJoin','westBend'],['westBend','westLanding'],
    ['westLanding','westArch'],['westArch','westExit'],
    ['trunkC','eastLower'],['eastLower','eastBend'],['eastBend','eastApproach'],
    ['ringEast','eastArc'],['eastArc','eastUpper'],['eastUpper','eastMid'],
    ['eastMid','eastGateSide'],['eastGateSide','eastBehindGate'],['eastBehindGate','rightExit'],
    ['eastApproach','rightExit'],
    ['ringNorth','upperFork'],
    ['upperFork','greenApproach'],['greenApproach','greenSteps'],['greenSteps','greenDoor'],['greenDoor','greenInside'],
    ['upperFork','starApproach'],['starApproach','starBase'],['starBase','starSteps'],['starSteps','starTerrace'],
    ['upperFork','fishApproach'],['fishApproach','fishSteps'],['fishSteps','fishLanding'],['fishLanding','fishDeck']
  ];
  const labels={
    entry:['Đã về cổng vào','Chỉ đường lát đá mới đi được.'],
    greenInside:['Đã vào nhà kính','Đi qua bậc cửa; khung cửa và kính nằm trước nhân vật.'],
    fishDeck:['Đã lên bệ câu cá','Thả câu bên hồ để thêm cá vào giỏ.'],
    starTerrace:['Đã tới sân ngắm sao','Chạm để ngắm bầu trời đêm nay.'],
    westExit:['Đã tới đồng cỏ pet','Ba bé mèo F3 đang chờ được nhận nuôi.'],
    rightExit:['Đã tới cottage','Chăm các bé mèo đã nhận nuôi ở căn nhà nhỏ.']
  };
  // Tap exclusion zones prevent snapping from scenery to a nearby path.
  const obstacles=[
    {type:'ellipse',cx:510,cy:698,rx:124,ry:90,label:'đài phun nước'},
    {type:'rect',x:0,y:0,w:187,h:405,label:'nhà kính'},
    {type:'rect',x:795,y:312,w:229,h:340,label:'mặt hồ'},
    {type:'rect',x:792,y:900,w:55,h:172,label:'trụ trái cổng cottage'},
    {type:'rect',x:860,y:895,w:61,h:162,label:'cánh cổng sắt'},
    {type:'rect',x:982,y:875,w:42,h:154,label:'trụ cổng phải'},
    {type:'rect',x:0,y:628,w:35,h:200,label:'vòm trái'}
  ];
  // Plants can hide a routed transition, but tapping a plant is never a move.
  const tapOnly=[
    {type:'ellipse',cx:295,cy:907,rx:78,ry:151,label:'cây bách'},
    {type:'ellipse',cx:710,cy:963,rx:118,ry:155,label:'bồn hoa'}
  ];
  const contains=(x,y,o)=>o.type==='ellipse'
    ? ((x-o.cx)/o.rx)**2+((y-o.cy)/o.ry)**2<1
    : x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h;
  const obstacleAt=(x,y)=>[...obstacles,...tapOnly].find(o=>contains(x,y,o));
  const key=(a,b)=>[a,b].sort().join('|');
  let current='entry',traveling=false;
  const nearCottageGate=new Set(['eastMid','eastGateSide','eastApproach']);
  function setGateDepth(name){actor.classList.toggle('near-cottage-gate',nearCottageGate.has(name));}

  function drawRoutes(){
    const ns='http://www.w3.org/2000/svg';
    const make=(tag,attrs)=>{const el=document.createElementNS(ns,tag);
      Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));layer.append(el);return el;};
    for(const o of obstacles){
      if(o.type==='ellipse')make('ellipse',{cx:o.cx,cy:o.cy,rx:o.rx,ry:o.ry,class:'route-block'});
      else make('rect',{x:o.x,y:o.y,width:o.w,height:o.h,class:'route-block'});
    }
    for(const [a,b] of edges){const A=nodes[a],B=nodes[b];
      const el=make('line',{x1:A[0],y1:A[1],x2:B[0],y2:B[1],class:'route-edge'});
      el.dataset.edge=key(a,b);
    }
    for(const [name,[x,y]] of Object.entries(nodes)){
      const el=make('circle',{cx:x,cy:y,r:10,class:'route-node'});el.dataset.node=name;
    }
    setPosition(current);
  }
  function setPosition(name){
    const [x,y]=nodes[name];actor.style.left=x/W*100+'%';actor.style.top=y/H*100+'%';
    setGateDepth(name);
    layer.querySelectorAll('.route-node').forEach(n=>n.classList.toggle('current',n.dataset.node===name));
  }
  function pathBetween(start,target){
    const queue=[[start]],seen=new Set([start]);
    while(queue.length){
      const path=queue.shift(),last=path.at(-1);if(last===target)return path;
      for(const [a,b] of edges){const next=a===last?b:b===last?a:null;
        if(next&&!seen.has(next)){seen.add(next);queue.push([...path,next]);}
      }
    }
    return null;
  }
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function highlight(path){
    const selected=new Set(path.slice(1).map((n,i)=>key(path[i],n)));
    layer.querySelectorAll('.route-edge').forEach(el=>el.classList.toggle('active',selected.has(el.dataset.edge)));
  }
  function arrive(name){
    const [title,note]=labels[name]||['Đã tới đường đá','Điểm neo chân nằm trên lối đi được duyệt.'];
    status.innerHTML='<strong>'+title+'</strong><span>'+note+'</span>';
  }
  async function openDestination(target){
    if(interactionBusy)return;interactionBusy=true;
    const action={greenInside:'water',starTerrace:'star',fishDeck:'fish',westExit:'pet',rightExit:'cottage'}[target];
    if(action)await playArrivalAction(action);
    if(target==='greenInside')openBloom();
    if(target==='starTerrace')openStars();
    if(target==='fishDeck')openActivity(fishVeil);
    if(target==='westExit')openActivity(petVeil);
    if(target==='rightExit')openActivity(cottageVeil);
    interactionBusy=false;
  }
  async function travel(target,via){
    if(traveling||interactionBusy||!nodes[target])return;
    if(target==='rightExit'&&!via&&!new Set(['eastApproach','eastBehindGate','eastGateSide','rightExit']).has(current))via='trunkC';
    const first=via?pathBetween(current,via):null;
    const second=via?pathBetween(via,target):null;
    const path=first&&second?[...first,...second.slice(1)]:pathBetween(current,target);
    if(!path)return;
    traveling=true;highlight(path);actor.classList.add('walking');startWalking();
    status.innerHTML='<strong>Đang theo lối vườn</strong><span>Nhân vật sẽ khuất sau cây và cổng ở những đoạn bị che trong tranh.</span>';
    for(const name of path.slice(1)){
      const [sx,sy]=nodes[current],[tx,ty]=nodes[name];
      const duration=Math.max(220,Math.min(780,Math.hypot(tx-sx,ty-sy)*3.1));
      const changingGateDepth=nearCottageGate.has(current)!==nearCottageGate.has(name);
      if(changingGateDepth){
        // Switch at the character's feet crossing the gate plane, not at the start of the step.
        const gatePanelCrossing=(current==='eastGateSide'&&name==='eastBehindGate')? .18
          :(current==='eastBehindGate'&&name==='eastGateSide')? .82:.55;
        setTimeout(()=>{if(traveling)setGateDepth(name);},duration*gatePanelCrossing);
      }
      actor.classList.toggle('before-greenhouse-door',name==='greenSteps'||name==='greenDoor');
      actor.classList.toggle('facing-left',tx<sx);
      actor.style.transition='left '+duration+'ms linear, top '+duration+'ms linear';
      actor.style.left=tx/W*100+'%';actor.style.top=ty/H*100+'%';
      await wait(duration+25);current=name;setPosition(name);
    }
    actor.style.transition='';actor.classList.remove('walking','facing-left');
    actor.classList.toggle('before-greenhouse-door',target==='greenSteps'||target==='greenDoor');
    traveling=false;stopWalking();arrive(target);await openDestination(target);
  }
  function nearestRoute(x,y){
    let best={d:Infinity,target:null};
    for(const [name,[nx,ny]] of Object.entries(nodes)){
      const d=Math.hypot(nx-x,ny-y);if(d<best.d)best={d,target:name};
    }
    for(const [a,b] of edges){
      const A=nodes[a],B=nodes[b],dx=B[0]-A[0],dy=B[1]-A[1];
      const t=Math.max(0,Math.min(1,((x-A[0])*dx+(y-A[1])*dy)/(dx*dx+dy*dy)));
      const d=Math.hypot(x-(A[0]+t*dx),y-(A[1]+t*dy));
      if(d<best.d)best={d,target:t<.5?a:b};
    }
    return best;
  }
  document.querySelectorAll('[data-target]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    if(b.dataset.target==='fishDeck')playWaterSound();
    else playSound(b.dataset.target==='greenInside'?'open':'tap');
    if(current===b.dataset.target&&!traveling){openDestination(b.dataset.target);return;}
    travel(b.dataset.target,b.dataset.via);
  }));
  document.getElementById('debugToggle').addEventListener('click',e=>{
    e.stopPropagation();const on=!stage.classList.contains('debug');stage.classList.toggle('debug',on);
    e.currentTarget.setAttribute('aria-pressed',String(on));
    e.currentTarget.textContent=on?'Ẩn kỹ thuật':'Hiện kỹ thuật';
  });
  document.getElementById('resetPosition').addEventListener('click',e=>{e.stopPropagation();travel('entry');});
  stage.addEventListener('click',e=>{
    if(onboardVeil.classList.contains('open')||!welcomeDialogue.hidden||e.target.closest('button')||traveling||interactionBusy)return;
    const rect=stage.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width*W,y=(e.clientY-rect.top)/rect.height*H;
    if(lakeAt(x,y)){
      lakeRipple(x,y);playWaterSound();
      status.innerHTML='<strong>Mặt hồ khẽ gợn</strong><span>Chạm vào nước để nghe tiếng hồ và nhìn vòng sóng lan ra.</span>';
      return;
    }
    const obstacle=obstacleAt(x,y),hit=nearestRoute(x,y);
    // These route anchors sit beside/behind the iron gate. Tight taps on the plotted
    // paving remain usable, while taps farther onto the pillar or gate are blocked.
    if(hit.d<=15&&['eastGateSide','eastBehindGate','rightExit'].includes(hit.target)){travel(hit.target);return;}
    if(hit.d<=20&&(!obstacle||obstacle.label==='đài phun nước')){travel(hit.target);return;}
    if(!obstacle&&hit.d<=34){travel(hit.target);return;}
    const ring=document.createElement('i');ring.className='blocked';
    ring.style.left=x/W*100+'%';ring.style.top=y/H*100+'%';stage.append(ring);
    setTimeout(()=>ring.remove(),700);
    status.innerHTML='<strong>Không thể đi vào '+(obstacle?obstacle.label:'vùng không có lối đá')+'</strong><span>Chạm vào nhánh đường lát đá hoặc đốm sáng gần điểm đến.</span>';
  });
  if(new URLSearchParams(location.search).has('debug'))stage.classList.add('debug-tools');
  drawRoutes();arrive('entry');
  player=readPlayer();updateGardenSceneTitle(player?.gardenName);renderPlayer();ensureAdminJaceGrant();applyShopFrame();renderOnboardSprites();updateEnvironment();startWeatherLoop();setInterval(updateEnvironment,60000);
  if(player&&checkInGarden())document.getElementById('bagToggle').classList.add('voucher-earned');
  if(player){document.getElementById('gardenName').value=player.gardenName;onboardForm.querySelector('input[value="'+player.gender+'"]').checked=true;}
  if(!player||new URLSearchParams(location.search).has('onboard')){onboardVeil.classList.add('open');onboardVeil.setAttribute('aria-hidden','false');}
})();
