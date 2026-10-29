(function(){
'use strict';
var canvas=document.getElementById('board'),ctx=canvas.getContext('2d'),paper=document.getElementById('paper');
var status=document.getElementById('status'),dialog=document.getElementById('confirm');
var strokes=[],redo=[],current=null,activeId=null,color='#243447',size=10,erasing=false,saveTimer;
var storageKey='swingsketch.draft.v1',maxPoints=100000;
function report(text){status.textContent=text;}
function update(){document.getElementById('undo').disabled=!strokes.length;document.getElementById('redo').disabled=!redo.length;}
function line(s){
 if(s.clear){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1600,900);return;}
 if(!s.points.length)return;
 ctx.strokeStyle=s.color;ctx.fillStyle=s.color;ctx.lineWidth=s.size;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.arc(s.points[0][0],s.points[0][1],s.size/2,0,Math.PI*2);ctx.fill();
 if(s.points.length>1){ctx.beginPath();ctx.moveTo(s.points[0][0],s.points[0][1]);for(var i=1;i<s.points.length;i++)ctx.lineTo(s.points[i][0],s.points[i][1]);ctx.stroke();}
}
function render(){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1600,900);strokes.forEach(line);if(current)line(current);update();}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(function(){try{localStorage.setItem(storageKey,JSON.stringify(strokes));report('Draft saved on this device');}catch(e){report('Draft could not be saved. Keep the app open.');}},350);}
function point(e){var r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(1600,(e.clientX-r.left)*1600/r.width)),Math.max(0,Math.min(900,(e.clientY-r.top)*900/r.height))];}
function begin(e,id){if(current||!dialog.hidden)return;var count=strokes.reduce(function(n,s){return n+(s.points?s.points.length:0);},0);if(count>=maxPoints){report('Drawing limit reached. Clear the canvas to start again.');return;}activeId=id;current={color:erasing?'#ffffff':color,size:erasing?size*3:size,points:[point(e)]};redo=[];line(current);report(erasing?'Eraser':'Drawing...');}
function move(e,id){if(!current||id!==activeId)return;if(current.points.length>=12000)return;var p=point(e),last=current.points[current.points.length-1];if(Math.abs(p[0]-last[0])+Math.abs(p[1]-last[1])<.7)return;current.points.push(p);ctx.strokeStyle=current.color;ctx.lineWidth=current.size;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(last[0],last[1]);ctx.lineTo(p[0],p[1]);ctx.stroke();}
function finish(id){if(!current||id!==activeId)return;strokes.push(current);current=null;activeId=null;update();save();}
if(window.PointerEvent){
 canvas.addEventListener('pointerdown',function(e){if(e.button&&e.pointerType==='mouse')return;e.preventDefault();begin(e,e.pointerId);if(current)try{canvas.setPointerCapture(e.pointerId);}catch(ignore){} });
 canvas.addEventListener('pointermove',function(e){e.preventDefault();move(e,e.pointerId);});
 ['pointerup','pointercancel','lostpointercapture'].forEach(function(name){canvas.addEventListener(name,function(e){finish(e.pointerId);});});
}else{
 canvas.addEventListener('touchstart',function(e){e.preventDefault();if(e.changedTouches.length)begin(e.changedTouches[0],e.changedTouches[0].identifier);},{passive:false});
 canvas.addEventListener('touchmove',function(e){e.preventDefault();for(var i=0;i<e.changedTouches.length;i++)move(e.changedTouches[i],e.changedTouches[i].identifier);},{passive:false});
 ['touchend','touchcancel'].forEach(function(name){canvas.addEventListener(name,function(e){e.preventDefault();for(var i=0;i<e.changedTouches.length;i++)finish(e.changedTouches[i].identifier);},{passive:false});});
 canvas.addEventListener('mousedown',function(e){if(e.button===0)begin(e,'mouse');});window.addEventListener('mousemove',function(e){move(e,'mouse');});window.addEventListener('mouseup',function(){finish('mouse');});
}
function tool(value){erasing=value;['pen','eraser'].forEach(function(id){var on=(id==='eraser')===value;document.getElementById(id).classList.toggle('active',on);document.getElementById(id).setAttribute('aria-pressed',String(on));});}
document.getElementById('pen').onclick=function(){tool(false);};document.getElementById('eraser').onclick=function(){tool(true);};
Array.prototype.forEach.call(document.querySelectorAll('[data-color]'),function(b){b.onclick=function(){color=b.dataset.color;tool(false);Array.prototype.forEach.call(document.querySelectorAll('[data-color]'),function(x){x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});};});
Array.prototype.forEach.call(document.querySelectorAll('[data-size]'),function(b){b.onclick=function(){size=Number(b.dataset.size);Array.prototype.forEach.call(document.querySelectorAll('[data-size]'),function(x){x.classList.toggle('active',x===b);});};});
document.getElementById('undo').onclick=function(){if(current)finish(activeId);if(strokes.length){redo.push(strokes.pop());render();save();}};
document.getElementById('redo').onclick=function(){if(redo.length){strokes.push(redo.pop());render();save();}};
document.getElementById('clear').onclick=function(){if(current)finish(activeId);dialog.hidden=false;document.getElementById('cancelClear').focus();};
document.getElementById('cancelClear').onclick=function(){dialog.hidden=true;document.getElementById('clear').focus();};
document.getElementById('confirmClear').onclick=function(){if(strokes.length){strokes.push({clear:true});redo=[];}dialog.hidden=true;render();save();document.getElementById('clear').focus();};
function fit(){var r=paper.parentElement.getBoundingClientRect(),w=Math.min(r.width,r.height*16/9);paper.style.width=w+'px';paper.style.height=(w*9/16)+'px';}
window.addEventListener('resize',fit);window.addEventListener('blur',function(){finish(activeId);});
document.addEventListener('visibilitychange',function(){if(document.hidden){finish(activeId);try{localStorage.setItem(storageKey,JSON.stringify(strokes));}catch(ignore){}}});
document.addEventListener('keydown',function(e){
 if(e.keyCode===461||e.key==='Escape'){if(!dialog.hidden){e.preventDefault();dialog.hidden=true;document.getElementById('clear').focus();}return;}
 if([37,38,39,40].indexOf(e.keyCode)!==-1){e.preventDefault();var list=Array.prototype.filter.call(document.querySelectorAll(dialog.hidden?'nav button':'.overlay button'),function(b){return !b.disabled;});var i=list.indexOf(document.activeElement),delta=(e.keyCode===37||e.keyCode===38)?-1:1;list[(i+delta+list.length)%list.length].focus();}
});
try{var draft=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(draft)&&draft.length<100000){var total=0;draft.forEach(function(s){if(s&&s.clear===true)return;if(!s||!/^#[0-9a-f]{6}$/i.test(s.color)||!Number.isFinite(s.size)||s.size<=0||s.size>100||!Array.isArray(s.points))throw Error('invalid');s.points.forEach(function(p){if(!Array.isArray(p)||p.length!==2||!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[0]<0||p[0]>1600||p[1]<0||p[1]>900)throw Error('invalid');});total+=s.points.length;});if(total>maxPoints+12000)throw Error('too large');strokes=draft;}}catch(e){strokes=[];report('Could not load the previous draft. Started with a blank canvas.');}
render();fit();
})();
