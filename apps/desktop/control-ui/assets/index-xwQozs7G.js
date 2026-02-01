(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();const Zt=globalThis,Mi=Zt.ShadowRoot&&(Zt.ShadyCSS===void 0||Zt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ii=Symbol(),Ds=new WeakMap;let Gr=class{constructor(t,n,i){if(this._$cssResult$=!0,i!==Ii)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o;const n=this.t;if(Mi&&t===void 0){const i=n!==void 0&&n.length===1;i&&(t=Ds.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&Ds.set(n,t))}return t}toString(){return this.cssText}};const Bo=e=>new Gr(typeof e=="string"?e:e+"",void 0,Ii),Fo=(e,...t)=>{const n=e.length===1?e[0]:t.reduce((i,s,r)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[r+1],e[0]);return new Gr(n,e,Ii)},zo=(e,t)=>{if(Mi)e.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of t){const i=document.createElement("style"),s=Zt.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=n.cssText,e.appendChild(i)}},Bs=Mi?e=>e:e=>e instanceof CSSStyleSheet?(t=>{let n="";for(const i of t.cssRules)n+=i.cssText;return Bo(n)})(e):e;const{is:Uo,defineProperty:Ko,getOwnPropertyDescriptor:Ho,getOwnPropertyNames:Wo,getOwnPropertySymbols:jo,getPrototypeOf:qo}=Object,ln=globalThis,Fs=ln.trustedTypes,Vo=Fs?Fs.emptyScript:"",Go=ln.reactiveElementPolyfillSupport,xt=(e,t)=>e,Jt={toAttribute(e,t){switch(t){case Boolean:e=e?Vo:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},Li=(e,t)=>!Uo(e,t),zs={attribute:!0,type:String,converter:Jt,reflect:!1,useDefault:!1,hasChanged:Li};Symbol.metadata??=Symbol("metadata"),ln.litPropertyMetadata??=new WeakMap;let Ye=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=zs){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,n);s!==void 0&&Ko(this.prototype,t,s)}}static getPropertyDescriptor(t,n,i){const{get:s,set:r}=Ho(this.prototype,t)??{get(){return this[n]},set(a){this[n]=a}};return{get:s,set(a){const l=s?.call(this);r?.call(this,a),this.requestUpdate(t,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??zs}static _$Ei(){if(this.hasOwnProperty(xt("elementProperties")))return;const t=qo(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(xt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(xt("properties"))){const n=this.properties,i=[...Wo(n),...jo(n)];for(const s of i)this.createProperty(s,n[s])}const t=this[Symbol.metadata];if(t!==null){const n=litPropertyMetadata.get(t);if(n!==void 0)for(const[i,s]of n)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[n,i]of this.elementProperties){const s=this._$Eu(n,i);s!==void 0&&this._$Eh.set(s,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const n=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)n.unshift(Bs(s))}else t!==void 0&&n.push(Bs(t));return n}static _$Eu(t,n){const i=n.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,n=this.constructor.elementProperties;for(const i of n.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return zo(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,n,i){this._$AK(t,i)}_$ET(t,n){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){const r=(i.converter?.toAttribute!==void 0?i.converter:Jt).toAttribute(n,i.type);this._$Em=t,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,n){const i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const r=i.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Jt;this._$Em=s;const l=a.fromAttribute(n,r.type);this[s]=l??this._$Ej?.get(s)??l,this._$Em=null}}requestUpdate(t,n,i,s=!1,r){if(t!==void 0){const a=this.constructor;if(s===!1&&(r=this[t]),i??=a.getPropertyOptions(t),!((i.hasChanged??Li)(r,n)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,i))))return;this.C(t,n,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:i,reflect:s,wrapped:r},a){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??n??this[t]),r!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(n=void 0),this._$AL.set(t,n)),s===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,r]of i){const{wrapped:a}=r,l=this[s];a!==!0||this._$AL.has(s)||l===void 0||this.C(s,void 0,r,l)}}let t=!1;const n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(n)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(n)}willUpdate(t){}_$AE(t){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(n=>this._$ET(n,this[n])),this._$EM()}updated(t){}firstUpdated(t){}};Ye.elementStyles=[],Ye.shadowRootOptions={mode:"open"},Ye[xt("elementProperties")]=new Map,Ye[xt("finalized")]=new Map,Go?.({ReactiveElement:Ye}),(ln.reactiveElementVersions??=[]).push("2.1.2");const Ri=globalThis,Us=e=>e,en=Ri.trustedTypes,Ks=en?en.createPolicy("lit-html",{createHTML:e=>e}):void 0,Qr="$lit$",ke=`lit$${Math.random().toFixed(9).slice(2)}$`,Zr="?"+ke,Qo=`<${Zr}>`,De=document,St=()=>De.createComment(""),_t=e=>e===null||typeof e!="object"&&typeof e!="function",Pi=Array.isArray,Zo=e=>Pi(e)||typeof e?.[Symbol.iterator]=="function",Bn=`[ 	
\f\r]`,dt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Hs=/-->/g,Ws=/>/g,Ie=RegExp(`>|${Bn}(?:([^\\s"'>=/]+)(${Bn}*=${Bn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),js=/'/g,qs=/"/g,Yr=/^(?:script|style|textarea|title)$/i,Yo=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),o=Yo(1),_e=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Vs=new WeakMap,Oe=De.createTreeWalker(De,129);function Xr(e,t){if(!Pi(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ks!==void 0?Ks.createHTML(t):t}const Xo=(e,t)=>{const n=e.length-1,i=[];let s,r=t===2?"<svg>":t===3?"<math>":"",a=dt;for(let l=0;l<n;l++){const c=e[l];let p,d,u=-1,v=0;for(;v<c.length&&(a.lastIndex=v,d=a.exec(c),d!==null);)v=a.lastIndex,a===dt?d[1]==="!--"?a=Hs:d[1]!==void 0?a=Ws:d[2]!==void 0?(Yr.test(d[2])&&(s=RegExp("</"+d[2],"g")),a=Ie):d[3]!==void 0&&(a=Ie):a===Ie?d[0]===">"?(a=s??dt,u=-1):d[1]===void 0?u=-2:(u=a.lastIndex-d[2].length,p=d[1],a=d[3]===void 0?Ie:d[3]==='"'?qs:js):a===qs||a===js?a=Ie:a===Hs||a===Ws?a=dt:(a=Ie,s=void 0);const g=a===Ie&&e[l+1].startsWith("/>")?" ":"";r+=a===dt?c+Qo:u>=0?(i.push(p),c.slice(0,u)+Qr+c.slice(u)+ke+g):c+ke+(u===-2?l:g)}return[Xr(e,r+(e[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};let ii=class Jr{constructor({strings:t,_$litType$:n},i){let s;this.parts=[];let r=0,a=0;const l=t.length-1,c=this.parts,[p,d]=Xo(t,n);if(this.el=Jr.createElement(p,i),Oe.currentNode=this.el.content,n===2||n===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(s=Oe.nextNode())!==null&&c.length<l;){if(s.nodeType===1){if(s.hasAttributes())for(const u of s.getAttributeNames())if(u.endsWith(Qr)){const v=d[a++],g=s.getAttribute(u).split(ke),$=/([.?@])?(.*)/.exec(v);c.push({type:1,index:r,name:$[2],strings:g,ctor:$[1]==="."?el:$[1]==="?"?tl:$[1]==="@"?nl:dn}),s.removeAttribute(u)}else u.startsWith(ke)&&(c.push({type:6,index:r}),s.removeAttribute(u));if(Yr.test(s.tagName)){const u=s.textContent.split(ke),v=u.length-1;if(v>0){s.textContent=en?en.emptyScript:"";for(let g=0;g<v;g++)s.append(u[g],St()),Oe.nextNode(),c.push({type:2,index:++r});s.append(u[v],St())}}}else if(s.nodeType===8)if(s.data===Zr)c.push({type:2,index:r});else{let u=-1;for(;(u=s.data.indexOf(ke,u+1))!==-1;)c.push({type:7,index:r}),u+=ke.length-1}r++}}static createElement(t,n){const i=De.createElement("template");return i.innerHTML=t,i}};function et(e,t,n=e,i){if(t===_e)return t;let s=i!==void 0?n._$Co?.[i]:n._$Cl;const r=_t(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(e),s._$AT(e,n,i)),i!==void 0?(n._$Co??=[])[i]=s:n._$Cl=s),s!==void 0&&(t=et(e,s._$AS(e,t.values),s,i)),t}class Jo{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:n},parts:i}=this._$AD,s=(t?.creationScope??De).importNode(n,!0);Oe.currentNode=s;let r=Oe.nextNode(),a=0,l=0,c=i[0];for(;c!==void 0;){if(a===c.index){let p;c.type===2?p=new cn(r,r.nextSibling,this,t):c.type===1?p=new c.ctor(r,c.name,c.strings,this,t):c.type===6&&(p=new il(r,this,t)),this._$AV.push(p),c=i[++l]}a!==c?.index&&(r=Oe.nextNode(),a++)}return Oe.currentNode=De,s}p(t){let n=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,n),n+=i.strings.length-2):i._$AI(t[n])),n++}}let cn=class ea{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,n,i,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&t?.nodeType===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=et(this,t,n),_t(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==_e&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Zo(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&_t(this._$AH)?this._$AA.nextSibling.data=t:this.T(De.createTextNode(t)),this._$AH=t}$(t){const{values:n,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=ii.createElement(Xr(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(n);else{const r=new Jo(s,this),a=r.u(this.options);r.p(n),this.T(a),this._$AH=r}}_$AC(t){let n=Vs.get(t.strings);return n===void 0&&Vs.set(t.strings,n=new ii(t)),n}k(t){Pi(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let i,s=0;for(const r of t)s===n.length?n.push(i=new ea(this.O(St()),this.O(St()),this,this.options)):i=n[s],i._$AI(r),s++;s<n.length&&(this._$AR(i&&i._$AB.nextSibling,s),n.length=s)}_$AR(t=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);t!==this._$AB;){const i=Us(t).nextSibling;Us(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}};class dn{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,i,s,r){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=n,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=h}_$AI(t,n=this,i,s){const r=this.strings;let a=!1;if(r===void 0)t=et(this,t,n,0),a=!_t(t)||t!==this._$AH&&t!==_e,a&&(this._$AH=t);else{const l=t;let c,p;for(t=r[0],c=0;c<r.length-1;c++)p=et(this,l[i+c],n,c),p===_e&&(p=this._$AH[c]),a||=!_t(p)||p!==this._$AH[c],p===h?t=h:t!==h&&(t+=(p??"")+r[c+1]),this._$AH[c]=p}a&&!s&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}let el=class extends dn{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},tl=class extends dn{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},nl=class extends dn{constructor(t,n,i,s,r){super(t,n,i,s,r),this.type=5}_$AI(t,n=this){if((t=et(this,t,n,0)??h)===_e)return;const i=this._$AH,s=t===h&&i!==h||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==h&&(i===h||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},il=class{constructor(t,n,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){et(this,t)}};const sl={I:cn},rl=Ri.litHtmlPolyfillSupport;rl?.(ii,cn),(Ri.litHtmlVersions??=[]).push("3.3.2");const al=(e,t,n)=>{const i=n?.renderBefore??t;let s=i._$litPart$;if(s===void 0){const r=n?.renderBefore??null;i._$litPart$=s=new cn(t.insertBefore(St(),r),r,void 0,n??{})}return s._$AI(e),s};const Oi=globalThis;let Je=class extends Ye{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=al(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return _e}};Je._$litElement$=!0,Je.finalized=!0,Oi.litElementHydrateSupport?.({LitElement:Je});const ol=Oi.litElementPolyfillSupport;ol?.({LitElement:Je});(Oi.litElementVersions??=[]).push("4.2.2");const ta=e=>(t,n)=>{n!==void 0?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)};const ll={attribute:!0,type:String,converter:Jt,reflect:!1,hasChanged:Li},cl=(e=ll,t,n)=>{const{kind:i,metadata:s}=n;let r=globalThis.litPropertyMetadata.get(s);if(r===void 0&&globalThis.litPropertyMetadata.set(s,r=new Map),i==="setter"&&((e=Object.create(e)).wrapped=!0),r.set(n.name,e),i==="accessor"){const{name:a}=n;return{set(l){const c=t.get.call(this);t.set.call(this,l),this.requestUpdate(a,c,e,!0,l)},init(l){return l!==void 0&&this.C(a,void 0,e,l),l}}}if(i==="setter"){const{name:a}=n;return function(l){const c=this[a];t.call(this,l),this.requestUpdate(a,c,e,!0,l)}}throw Error("Unsupported decorator location: "+i)};function un(e){return(t,n)=>typeof n=="object"?cl(e,t,n):((i,s,r)=>{const a=s.hasOwnProperty(r);return s.constructor.createProperty(r,i),a?Object.getOwnPropertyDescriptor(s,r):void 0})(e,t,n)}function y(e){return un({...e,state:!0,attribute:!1})}const dl=50,ul=200,pl="Assistant";function Gs(e,t){if(typeof e!="string")return;const n=e.trim();if(n)return n.length<=t?n:n.slice(0,t)}function si(e){const t=Gs(e?.name,dl)??pl,n=Gs(e?.avatar??void 0,ul)??null;return{agentId:typeof e?.agentId=="string"&&e.agentId.trim()?e.agentId.trim():null,name:t,avatar:n}}function fl(){return si(typeof window>"u"?{}:{name:window.__CLAWDBOT_ASSISTANT_NAME__,avatar:window.__CLAWDBOT_ASSISTANT_AVATAR__})}const na="clawdbot.control.settings.v1";function hl(){const t={gatewayUrl:`${location.protocol==="https:"?"wss":"ws"}://${location.host}`,token:"",sessionKey:"main",lastActiveSessionKey:"main",theme:"system",chatFocusMode:!1,chatShowThinking:!0,splitRatio:.6,navCollapsed:!1,navGroupsCollapsed:{}};try{const n=localStorage.getItem(na);if(!n)return t;const i=JSON.parse(n);return{gatewayUrl:typeof i.gatewayUrl=="string"&&i.gatewayUrl.trim()?i.gatewayUrl.trim():t.gatewayUrl,token:typeof i.token=="string"?i.token:t.token,sessionKey:typeof i.sessionKey=="string"&&i.sessionKey.trim()?i.sessionKey.trim():t.sessionKey,lastActiveSessionKey:typeof i.lastActiveSessionKey=="string"&&i.lastActiveSessionKey.trim()?i.lastActiveSessionKey.trim():typeof i.sessionKey=="string"&&i.sessionKey.trim()||t.lastActiveSessionKey,theme:i.theme==="light"||i.theme==="dark"||i.theme==="system"?i.theme:t.theme,chatFocusMode:typeof i.chatFocusMode=="boolean"?i.chatFocusMode:t.chatFocusMode,chatShowThinking:typeof i.chatShowThinking=="boolean"?i.chatShowThinking:t.chatShowThinking,splitRatio:typeof i.splitRatio=="number"&&i.splitRatio>=.4&&i.splitRatio<=.7?i.splitRatio:t.splitRatio,navCollapsed:typeof i.navCollapsed=="boolean"?i.navCollapsed:t.navCollapsed,navGroupsCollapsed:typeof i.navGroupsCollapsed=="object"&&i.navGroupsCollapsed!==null?i.navGroupsCollapsed:t.navGroupsCollapsed}}catch{return t}}function gl(e){localStorage.setItem(na,JSON.stringify(e))}function ia(e){const t=(e??"").trim();if(!t)return null;const n=t.split(":").filter(Boolean);if(n.length<3||n[0]!=="agent")return null;const i=n[1]?.trim(),s=n.slice(2).join(":");return!i||!s?null:{agentId:i,rest:s}}const vl=[{label:"对话",tabs:["chat"]},{label:"管理",tabs:["overview","channels","instances","sessions","cron"]},{label:"智能体",tabs:["skills","nodes"]},{label:"设置",tabs:["config","debug","logs"]}],sa={overview:"/overview",channels:"/channels",instances:"/instances",sessions:"/sessions",cron:"/cron",skills:"/skills",nodes:"/nodes",chat:"/chat",config:"/config",debug:"/debug",logs:"/logs"},ra=new Map(Object.entries(sa).map(([e,t])=>[t,e]));function pn(e){if(!e)return"";let t=e.trim();return t.startsWith("/")||(t=`/${t}`),t==="/"?"":(t.endsWith("/")&&(t=t.slice(0,-1)),t)}function Tt(e){if(!e)return"/";let t=e.trim();return t.startsWith("/")||(t=`/${t}`),t.length>1&&t.endsWith("/")&&(t=t.slice(0,-1)),t}function Ni(e,t=""){const n=pn(t),i=sa[e];return n?`${n}${i}`:i}function aa(e,t=""){const n=pn(t);let i=e||"/";n&&(i===n?i="/":i.startsWith(`${n}/`)&&(i=i.slice(n.length)));let s=Tt(i).toLowerCase();return s.endsWith("/index.html")&&(s="/"),s==="/"?"chat":ra.get(s)??null}function ml(e){let t=Tt(e);if(t.endsWith("/index.html")&&(t=Tt(t.slice(0,-11))),t==="/")return"";const n=t.split("/").filter(Boolean);if(n.length===0)return"";for(let i=0;i<n.length;i++){const s=`/${n.slice(i).join("/")}`.toLowerCase();if(ra.has(s)){const r=n.slice(0,i);return r.length?`/${r.join("/")}`:""}}return`/${n.join("/")}`}function bl(e){switch(e){case"chat":return"messageSquare";case"overview":return"barChart";case"channels":return"link";case"instances":return"radio";case"sessions":return"fileText";case"cron":return"loader";case"skills":return"zap";case"nodes":return"monitor";case"config":return"settings";case"debug":return"bug";case"logs":return"scrollText";default:return"folder"}}function ri(e){switch(e){case"overview":return"概览";case"channels":return"渠道";case"instances":return"实例";case"sessions":return"会话";case"cron":return"定时任务";case"skills":return"技能";case"nodes":return"节点";case"chat":return"对话";case"config":return"配置";case"debug":return"调试";case"logs":return"日志";default:return"控制"}}function yl(e){switch(e){case"overview":return"网关状态、入口点及快速健康检查。";case"channels":return"管理通信渠道及其设置。";case"instances":return"已连接客户端和节点的在线状态。";case"sessions":return"查看活跃会话并调整会话默认值。";case"cron":return"安排智能体的唤醒和循环运行。";case"skills":return"管理技能可用性和 API 密钥注入。";case"nodes":return"配对设备、功能及命令暴露。";case"chat":return"直接与网关对话以进行快速干预。";case"config":return"安全编辑 ~/.openclaw/openclaw.json。";case"debug":return"网关快照、事件和手动 RPC 调用。";case"logs":return"实时查看网关日志文件。";default:return""}}const G={messageSquare:o`<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,barChart:o`<svg viewBox="0 0 24 24"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,link:o`<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,radio:o`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>`,fileText:o`<svg viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,send:o`<svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,zap:o`<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,monitor:o`<svg viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,settings:o`<svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,bug:o`<svg viewBox="0 0 24 24"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`,scrollText:o`<svg viewBox="0 0 24 24"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M15 8h-5"/><path d="M15 12h-5"/></svg>`,folder:o`<svg viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,menu:o`<svg viewBox="0 0 24 24"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,x:o`<svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,check:o`<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>`,copy:o`<svg viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,search:o`<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,brain:o`<svg viewBox="0 0 24 24"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>`,book:o`<svg viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,loader:o`<svg viewBox="0 0 24 24"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`,wrench:o`<svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,fileCode:o`<svg viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>`,edit:o`<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,penLine:o`<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,paperclip:o`<svg viewBox="0 0 24 24"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,globe:o`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,image:o`<svg viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,smartphone:o`<svg viewBox="0 0 24 24"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`,plug:o`<svg viewBox="0 0 24 24"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>`,circle:o`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`,puzzle:o`<svg viewBox="0 0 24 24"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.076.874.54 1.02 1.02a2.5 2.5 0 1 0 3.237-3.237c-.48-.146-.944-.505-1.02-1.02a.98.98 0 0 1 .303-.917l1.526-1.526A2.402 2.402 0 0 1 11.998 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.236 3.236c-.464.18-.894.527-.967 1.02Z"/></svg>`},$l=/<\s*\/?\s*(?:think(?:ing)?|thought|antthinking|final)\b/i,Ht=/<\s*\/?\s*final\b[^>]*>/gi,Qs=/<\s*(\/?)\s*(?:think(?:ing)?|thought|antthinking)\b[^>]*>/gi;function wl(e,t){return e.trimStart()}function xl(e,t){if(!e||!$l.test(e))return e;let n=e;Ht.test(n)?(Ht.lastIndex=0,n=n.replace(Ht,"")):Ht.lastIndex=0,Qs.lastIndex=0;let i="",s=0,r=!1;for(const a of n.matchAll(Qs)){const l=a.index??0,c=a[1]==="/";r?c&&(r=!1):(i+=n.slice(s,l),c||(r=!0)),s=l+a[0].length}return i+=n.slice(s),wl(i)}function Et(e){return!e&&e!==0?"无":new Date(e).toLocaleString()}function D(e){if(!e&&e!==0)return"无";const t=Date.now()-e;if(t<0)return"刚刚";const n=Math.round(t/1e3);if(n<60)return`${n} 秒前`;const i=Math.round(n/60);if(i<60)return`${i} 分钟前`;const s=Math.round(i/60);return s<48?`${s} 小时前`:`${Math.round(s/24)} 天前`}function oa(e){if(!e&&e!==0)return"无";if(e<1e3)return`${e} 毫秒`;const t=Math.round(e/1e3);if(t<60)return`${t} 秒`;const n=Math.round(t/60);if(n<60)return`${n} 分钟`;const i=Math.round(n/60);return i<48?`${i} 小时`:`${Math.round(i/24)} 天`}function ai(e){return!e||e.length===0?"无":e.filter(t=>!!(t&&t.trim())).join(", ")}function oi(e,t=120){return e.length<=t?e:`${e.slice(0,Math.max(0,t-1))}…`}function la(e,t){return e.length<=t?{text:e,truncated:!1,total:e.length}:{text:e.slice(0,Math.max(0,t)),truncated:!0,total:e.length}}function tn(e,t){const n=Number(e);return Number.isFinite(n)?n:t}function Fn(e){return xl(e)}const kl=/^\[([^\]]+)\]\s*/,Al=["WebChat","WhatsApp","Telegram","Signal","Slack","Discord","iMessage","Teams","Matrix","Zalo","Zalo Personal","BlueBubbles"],zn=new WeakMap,Un=new WeakMap;function Sl(e){return/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z\b/.test(e)||/\d{4}-\d{2}-\d{2} \d{2}:\d{2}\b/.test(e)?!0:Al.some(t=>e.startsWith(`${t} `))}function Kn(e){const t=e.match(kl);if(!t)return e;const n=t[1]??"";return Sl(n)?e.slice(t[0].length):e}function li(e){const t=e,n=typeof t.role=="string"?t.role:"",i=t.content;if(typeof i=="string")return n==="assistant"?Fn(i):Kn(i);if(Array.isArray(i)){const s=i.map(r=>{const a=r;return a.type==="text"&&typeof a.text=="string"?a.text:null}).filter(r=>typeof r=="string");if(s.length>0){const r=s.join(`
`);return n==="assistant"?Fn(r):Kn(r)}}return typeof t.text=="string"?n==="assistant"?Fn(t.text):Kn(t.text):null}function ca(e){if(!e||typeof e!="object")return li(e);const t=e;if(zn.has(t))return zn.get(t)??null;const n=li(e);return zn.set(t,n),n}function Zs(e){const n=e.content,i=[];if(Array.isArray(n))for(const l of n){const c=l;if(c.type==="thinking"&&typeof c.thinking=="string"){const p=c.thinking.trim();p&&i.push(p)}}if(i.length>0)return i.join(`
`);const s=Tl(e);if(!s)return null;const a=[...s.matchAll(/<\s*think(?:ing)?\s*>([\s\S]*?)<\s*\/\s*think(?:ing)?\s*>/gi)].map(l=>(l[1]??"").trim()).filter(Boolean);return a.length>0?a.join(`
`):null}function _l(e){if(!e||typeof e!="object")return Zs(e);const t=e;if(Un.has(t))return Un.get(t)??null;const n=Zs(e);return Un.set(t,n),n}function Tl(e){const t=e,n=t.content;if(typeof n=="string")return n;if(Array.isArray(n)){const i=n.map(s=>{const r=s;return r.type==="text"&&typeof r.text=="string"?r.text:null}).filter(s=>typeof s=="string");if(i.length>0)return i.join(`
`)}return typeof t.text=="string"?t.text:null}function El(e){const t=e.trim();if(!t)return"";const n=t.split(/\r?\n/).map(i=>i.trim()).filter(Boolean).map(i=>`_${i}_`);return n.length?["_Reasoning:_",...n].join(`
`):""}function Ys(e){e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t="";for(let n=0;n<e.length;n++)t+=e[n].toString(16).padStart(2,"0");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}function Cl(){const e=new Uint8Array(16),t=Date.now();for(let n=0;n<e.length;n++)e[n]=Math.floor(Math.random()*256);return e[0]^=t&255,e[1]^=t>>>8&255,e[2]^=t>>>16&255,e[3]^=t>>>24&255,e}function Di(e=globalThis.crypto){if(e&&typeof e.randomUUID=="function")return e.randomUUID();if(e&&typeof e.getRandomValues=="function"){const t=new Uint8Array(16);return e.getRandomValues(t),Ys(t)}return Ys(Cl())}async function tt(e){if(!(!e.client||!e.connected)){e.chatLoading=!0,e.lastError=null;try{const t=await e.client.request("chat.history",{sessionKey:e.sessionKey,limit:200});e.chatMessages=Array.isArray(t.messages)?t.messages:[],e.chatThinkingLevel=t.thinkingLevel??null}catch(t){e.lastError=String(t)}finally{e.chatLoading=!1}}}function Ml(e){const t=/^data:([^;]+);base64,(.+)$/.exec(e);return t?{mimeType:t[1],content:t[2]}:null}async function Il(e,t,n){if(!e.client||!e.connected)return!1;const i=t.trim(),s=n&&n.length>0;if(!i&&!s)return!1;const r=Date.now(),a=[];if(i&&a.push({type:"text",text:i}),s)for(const p of n)a.push({type:"image",source:{type:"base64",media_type:p.mimeType,data:p.dataUrl}});e.chatMessages=[...e.chatMessages,{role:"user",content:a,timestamp:r}],e.chatSending=!0,e.lastError=null;const l=Di();e.chatRunId=l,e.chatStream="",e.chatStreamStartedAt=r;const c=s?n.map(p=>{const d=Ml(p.dataUrl);return d?{type:"image",mimeType:d.mimeType,content:d.content}:null}).filter(p=>p!==null):void 0;try{return await e.client.request("chat.send",{sessionKey:e.sessionKey,message:i,deliver:!1,idempotencyKey:l,attachments:c}),!0}catch(p){const d=String(p);return e.chatRunId=null,e.chatStream=null,e.chatStreamStartedAt=null,e.lastError=d,e.chatMessages=[...e.chatMessages,{role:"assistant",content:[{type:"text",text:"Error: "+d}],timestamp:Date.now()}],!1}finally{e.chatSending=!1}}async function Ll(e){if(!e.client||!e.connected)return!1;const t=e.chatRunId;try{return await e.client.request("chat.abort",t?{sessionKey:e.sessionKey,runId:t}:{sessionKey:e.sessionKey}),!0}catch(n){return e.lastError=String(n),!1}}function Rl(e,t){if(!t||t.sessionKey!==e.sessionKey)return null;if(t.runId&&e.chatRunId&&t.runId!==e.chatRunId)return t.state==="final"?"final":null;if(t.state==="delta"){const n=li(t.message);if(typeof n=="string"){const i=e.chatStream??"";(!i||n.length>=i.length)&&(e.chatStream=n)}}else t.state==="final"||t.state==="aborted"?(e.chatStream=null,e.chatRunId=null,e.chatStreamStartedAt=null):t.state==="error"&&(e.chatStream=null,e.chatRunId=null,e.chatStreamStartedAt=null,e.lastError=t.errorMessage??"chat error");return t.state}async function at(e){if(!(!e.client||!e.connected)&&!e.sessionsLoading){e.sessionsLoading=!0,e.sessionsError=null;try{const t={includeGlobal:e.sessionsIncludeGlobal,includeUnknown:e.sessionsIncludeUnknown},n=tn(e.sessionsFilterActive,0),i=tn(e.sessionsFilterLimit,0);n>0&&(t.activeMinutes=n),i>0&&(t.limit=i);const s=await e.client.request("sessions.list",t);s&&(e.sessionsResult=s)}catch(t){e.sessionsError=String(t)}finally{e.sessionsLoading=!1}}}async function Pl(e,t,n){if(!e.client||!e.connected)return;const i={key:t};"label"in n&&(i.label=n.label),"thinkingLevel"in n&&(i.thinkingLevel=n.thinkingLevel),"verboseLevel"in n&&(i.verboseLevel=n.verboseLevel),"reasoningLevel"in n&&(i.reasoningLevel=n.reasoningLevel);try{await e.client.request("sessions.patch",i),await at(e)}catch(s){e.sessionsError=String(s)}}async function Ol(e,t){if(!(!e.client||!e.connected||e.sessionsLoading||!window.confirm(`Delete session "${t}"?

Deletes the session entry and archives its transcript.`))){e.sessionsLoading=!0,e.sessionsError=null;try{await e.client.request("sessions.delete",{key:t,deleteTranscript:!0}),await at(e)}catch(i){e.sessionsError=String(i)}finally{e.sessionsLoading=!1}}}const Xs=50,Nl=80,Dl=12e4;function Bl(e){if(!e||typeof e!="object")return null;const t=e;if(typeof t.text=="string")return t.text;const n=t.content;if(!Array.isArray(n))return null;const i=n.map(s=>{if(!s||typeof s!="object")return null;const r=s;return r.type==="text"&&typeof r.text=="string"?r.text:null}).filter(s=>!!s);return i.length===0?null:i.join(`
`)}function Js(e){if(e==null)return null;if(typeof e=="number"||typeof e=="boolean")return String(e);const t=Bl(e);let n;if(typeof e=="string")n=e;else if(t)n=t;else try{n=JSON.stringify(e,null,2)}catch{n=String(e)}const i=la(n,Dl);return i.truncated?`${i.text}

… truncated (${i.total} chars, showing first ${i.text.length}).`:i.text}function Fl(e){const t=[];return t.push({type:"toolcall",name:e.name,arguments:e.args??{}}),e.output&&t.push({type:"toolresult",name:e.name,text:e.output}),{role:"assistant",toolCallId:e.toolCallId,runId:e.runId,content:t,timestamp:e.startedAt}}function zl(e){if(e.toolStreamOrder.length<=Xs)return;const t=e.toolStreamOrder.length-Xs,n=e.toolStreamOrder.splice(0,t);for(const i of n)e.toolStreamById.delete(i)}function Ul(e){e.chatToolMessages=e.toolStreamOrder.map(t=>e.toolStreamById.get(t)?.message).filter(t=>!!t)}function ci(e){e.toolStreamSyncTimer!=null&&(clearTimeout(e.toolStreamSyncTimer),e.toolStreamSyncTimer=null),Ul(e)}function Kl(e,t=!1){if(t){ci(e);return}e.toolStreamSyncTimer==null&&(e.toolStreamSyncTimer=window.setTimeout(()=>ci(e),Nl))}function Bi(e){e.toolStreamById.clear(),e.toolStreamOrder=[],e.chatToolMessages=[],ci(e)}const Hl=5e3;function Wl(e,t){const n=t.data??{},i=typeof n.phase=="string"?n.phase:"";e.compactionClearTimer!=null&&(window.clearTimeout(e.compactionClearTimer),e.compactionClearTimer=null),i==="start"?e.compactionStatus={active:!0,startedAt:Date.now(),completedAt:null}:i==="end"&&(e.compactionStatus={active:!1,startedAt:e.compactionStatus?.startedAt??null,completedAt:Date.now()},e.compactionClearTimer=window.setTimeout(()=>{e.compactionStatus=null,e.compactionClearTimer=null},Hl))}function jl(e,t){if(!t)return;if(t.stream==="compaction"){Wl(e,t);return}if(t.stream!=="tool")return;const n=typeof t.sessionKey=="string"?t.sessionKey:void 0;if(n&&n!==e.sessionKey||!n&&e.chatRunId&&t.runId!==e.chatRunId||e.chatRunId&&t.runId!==e.chatRunId||!e.chatRunId)return;const i=t.data??{},s=typeof i.toolCallId=="string"?i.toolCallId:"";if(!s)return;const r=typeof i.name=="string"?i.name:"tool",a=typeof i.phase=="string"?i.phase:"",l=a==="start"?i.args:void 0,c=a==="update"?Js(i.partialResult):a==="result"?Js(i.result):void 0,p=Date.now();let d=e.toolStreamById.get(s);d?(d.name=r,l!==void 0&&(d.args=l),c!==void 0&&(d.output=c),d.updatedAt=p):(d={toolCallId:s,runId:t.runId,sessionKey:n,name:r,args:l,output:c,startedAt:typeof t.ts=="number"?t.ts:p,updatedAt:p,message:{}},e.toolStreamById.set(s,d),e.toolStreamOrder.push(s)),d.message=Fl(d),zl(e),Kl(e,a==="result")}function fn(e,t=!1){e.chatScrollFrame&&cancelAnimationFrame(e.chatScrollFrame),e.chatScrollTimeout!=null&&(clearTimeout(e.chatScrollTimeout),e.chatScrollTimeout=null);const n=()=>{const i=e.querySelector(".chat-thread");if(i){const s=getComputedStyle(i).overflowY;if(s==="auto"||s==="scroll"||i.scrollHeight-i.clientHeight>1)return i}return document.scrollingElement??document.documentElement};e.updateComplete.then(()=>{e.chatScrollFrame=requestAnimationFrame(()=>{e.chatScrollFrame=null;const i=n();if(!i)return;const s=i.scrollHeight-i.scrollTop-i.clientHeight;if(!(t||e.chatUserNearBottom||s<200))return;t&&(e.chatHasAutoScrolled=!0),i.scrollTop=i.scrollHeight,e.chatUserNearBottom=!0;const a=t?150:120;e.chatScrollTimeout=window.setTimeout(()=>{e.chatScrollTimeout=null;const l=n();if(!l)return;const c=l.scrollHeight-l.scrollTop-l.clientHeight;(t||e.chatUserNearBottom||c<200)&&(l.scrollTop=l.scrollHeight,e.chatUserNearBottom=!0)},a)})})}function da(e,t=!1){e.logsScrollFrame&&cancelAnimationFrame(e.logsScrollFrame),e.updateComplete.then(()=>{e.logsScrollFrame=requestAnimationFrame(()=>{e.logsScrollFrame=null;const n=e.querySelector(".log-stream");if(!n)return;const i=n.scrollHeight-n.scrollTop-n.clientHeight;(t||i<80)&&(n.scrollTop=n.scrollHeight)})})}function ql(e,t){const n=t.currentTarget;if(!n)return;const i=n.scrollHeight-n.scrollTop-n.clientHeight;e.chatUserNearBottom=i<200}function Vl(e,t){const n=t.currentTarget;if(!n)return;const i=n.scrollHeight-n.scrollTop-n.clientHeight;e.logsAtBottom=i<80}function Gl(e){e.chatHasAutoScrolled=!1,e.chatUserNearBottom=!0}function Ql(e,t){if(e.length===0)return;const n=new Blob([`${e.join(`
`)}
`],{type:"text/plain"}),i=URL.createObjectURL(n),s=document.createElement("a"),r=new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");s.href=i,s.download=`clawdbot-logs-${t}-${r}.log`,s.click(),URL.revokeObjectURL(i)}function Zl(e){if(typeof ResizeObserver>"u")return;const t=e.querySelector(".topbar");if(!t)return;const n=()=>{const{height:i}=t.getBoundingClientRect();e.style.setProperty("--topbar-height",`${i}px`)};n(),e.topbarObserver=new ResizeObserver(()=>n()),e.topbarObserver.observe(t)}function Be(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function nt(e){return`${JSON.stringify(e,null,2).trimEnd()}
`}function ua(e,t,n){if(t.length===0)return;let i=e;for(let r=0;r<t.length-1;r+=1){const a=t[r],l=t[r+1];if(typeof a=="number"){if(!Array.isArray(i))return;i[a]==null&&(i[a]=typeof l=="number"?[]:{}),i=i[a]}else{if(typeof i!="object"||i==null)return;const c=i;c[a]==null&&(c[a]=typeof l=="number"?[]:{}),i=c[a]}}const s=t[t.length-1];if(typeof s=="number"){Array.isArray(i)&&(i[s]=n);return}typeof i=="object"&&i!=null&&(i[s]=n)}function pa(e,t){if(t.length===0)return;let n=e;for(let s=0;s<t.length-1;s+=1){const r=t[s];if(typeof r=="number"){if(!Array.isArray(n))return;n=n[r]}else{if(typeof n!="object"||n==null)return;n=n[r]}if(n==null)return}const i=t[t.length-1];if(typeof i=="number"){Array.isArray(n)&&n.splice(i,1);return}typeof n=="object"&&n!=null&&delete n[i]}async function ye(e){if(!(!e.client||!e.connected)){e.configLoading=!0,e.lastError=null;try{const t=await e.client.request("config.get",{});Xl(e,t)}catch(t){e.lastError=String(t)}finally{e.configLoading=!1}}}async function fa(e){if(!(!e.client||!e.connected)&&!e.configSchemaLoading){e.configSchemaLoading=!0;try{const t=await e.client.request("config.schema",{});Yl(e,t)}catch(t){e.lastError=String(t)}finally{e.configSchemaLoading=!1}}}function Yl(e,t){e.configSchema=t.schema??null,e.configUiHints=t.uiHints??{},e.configSchemaVersion=t.version??null}function Xl(e,t){e.configSnapshot=t;const n=typeof t.raw=="string"?t.raw:t.config&&typeof t.config=="object"?nt(t.config):e.configRaw;!e.configFormDirty||e.configFormMode==="raw"?e.configRaw=n:e.configForm?e.configRaw=nt(e.configForm):e.configRaw=n,e.configValid=typeof t.valid=="boolean"?t.valid:null,e.configIssues=Array.isArray(t.issues)?t.issues:[],e.configFormDirty||(e.configForm=Be(t.config??{}),e.configFormOriginal=Be(t.config??{}),e.configRawOriginal=n)}async function di(e){if(!(!e.client||!e.connected)){e.configSaving=!0,e.lastError=null;try{const t=e.configFormMode==="form"&&e.configForm?nt(e.configForm):e.configRaw,n=e.configSnapshot?.hash;if(!n){e.lastError="Config hash missing; reload and retry.";return}await e.client.request("config.set",{raw:t,baseHash:n}),e.configFormDirty=!1,await ye(e)}catch(t){e.lastError=String(t)}finally{e.configSaving=!1}}}async function Jl(e){if(!(!e.client||!e.connected)){e.configApplying=!0,e.lastError=null;try{const t=e.configFormMode==="form"&&e.configForm?nt(e.configForm):e.configRaw,n=e.configSnapshot?.hash;if(!n){e.lastError="Config hash missing; reload and retry.";return}await e.client.request("config.apply",{raw:t,baseHash:n,sessionKey:e.applySessionKey}),e.configFormDirty=!1,await ye(e)}catch(t){e.lastError=String(t)}finally{e.configApplying=!1}}}async function ec(e){if(!(!e.client||!e.connected)){e.updateRunning=!0,e.lastError=null;try{await e.client.request("update.run",{sessionKey:e.applySessionKey})}catch(t){e.lastError=String(t)}finally{e.updateRunning=!1}}}function yt(e,t,n){const i=Be(e.configForm??e.configSnapshot?.config??{});ua(i,t,n),e.configForm=i,e.configFormDirty=!0,e.configFormMode==="form"&&(e.configRaw=nt(i))}function er(e,t){const n=Be(e.configForm??e.configSnapshot?.config??{});pa(n,t),e.configForm=n,e.configFormDirty=!0,e.configFormMode==="form"&&(e.configRaw=nt(n))}async function tc(e,t){if(!e.client||!e.connected||!e.configForm)return;const n=e.configForm.models;if(!n||!n.providers)return;const i=n.providers[t];if(i){e.configSaving=!0,e.lastError=null;try{const s=await e.client.request("models.discover",{provider:t,apiKey:i.apiKey,baseUrl:i.baseUrl});if(s&&Array.isArray(s.models)&&s.models.length>0){const r=i.models??[],a=s.models;return yt(e,["models","providers",t,"models"],a),{success:!0,count:a.length}}else return e.lastError="No models found or error during discovery.",{success:!1,error:e.lastError}}catch(s){return e.lastError=String(s),{success:!1,error:e.lastError}}finally{e.configSaving=!1}}}async function It(e){if(!(!e.client||!e.connected))try{const t=await e.client.request("cron.status",{});e.cronStatus=t}catch(t){e.cronError=String(t)}}async function hn(e){if(!(!e.client||!e.connected)&&!e.cronLoading){e.cronLoading=!0,e.cronError=null;try{const t=await e.client.request("cron.list",{includeDisabled:!0});e.cronJobs=Array.isArray(t.jobs)?t.jobs:[]}catch(t){e.cronError=String(t)}finally{e.cronLoading=!1}}}function nc(e){if(e.scheduleKind==="at"){const n=Date.parse(e.scheduleAt);if(!Number.isFinite(n))throw new Error("Invalid run time.");return{kind:"at",atMs:n}}if(e.scheduleKind==="every"){const n=tn(e.everyAmount,0);if(n<=0)throw new Error("Invalid interval amount.");const i=e.everyUnit;return{kind:"every",everyMs:n*(i==="minutes"?6e4:i==="hours"?36e5:864e5)}}const t=e.cronExpr.trim();if(!t)throw new Error("Cron expression required.");return{kind:"cron",expr:t,tz:e.cronTz.trim()||void 0}}function ic(e){if(e.payloadKind==="systemEvent"){const s=e.payloadText.trim();if(!s)throw new Error("System event text required.");return{kind:"systemEvent",text:s}}const t=e.payloadText.trim();if(!t)throw new Error("Agent message required.");const n={kind:"agentTurn",message:t};e.deliver&&(n.deliver=!0),e.channel&&(n.channel=e.channel),e.to.trim()&&(n.to=e.to.trim());const i=tn(e.timeoutSeconds,0);return i>0&&(n.timeoutSeconds=i),n}async function sc(e){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{const t=nc(e.cronForm),n=ic(e.cronForm),i=e.cronForm.agentId.trim(),s={name:e.cronForm.name.trim(),description:e.cronForm.description.trim()||void 0,agentId:i||void 0,enabled:e.cronForm.enabled,schedule:t,sessionTarget:e.cronForm.sessionTarget,wakeMode:e.cronForm.wakeMode,payload:n,isolation:e.cronForm.postToMainPrefix.trim()&&e.cronForm.sessionTarget==="isolated"?{postToMainPrefix:e.cronForm.postToMainPrefix.trim()}:void 0};if(!s.name)throw new Error("Name required.");await e.client.request("cron.add",s),e.cronForm={...e.cronForm,name:"",description:"",payloadText:""},await hn(e),await It(e)}catch(t){e.cronError=String(t)}finally{e.cronBusy=!1}}}async function rc(e,t,n){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.update",{id:t.id,patch:{enabled:n}}),await hn(e),await It(e)}catch(i){e.cronError=String(i)}finally{e.cronBusy=!1}}}async function ac(e,t){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.run",{id:t.id,mode:"force"}),await ha(e,t.id)}catch(n){e.cronError=String(n)}finally{e.cronBusy=!1}}}async function oc(e,t){if(!(!e.client||!e.connected||e.cronBusy)){e.cronBusy=!0,e.cronError=null;try{await e.client.request("cron.remove",{id:t.id}),e.cronRunsJobId===t.id&&(e.cronRunsJobId=null,e.cronRuns=[]),await hn(e),await It(e)}catch(n){e.cronError=String(n)}finally{e.cronBusy=!1}}}async function ha(e,t){if(!(!e.client||!e.connected))try{const n=await e.client.request("cron.runs",{id:t,limit:50});e.cronRunsJobId=t,e.cronRuns=Array.isArray(n.entries)?n.entries:[]}catch(n){e.cronError=String(n)}}async function le(e,t){if(!(!e.client||!e.connected)&&!e.channelsLoading){e.channelsLoading=!0,e.channelsError=null;try{const n=await e.client.request("channels.status",{probe:t,timeoutMs:8e3});e.channelsSnapshot=n,e.channelsLastSuccess=Date.now()}catch(n){e.channelsError=String(n)}finally{e.channelsLoading=!1}}}async function lc(e,t){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{const n=await e.client.request("web.login.start",{force:t,timeoutMs:3e4});e.whatsappLoginMessage=n.message??null,e.whatsappLoginQrDataUrl=n.qrDataUrl??null,e.whatsappLoginConnected=null}catch(n){e.whatsappLoginMessage=String(n),e.whatsappLoginQrDataUrl=null,e.whatsappLoginConnected=null}finally{e.whatsappBusy=!1}}}async function cc(e){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{const t=await e.client.request("web.login.wait",{timeoutMs:12e4});e.whatsappLoginMessage=t.message??null,e.whatsappLoginConnected=t.connected??null,t.connected&&(e.whatsappLoginQrDataUrl=null)}catch(t){e.whatsappLoginMessage=String(t),e.whatsappLoginConnected=null}finally{e.whatsappBusy=!1}}}async function dc(e){if(!(!e.client||!e.connected||e.whatsappBusy)){e.whatsappBusy=!0;try{await e.client.request("channels.logout",{channel:"whatsapp"}),e.whatsappLoginMessage="Logged out.",e.whatsappLoginQrDataUrl=null,e.whatsappLoginConnected=null}catch(t){e.whatsappLoginMessage=String(t)}finally{e.whatsappBusy=!1}}}async function gn(e){if(!(!e.client||!e.connected)&&!e.debugLoading){e.debugLoading=!0;try{const[t,n,i,s]=await Promise.all([e.client.request("status",{}),e.client.request("health",{}),e.client.request("models.list",{}),e.client.request("last-heartbeat",{})]);e.debugStatus=t,e.debugHealth=n;const r=i;e.debugModels=Array.isArray(r?.models)?r?.models:[],e.debugHeartbeat=s}catch(t){e.debugCallError=String(t)}finally{e.debugLoading=!1}}}async function uc(e){if(!(!e.client||!e.connected)){e.debugCallError=null,e.debugCallResult=null;try{const t=e.debugCallParams.trim()?JSON.parse(e.debugCallParams):{},n=await e.client.request(e.debugCallMethod.trim(),t);e.debugCallResult=JSON.stringify(n,null,2)}catch(t){e.debugCallError=String(t)}}}const pc=2e3,fc=new Set(["trace","debug","info","warn","error","fatal"]);function hc(e){if(typeof e!="string")return null;const t=e.trim();if(!t.startsWith("{")||!t.endsWith("}"))return null;try{const n=JSON.parse(t);return!n||typeof n!="object"?null:n}catch{return null}}function gc(e){if(typeof e!="string")return null;const t=e.toLowerCase();return fc.has(t)?t:null}function vc(e){if(!e.trim())return{raw:e,message:e};try{const t=JSON.parse(e),n=t&&typeof t._meta=="object"&&t._meta!==null?t._meta:null,i=typeof t.time=="string"?t.time:typeof n?.date=="string"?n?.date:null,s=gc(n?.logLevelName??n?.level),r=typeof t[0]=="string"?t[0]:typeof n?.name=="string"?n?.name:null,a=hc(r);let l=null;a&&(typeof a.subsystem=="string"?l=a.subsystem:typeof a.module=="string"&&(l=a.module)),!l&&r&&r.length<120&&(l=r);let c=null;return typeof t[1]=="string"?c=t[1]:!a&&typeof t[0]=="string"?c=t[0]:typeof t.message=="string"&&(c=t.message),{raw:e,time:i,level:s,subsystem:l,message:c??e,meta:n??void 0}}catch{return{raw:e,message:e}}}async function Fi(e,t){if(!(!e.client||!e.connected)&&!(e.logsLoading&&!t?.quiet)){t?.quiet||(e.logsLoading=!0),e.logsError=null;try{const i=await e.client.request("logs.tail",{cursor:t?.reset?void 0:e.logsCursor??void 0,limit:e.logsLimit,maxBytes:e.logsMaxBytes}),r=(Array.isArray(i.lines)?i.lines.filter(l=>typeof l=="string"):[]).map(vc),a=!!(t?.reset||i.reset||e.logsCursor==null);e.logsEntries=a?r:[...e.logsEntries,...r].slice(-pc),typeof i.cursor=="number"&&(e.logsCursor=i.cursor),typeof i.file=="string"&&(e.logsFile=i.file),e.logsTruncated=!!i.truncated,e.logsLastFetchAt=Date.now()}catch(n){e.logsError=String(n)}finally{t?.quiet||(e.logsLoading=!1)}}}const ga={p:0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffedn,n:0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3edn,h:8n,a:0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffecn,d:0x52036cee2b6ffe738cc740797779e89800700a4d4141d8ab75eb4dca135978a3n,Gx:0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51an,Gy:0x6666666666666666666666666666666666666666666666666666666666666658n},{p:V,n:Yt,Gx:tr,Gy:nr,a:Hn,d:Wn,h:mc}=ga,Fe=32,zi=64,bc=(...e)=>{"captureStackTrace"in Error&&typeof Error.captureStackTrace=="function"&&Error.captureStackTrace(...e)},H=(e="")=>{const t=new Error(e);throw bc(t,H),t},yc=e=>typeof e=="bigint",$c=e=>typeof e=="string",wc=e=>e instanceof Uint8Array||ArrayBuffer.isView(e)&&e.constructor.name==="Uint8Array",Te=(e,t,n="")=>{const i=wc(e),s=e?.length,r=t!==void 0;if(!i||r&&s!==t){const a=n&&`"${n}" `,l=r?` of length ${t}`:"",c=i?`length=${s}`:`type=${typeof e}`;H(a+"expected Uint8Array"+l+", got "+c)}return e},vn=e=>new Uint8Array(e),va=e=>Uint8Array.from(e),ma=(e,t)=>e.toString(16).padStart(t,"0"),ba=e=>Array.from(Te(e)).map(t=>ma(t,2)).join(""),me={_0:48,_9:57,A:65,F:70,a:97,f:102},ir=e=>{if(e>=me._0&&e<=me._9)return e-me._0;if(e>=me.A&&e<=me.F)return e-(me.A-10);if(e>=me.a&&e<=me.f)return e-(me.a-10)},ya=e=>{const t="hex invalid";if(!$c(e))return H(t);const n=e.length,i=n/2;if(n%2)return H(t);const s=vn(i);for(let r=0,a=0;r<i;r++,a+=2){const l=ir(e.charCodeAt(a)),c=ir(e.charCodeAt(a+1));if(l===void 0||c===void 0)return H(t);s[r]=l*16+c}return s},$a=()=>globalThis?.crypto,xc=()=>$a()?.subtle??H("crypto.subtle must be defined, consider polyfill"),Ct=(...e)=>{const t=vn(e.reduce((i,s)=>i+Te(s).length,0));let n=0;return e.forEach(i=>{t.set(i,n),n+=i.length}),t},kc=(e=Fe)=>$a().getRandomValues(vn(e)),nn=BigInt,Pe=(e,t,n,i="bad number: out of range")=>yc(e)&&t<=e&&e<n?e:H(i),S=(e,t=V)=>{const n=e%t;return n>=0n?n:t+n},wa=e=>S(e,Yt),Ac=(e,t)=>{(e===0n||t<=0n)&&H("no inverse n="+e+" mod="+t);let n=S(e,t),i=t,s=0n,r=1n;for(;n!==0n;){const a=i/n,l=i%n,c=s-r*a;i=n,n=l,s=r,r=c}return i===1n?S(s,t):H("no inverse")},Sc=e=>{const t=Sa[e];return typeof t!="function"&&H("hashes."+e+" not set"),t},jn=e=>e instanceof ne?e:H("Point expected"),ui=2n**256n;class ne{static BASE;static ZERO;X;Y;Z;T;constructor(t,n,i,s){const r=ui;this.X=Pe(t,0n,r),this.Y=Pe(n,0n,r),this.Z=Pe(i,1n,r),this.T=Pe(s,0n,r),Object.freeze(this)}static CURVE(){return ga}static fromAffine(t){return new ne(t.x,t.y,1n,S(t.x*t.y))}static fromBytes(t,n=!1){const i=Wn,s=va(Te(t,Fe)),r=t[31];s[31]=r&-129;const a=ka(s);Pe(a,0n,n?ui:V);const c=S(a*a),p=S(c-1n),d=S(i*c+1n);let{isValid:u,value:v}=Tc(p,d);u||H("bad point: y not sqrt");const g=(v&1n)===1n,$=(r&128)!==0;return!n&&v===0n&&$&&H("bad point: x==0, isLastByteOdd"),$!==g&&(v=S(-v)),new ne(v,a,1n,S(v*a))}static fromHex(t,n){return ne.fromBytes(ya(t),n)}get x(){return this.toAffine().x}get y(){return this.toAffine().y}assertValidity(){const t=Hn,n=Wn,i=this;if(i.is0())return H("bad point: ZERO");const{X:s,Y:r,Z:a,T:l}=i,c=S(s*s),p=S(r*r),d=S(a*a),u=S(d*d),v=S(c*t),g=S(d*S(v+p)),$=S(u+S(n*S(c*p)));if(g!==$)return H("bad point: equation left != right (1)");const w=S(s*r),k=S(a*l);return w!==k?H("bad point: equation left != right (2)"):this}equals(t){const{X:n,Y:i,Z:s}=this,{X:r,Y:a,Z:l}=jn(t),c=S(n*l),p=S(r*s),d=S(i*l),u=S(a*s);return c===p&&d===u}is0(){return this.equals(Xe)}negate(){return new ne(S(-this.X),this.Y,this.Z,S(-this.T))}double(){const{X:t,Y:n,Z:i}=this,s=Hn,r=S(t*t),a=S(n*n),l=S(2n*S(i*i)),c=S(s*r),p=t+n,d=S(S(p*p)-r-a),u=c+a,v=u-l,g=c-a,$=S(d*v),w=S(u*g),k=S(d*g),E=S(v*u);return new ne($,w,E,k)}add(t){const{X:n,Y:i,Z:s,T:r}=this,{X:a,Y:l,Z:c,T:p}=jn(t),d=Hn,u=Wn,v=S(n*a),g=S(i*l),$=S(r*u*p),w=S(s*c),k=S((n+i)*(a+l)-v-g),E=S(w-$),C=S(w+$),N=S(g-d*v),I=S(k*E),L=S(C*N),A=S(k*N),O=S(E*C);return new ne(I,L,O,A)}subtract(t){return this.add(jn(t).negate())}multiply(t,n=!0){if(!n&&(t===0n||this.is0()))return Xe;if(Pe(t,1n,Yt),t===1n)return this;if(this.equals(ze))return Bc(t).p;let i=Xe,s=ze;for(let r=this;t>0n;r=r.double(),t>>=1n)t&1n?i=i.add(r):n&&(s=s.add(r));return i}multiplyUnsafe(t){return this.multiply(t,!1)}toAffine(){const{X:t,Y:n,Z:i}=this;if(this.equals(Xe))return{x:0n,y:1n};const s=Ac(i,V);S(i*s)!==1n&&H("invalid inverse");const r=S(t*s),a=S(n*s);return{x:r,y:a}}toBytes(){const{x:t,y:n}=this.assertValidity().toAffine(),i=xa(n);return i[31]|=t&1n?128:0,i}toHex(){return ba(this.toBytes())}clearCofactor(){return this.multiply(nn(mc),!1)}isSmallOrder(){return this.clearCofactor().is0()}isTorsionFree(){let t=this.multiply(Yt/2n,!1).double();return Yt%2n&&(t=t.add(this)),t.is0()}}const ze=new ne(tr,nr,1n,S(tr*nr)),Xe=new ne(0n,1n,1n,0n);ne.BASE=ze;ne.ZERO=Xe;const xa=e=>ya(ma(Pe(e,0n,ui),zi)).reverse(),ka=e=>nn("0x"+ba(va(Te(e)).reverse())),ue=(e,t)=>{let n=e;for(;t-- >0n;)n*=n,n%=V;return n},_c=e=>{const n=e*e%V*e%V,i=ue(n,2n)*n%V,s=ue(i,1n)*e%V,r=ue(s,5n)*s%V,a=ue(r,10n)*r%V,l=ue(a,20n)*a%V,c=ue(l,40n)*l%V,p=ue(c,80n)*c%V,d=ue(p,80n)*c%V,u=ue(d,10n)*r%V;return{pow_p_5_8:ue(u,2n)*e%V,b2:n}},sr=0x2b8324804fc1df0b2b4d00993dfbd7a72f431806ad2fe478c4ee1b274a0ea0b0n,Tc=(e,t)=>{const n=S(t*t*t),i=S(n*n*t),s=_c(e*i).pow_p_5_8;let r=S(e*n*s);const a=S(t*r*r),l=r,c=S(r*sr),p=a===e,d=a===S(-e),u=a===S(-e*sr);return p&&(r=l),(d||u)&&(r=c),(S(r)&1n)===1n&&(r=S(-r)),{isValid:p||d,value:r}},pi=e=>wa(ka(e)),Ui=(...e)=>Sa.sha512Async(Ct(...e)),Ec=(...e)=>Sc("sha512")(Ct(...e)),Aa=e=>{const t=e.slice(0,Fe);t[0]&=248,t[31]&=127,t[31]|=64;const n=e.slice(Fe,zi),i=pi(t),s=ze.multiply(i),r=s.toBytes();return{head:t,prefix:n,scalar:i,point:s,pointBytes:r}},Ki=e=>Ui(Te(e,Fe)).then(Aa),Cc=e=>Aa(Ec(Te(e,Fe))),Mc=e=>Ki(e).then(t=>t.pointBytes),Ic=e=>Ui(e.hashable).then(e.finish),Lc=(e,t,n)=>{const{pointBytes:i,scalar:s}=e,r=pi(t),a=ze.multiply(r).toBytes();return{hashable:Ct(a,i,n),finish:p=>{const d=wa(r+pi(p)*s);return Te(Ct(a,xa(d)),zi)}}},Rc=async(e,t)=>{const n=Te(e),i=await Ki(t),s=await Ui(i.prefix,n);return Ic(Lc(i,s,n))},Sa={sha512Async:async e=>{const t=xc(),n=Ct(e);return vn(await t.digest("SHA-512",n.buffer))},sha512:void 0},Pc=(e=kc(Fe))=>e,Oc={getExtendedPublicKeyAsync:Ki,getExtendedPublicKey:Cc,randomSecretKey:Pc},sn=8,Nc=256,_a=Math.ceil(Nc/sn)+1,fi=2**(sn-1),Dc=()=>{const e=[];let t=ze,n=t;for(let i=0;i<_a;i++){n=t,e.push(n);for(let s=1;s<fi;s++)n=n.add(t),e.push(n);t=n.double()}return e};let rr;const ar=(e,t)=>{const n=t.negate();return e?n:t},Bc=e=>{const t=rr||(rr=Dc());let n=Xe,i=ze;const s=2**sn,r=s,a=nn(s-1),l=nn(sn);for(let c=0;c<_a;c++){let p=Number(e&a);e>>=l,p>fi&&(p-=r,e+=1n);const d=c*fi,u=d,v=d+Math.abs(p)-1,g=c%2!==0,$=p<0;p===0?i=i.add(ar(g,t[u])):n=n.add(ar($,t[v]))}return e!==0n&&H("invalid wnaf"),{p:n,f:i}},qn="clawdbot-device-identity-v1";function hi(e){let t="";for(const n of e)t+=String.fromCharCode(n);return btoa(t).replaceAll("+","-").replaceAll("/","_").replace(/=+$/g,"")}function Ta(e){const t=e.replaceAll("-","+").replaceAll("_","/"),n=t+"=".repeat((4-t.length%4)%4),i=atob(n),s=new Uint8Array(i.length);for(let r=0;r<i.length;r+=1)s[r]=i.charCodeAt(r);return s}function Fc(e){return Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}async function Ea(e){const t=await crypto.subtle.digest("SHA-256",e);return Fc(new Uint8Array(t))}async function zc(){const e=Oc.randomSecretKey(),t=await Mc(e);return{deviceId:await Ea(t),publicKey:hi(t),privateKey:hi(e)}}async function Hi(){try{const n=localStorage.getItem(qn);if(n){const i=JSON.parse(n);if(i?.version===1&&typeof i.deviceId=="string"&&typeof i.publicKey=="string"&&typeof i.privateKey=="string"){const s=await Ea(Ta(i.publicKey));if(s!==i.deviceId){const r={...i,deviceId:s};return localStorage.setItem(qn,JSON.stringify(r)),{deviceId:s,publicKey:i.publicKey,privateKey:i.privateKey}}return{deviceId:i.deviceId,publicKey:i.publicKey,privateKey:i.privateKey}}}}catch{}const e=await zc(),t={version:1,deviceId:e.deviceId,publicKey:e.publicKey,privateKey:e.privateKey,createdAtMs:Date.now()};return localStorage.setItem(qn,JSON.stringify(t)),e}async function Uc(e,t){const n=Ta(e),i=new TextEncoder().encode(t),s=await Rc(i,n);return hi(s)}const Ca="clawdbot.device.auth.v1";function Wi(e){return e.trim()}function Kc(e){if(!Array.isArray(e))return[];const t=new Set;for(const n of e){const i=n.trim();i&&t.add(i)}return[...t].sort()}function ji(){try{const e=window.localStorage.getItem(Ca);if(!e)return null;const t=JSON.parse(e);return!t||t.version!==1||!t.deviceId||typeof t.deviceId!="string"||!t.tokens||typeof t.tokens!="object"?null:t}catch{return null}}function Ma(e){try{window.localStorage.setItem(Ca,JSON.stringify(e))}catch{}}function Hc(e){const t=ji();if(!t||t.deviceId!==e.deviceId)return null;const n=Wi(e.role),i=t.tokens[n];return!i||typeof i.token!="string"?null:i}function Ia(e){const t=Wi(e.role),n={version:1,deviceId:e.deviceId,tokens:{}},i=ji();i&&i.deviceId===e.deviceId&&(n.tokens={...i.tokens});const s={token:e.token,role:t,scopes:Kc(e.scopes),updatedAtMs:Date.now()};return n.tokens[t]=s,Ma(n),s}function La(e){const t=ji();if(!t||t.deviceId!==e.deviceId)return;const n=Wi(e.role);if(!t.tokens[n])return;const i={...t,tokens:{...t.tokens}};delete i.tokens[n],Ma(i)}async function Ee(e,t){if(!(!e.client||!e.connected)&&!e.devicesLoading){e.devicesLoading=!0,t?.quiet||(e.devicesError=null);try{const n=await e.client.request("device.pair.list",{});e.devicesList={pending:Array.isArray(n?.pending)?n.pending:[],paired:Array.isArray(n?.paired)?n.paired:[]}}catch(n){t?.quiet||(e.devicesError=String(n))}finally{e.devicesLoading=!1}}}async function Wc(e,t){if(!(!e.client||!e.connected))try{await e.client.request("device.pair.approve",{requestId:t}),await Ee(e)}catch(n){e.devicesError=String(n)}}async function jc(e,t){if(!(!e.client||!e.connected||!window.confirm("Reject this device pairing request?")))try{await e.client.request("device.pair.reject",{requestId:t}),await Ee(e)}catch(i){e.devicesError=String(i)}}async function qc(e,t){if(!(!e.client||!e.connected))try{const n=await e.client.request("device.token.rotate",t);if(n?.token){const i=await Hi(),s=n.role??t.role;(n.deviceId===i.deviceId||t.deviceId===i.deviceId)&&Ia({deviceId:i.deviceId,role:s,token:n.token,scopes:n.scopes??t.scopes??[]}),window.prompt("New device token (copy and store securely):",n.token)}await Ee(e)}catch(n){e.devicesError=String(n)}}async function Vc(e,t){if(!(!e.client||!e.connected||!window.confirm(`Revoke token for ${t.deviceId} (${t.role})?`)))try{await e.client.request("device.token.revoke",t);const i=await Hi();t.deviceId===i.deviceId&&La({deviceId:i.deviceId,role:t.role}),await Ee(e)}catch(i){e.devicesError=String(i)}}async function mn(e,t){if(!(!e.client||!e.connected)&&!e.nodesLoading){e.nodesLoading=!0,t?.quiet||(e.lastError=null);try{const n=await e.client.request("node.list",{});e.nodes=Array.isArray(n.nodes)?n.nodes:[]}catch(n){t?.quiet||(e.lastError=String(n))}finally{e.nodesLoading=!1}}}function Gc(e){if(!e||e.kind==="gateway")return{method:"exec.approvals.get",params:{}};const t=e.nodeId.trim();return t?{method:"exec.approvals.node.get",params:{nodeId:t}}:null}function Qc(e,t){if(!e||e.kind==="gateway")return{method:"exec.approvals.set",params:t};const n=e.nodeId.trim();return n?{method:"exec.approvals.node.set",params:{...t,nodeId:n}}:null}async function qi(e,t){if(!(!e.client||!e.connected)&&!e.execApprovalsLoading){e.execApprovalsLoading=!0,e.lastError=null;try{const n=Gc(t);if(!n){e.lastError="Select a node before loading exec approvals.";return}const i=await e.client.request(n.method,n.params);Zc(e,i)}catch(n){e.lastError=String(n)}finally{e.execApprovalsLoading=!1}}}function Zc(e,t){e.execApprovalsSnapshot=t,e.execApprovalsDirty||(e.execApprovalsForm=Be(t.file??{}))}async function Yc(e,t){if(!(!e.client||!e.connected)){e.execApprovalsSaving=!0,e.lastError=null;try{const n=e.execApprovalsSnapshot?.hash;if(!n){e.lastError="Exec approvals hash missing; reload and retry.";return}const i=e.execApprovalsForm??e.execApprovalsSnapshot?.file??{},s=Qc(t,{file:i,baseHash:n});if(!s){e.lastError="Select a node before saving exec approvals.";return}await e.client.request(s.method,s.params),e.execApprovalsDirty=!1,await qi(e,t)}catch(n){e.lastError=String(n)}finally{e.execApprovalsSaving=!1}}}function Xc(e,t,n){const i=Be(e.execApprovalsForm??e.execApprovalsSnapshot?.file??{});ua(i,t,n),e.execApprovalsForm=i,e.execApprovalsDirty=!0}function Jc(e,t){const n=Be(e.execApprovalsForm??e.execApprovalsSnapshot?.file??{});pa(n,t),e.execApprovalsForm=n,e.execApprovalsDirty=!0}async function Vi(e){if(!(!e.client||!e.connected)&&!e.presenceLoading){e.presenceLoading=!0,e.presenceError=null,e.presenceStatus=null;try{const t=await e.client.request("system-presence",{});Array.isArray(t)?(e.presenceEntries=t,e.presenceStatus=t.length===0?"No instances yet.":null):(e.presenceEntries=[],e.presenceStatus="No presence payload.")}catch(t){e.presenceError=String(t)}finally{e.presenceLoading=!1}}}function it(e,t,n){if(!t.trim())return;const i={...e.skillMessages};n?i[t]=n:delete i[t],e.skillMessages=i}function bn(e){return e instanceof Error?e.message:String(e)}async function Lt(e,t){if(t?.clearMessages&&Object.keys(e.skillMessages).length>0&&(e.skillMessages={}),!(!e.client||!e.connected)&&!e.skillsLoading){e.skillsLoading=!0,e.skillsError=null;try{const n=await e.client.request("skills.status",{});n&&(e.skillsReport=n)}catch(n){e.skillsError=bn(n)}finally{e.skillsLoading=!1}}}function ed(e,t,n){e.skillEdits={...e.skillEdits,[t]:n}}async function td(e,t,n){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{await e.client.request("skills.update",{skillKey:t,enabled:n}),await Lt(e),it(e,t,{kind:"success",message:n?"Skill enabled":"Skill disabled"})}catch(i){const s=bn(i);e.skillsError=s,it(e,t,{kind:"error",message:s})}finally{e.skillsBusyKey=null}}}async function nd(e,t){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{const n=e.skillEdits[t]??"";await e.client.request("skills.update",{skillKey:t,apiKey:n}),await Lt(e),it(e,t,{kind:"success",message:"API key saved"})}catch(n){const i=bn(n);e.skillsError=i,it(e,t,{kind:"error",message:i})}finally{e.skillsBusyKey=null}}}async function id(e,t,n,i){if(!(!e.client||!e.connected)){e.skillsBusyKey=t,e.skillsError=null;try{const s=await e.client.request("skills.install",{name:n,installId:i,timeoutMs:12e4});await Lt(e),it(e,t,{kind:"success",message:s?.message??"Installed"})}catch(s){const r=bn(s);e.skillsError=r,it(e,t,{kind:"error",message:r})}finally{e.skillsBusyKey=null}}}function sd(){return typeof window>"u"||typeof window.matchMedia!="function"||window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function Gi(e){return e==="system"?sd():e}const Wt=e=>Number.isNaN(e)?.5:e<=0?0:e>=1?1:e,rd=()=>typeof window>"u"||typeof window.matchMedia!="function"?!1:window.matchMedia("(prefers-reduced-motion: reduce)").matches??!1,jt=e=>{e.classList.remove("theme-transition"),e.style.removeProperty("--theme-switch-x"),e.style.removeProperty("--theme-switch-y")},ad=({nextTheme:e,applyTheme:t,context:n,currentTheme:i})=>{if(i===e)return;const s=globalThis.document??null;if(!s){t();return}const r=s.documentElement,a=s,l=rd();if(!!a.startViewTransition&&!l){let p=.5,d=.5;if(n?.pointerClientX!==void 0&&n?.pointerClientY!==void 0&&typeof window<"u")p=Wt(n.pointerClientX/window.innerWidth),d=Wt(n.pointerClientY/window.innerHeight);else if(n?.element){const u=n.element.getBoundingClientRect();u.width>0&&u.height>0&&typeof window<"u"&&(p=Wt((u.left+u.width/2)/window.innerWidth),d=Wt((u.top+u.height/2)/window.innerHeight))}r.style.setProperty("--theme-switch-x",`${p*100}%`),r.style.setProperty("--theme-switch-y",`${d*100}%`),r.classList.add("theme-transition");try{const u=a.startViewTransition?.(()=>{t()});u?.finished?u.finished.finally(()=>jt(r)):jt(r)}catch{jt(r),t()}return}t(),jt(r)};function od(e){e.nodesPollInterval==null&&(e.nodesPollInterval=window.setInterval(()=>{mn(e,{quiet:!0})},5e3))}function ld(e){e.nodesPollInterval!=null&&(clearInterval(e.nodesPollInterval),e.nodesPollInterval=null)}function Qi(e){e.logsPollInterval==null&&(e.logsPollInterval=window.setInterval(()=>{e.tab==="logs"&&Fi(e,{quiet:!0})},2e3))}function Zi(e){e.logsPollInterval!=null&&(clearInterval(e.logsPollInterval),e.logsPollInterval=null)}function Yi(e){e.debugPollInterval==null&&(e.debugPollInterval=window.setInterval(()=>{e.tab==="debug"&&gn(e)},3e3))}function Xi(e){e.debugPollInterval!=null&&(clearInterval(e.debugPollInterval),e.debugPollInterval=null)}function Ae(e,t){const n={...t,lastActiveSessionKey:t.lastActiveSessionKey?.trim()||t.sessionKey.trim()||"main"};e.settings=n,gl(n),t.theme!==e.theme&&(e.theme=t.theme,yn(e,Gi(t.theme))),e.applySessionKey=e.settings.lastActiveSessionKey}function Ra(e,t){const n=t.trim();n&&e.settings.lastActiveSessionKey!==n&&Ae(e,{...e.settings,lastActiveSessionKey:n})}function cd(e){if(!window.location.search)return;const t=new URLSearchParams(window.location.search),n=t.get("token"),i=t.get("password"),s=t.get("session"),r=t.get("gatewayUrl");let a=!1;if(n!=null){const c=n.trim();c&&c!==e.settings.token&&Ae(e,{...e.settings,token:c}),t.delete("token"),a=!0}if(i!=null){const c=i.trim();c&&(e.password=c),t.delete("password"),a=!0}if(s!=null){const c=s.trim();c&&(e.sessionKey=c,Ae(e,{...e.settings,sessionKey:c,lastActiveSessionKey:c}))}if(r!=null){const c=r.trim();c&&c!==e.settings.gatewayUrl&&Ae(e,{...e.settings,gatewayUrl:c}),t.delete("gatewayUrl"),a=!0}if(!a)return;const l=new URL(window.location.href);l.search=t.toString(),window.history.replaceState({},"",l.toString())}function dd(e,t){e.tab!==t&&(e.tab=t),t==="chat"&&(e.chatHasAutoScrolled=!1),t==="logs"?Qi(e):Zi(e),t==="debug"?Yi(e):Xi(e),Ji(e),Oa(e,t,!1)}function ud(e,t,n){ad({nextTheme:t,applyTheme:()=>{e.theme=t,Ae(e,{...e.settings,theme:t}),yn(e,Gi(t))},context:n,currentTheme:e.theme})}async function Ji(e){e.tab==="overview"&&await Na(e),e.tab==="channels"&&await yd(e),e.tab==="instances"&&await Vi(e),e.tab==="sessions"&&await at(e),e.tab==="cron"&&await es(e),e.tab==="skills"&&await Lt(e),e.tab==="nodes"&&(await mn(e),await Ee(e),await ye(e),await qi(e)),e.tab==="chat"&&(await Ad(e),fn(e,!e.chatHasAutoScrolled)),e.tab==="config"&&(await fa(e),await ye(e)),e.tab==="debug"&&(await gn(e),e.eventLog=e.eventLogBuffer),e.tab==="logs"&&(e.logsAtBottom=!0,await Fi(e,{reset:!0}),da(e,!0))}function pd(){if(typeof window>"u")return"";const e=window.__CLAWDBOT_CONTROL_UI_BASE_PATH__;return typeof e=="string"&&e.trim()?pn(e):ml(window.location.pathname)}function fd(e){e.theme=e.settings.theme??"system",yn(e,Gi(e.theme))}function yn(e,t){if(e.themeResolved=t,typeof document>"u")return;const n=document.documentElement;n.dataset.theme=t,n.style.colorScheme=t}function hd(e){if(typeof window>"u"||typeof window.matchMedia!="function")return;if(e.themeMedia=window.matchMedia("(prefers-color-scheme: dark)"),e.themeMediaHandler=n=>{e.theme==="system"&&yn(e,n.matches?"dark":"light")},typeof e.themeMedia.addEventListener=="function"){e.themeMedia.addEventListener("change",e.themeMediaHandler);return}e.themeMedia.addListener(e.themeMediaHandler)}function gd(e){if(!e.themeMedia||!e.themeMediaHandler)return;if(typeof e.themeMedia.removeEventListener=="function"){e.themeMedia.removeEventListener("change",e.themeMediaHandler);return}e.themeMedia.removeListener(e.themeMediaHandler),e.themeMedia=null,e.themeMediaHandler=null}function vd(e,t){if(typeof window>"u")return;const n=aa(window.location.pathname,e.basePath)??"chat";Pa(e,n),Oa(e,n,t)}function md(e){if(typeof window>"u")return;const t=aa(window.location.pathname,e.basePath);if(!t)return;const i=new URL(window.location.href).searchParams.get("session")?.trim();i&&(e.sessionKey=i,Ae(e,{...e.settings,sessionKey:i,lastActiveSessionKey:i})),Pa(e,t)}function Pa(e,t){e.tab!==t&&(e.tab=t),t==="chat"&&(e.chatHasAutoScrolled=!1),t==="logs"?Qi(e):Zi(e),t==="debug"?Yi(e):Xi(e),e.connected&&Ji(e)}function Oa(e,t,n){if(typeof window>"u")return;const i=Tt(Ni(t,e.basePath)),s=Tt(window.location.pathname),r=new URL(window.location.href);t==="chat"&&e.sessionKey?r.searchParams.set("session",e.sessionKey):r.searchParams.delete("session"),s!==i&&(r.pathname=i),n?window.history.replaceState({},"",r.toString()):window.history.pushState({},"",r.toString())}function bd(e,t,n){if(typeof window>"u")return;const i=new URL(window.location.href);i.searchParams.set("session",t),window.history.replaceState({},"",i.toString())}async function Na(e){await Promise.all([le(e,!1),Vi(e),at(e),It(e),gn(e)])}async function yd(e){await Promise.all([le(e,!0),fa(e),ye(e)])}async function es(e){await Promise.all([le(e,!1),It(e),hn(e)])}function Da(e){return e.chatSending||!!e.chatRunId}function $d(e){const t=e.trim();if(!t)return!1;const n=t.toLowerCase();return n==="/stop"?!0:n==="stop"||n==="esc"||n==="abort"||n==="wait"||n==="exit"}async function Ba(e){e.connected&&(e.chatMessage="",await Ll(e))}function wd(e,t,n){const i=t.trim(),s=!!(n&&n.length>0);!i&&!s||(e.chatQueue=[...e.chatQueue,{id:Di(),text:i,createdAt:Date.now(),attachments:s?n?.map(r=>({...r})):void 0}])}async function Fa(e,t,n){Bi(e);const i=await Il(e,t,n?.attachments);return!i&&n?.previousDraft!=null&&(e.chatMessage=n.previousDraft),!i&&n?.previousAttachments&&(e.chatAttachments=n.previousAttachments),i&&Ra(e,e.sessionKey),i&&n?.restoreDraft&&n.previousDraft?.trim()&&(e.chatMessage=n.previousDraft),i&&n?.restoreAttachments&&n.previousAttachments?.length&&(e.chatAttachments=n.previousAttachments),fn(e),i&&!e.chatRunId&&za(e),i}async function za(e){if(!e.connected||Da(e))return;const[t,...n]=e.chatQueue;if(!t)return;e.chatQueue=n,await Fa(e,t.text,{attachments:t.attachments})||(e.chatQueue=[t,...e.chatQueue])}function xd(e,t){e.chatQueue=e.chatQueue.filter(n=>n.id!==t)}async function kd(e,t,n){if(!e.connected)return;const i=e.chatMessage,s=(t??e.chatMessage).trim(),r=e.chatAttachments??[],a=t==null?r:[],l=a.length>0;if(!(!s&&!l)){if($d(s)){await Ba(e);return}if(t==null&&(e.chatMessage="",e.chatAttachments=[]),Da(e)){wd(e,s,a);return}await Fa(e,s,{previousDraft:t==null?i:void 0,restoreDraft:!!(t&&n?.restoreDraft),attachments:l?a:void 0,previousAttachments:t==null?r:void 0,restoreAttachments:!!(t&&n?.restoreDraft)})}}async function Ad(e){await Promise.all([tt(e),at(e),gi(e)]),fn(e,!0)}const Sd=za;function _d(e){const t=ia(e.sessionKey);return t?.agentId?t.agentId:e.hello?.snapshot?.sessionDefaults?.defaultAgentId?.trim()||"main"}function Td(e,t){const n=pn(e),i=encodeURIComponent(t);return n?`${n}/avatar/${i}?meta=1`:`/avatar/${i}?meta=1`}async function gi(e){if(!e.connected){e.chatAvatarUrl=null;return}const t=_d(e);if(!t){e.chatAvatarUrl=null;return}e.chatAvatarUrl=null;const n=Td(e.basePath,t);try{const i=await fetch(n,{method:"GET"});if(!i.ok){e.chatAvatarUrl=null;return}const s=await i.json(),r=typeof s.avatarUrl=="string"?s.avatarUrl.trim():"";e.chatAvatarUrl=r||null}catch{e.chatAvatarUrl=null}}const Ua={CHILD:2},Ka=e=>(...t)=>({_$litDirective$:e,values:t});let Ha=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,n,i){this._$Ct=t,this._$AM=n,this._$Ci=i}_$AS(t,n){return this.update(t,n)}update(t,n){return this.render(...n)}};const{I:Ed}=sl,or=e=>e,lr=()=>document.createComment(""),ut=(e,t,n)=>{const i=e._$AA.parentNode,s=t===void 0?e._$AB:t._$AA;if(n===void 0){const r=i.insertBefore(lr(),s),a=i.insertBefore(lr(),s);n=new Ed(r,a,e,e.options)}else{const r=n._$AB.nextSibling,a=n._$AM,l=a!==e;if(l){let c;n._$AQ?.(e),n._$AM=e,n._$AP!==void 0&&(c=e._$AU)!==a._$AU&&n._$AP(c)}if(r!==s||l){let c=n._$AA;for(;c!==r;){const p=or(c).nextSibling;or(i).insertBefore(c,s),c=p}}}return n},Le=(e,t,n=e)=>(e._$AI(t,n),e),Cd={},Md=(e,t=Cd)=>e._$AH=t,Id=e=>e._$AH,Vn=e=>{e._$AR(),e._$AA.remove()};const cr=(e,t,n)=>{const i=new Map;for(let s=t;s<=n;s++)i.set(e[s],s);return i},Wa=Ka(class extends Ha{constructor(e){if(super(e),e.type!==Ua.CHILD)throw Error("repeat() can only be used in text expressions")}dt(e,t,n){let i;n===void 0?n=t:t!==void 0&&(i=t);const s=[],r=[];let a=0;for(const l of e)s[a]=i?i(l,a):a,r[a]=n(l,a),a++;return{values:r,keys:s}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,i]){const s=Id(e),{values:r,keys:a}=this.dt(t,n,i);if(!Array.isArray(s))return this.ut=a,r;const l=this.ut??=[],c=[];let p,d,u=0,v=s.length-1,g=0,$=r.length-1;for(;u<=v&&g<=$;)if(s[u]===null)u++;else if(s[v]===null)v--;else if(l[u]===a[g])c[g]=Le(s[u],r[g]),u++,g++;else if(l[v]===a[$])c[$]=Le(s[v],r[$]),v--,$--;else if(l[u]===a[$])c[$]=Le(s[u],r[$]),ut(e,c[$+1],s[u]),u++,$--;else if(l[v]===a[g])c[g]=Le(s[v],r[g]),ut(e,s[u],s[v]),v--,g++;else if(p===void 0&&(p=cr(a,g,$),d=cr(l,u,v)),p.has(l[u]))if(p.has(l[v])){const w=d.get(a[g]),k=w!==void 0?s[w]:null;if(k===null){const E=ut(e,s[u]);Le(E,r[g]),c[g]=E}else c[g]=Le(k,r[g]),ut(e,s[u],k),s[w]=null;g++}else Vn(s[v]),v--;else Vn(s[u]),u++;for(;g<=$;){const w=ut(e,c[$+1]);Le(w,r[g]),c[g++]=w}for(;u<=v;){const w=s[u++];w!==null&&Vn(w)}return this.ut=a,Md(e,c),_e}});function ja(e){const t=e;let n=typeof t.role=="string"?t.role:"unknown";const i=typeof t.toolCallId=="string"||typeof t.tool_call_id=="string",s=t.content,r=Array.isArray(s)?s:null,a=Array.isArray(r)&&r.some(u=>{const g=String(u.type??"").toLowerCase();return g==="toolresult"||g==="tool_result"}),l=typeof t.toolName=="string"||typeof t.tool_name=="string";(i||a||l)&&(n="toolResult");let c=[];typeof t.content=="string"?c=[{type:"text",text:t.content}]:Array.isArray(t.content)?c=t.content.map(u=>({type:u.type||"text",text:u.text,name:u.name,args:u.args||u.arguments})):typeof t.text=="string"&&(c=[{type:"text",text:t.text}]);const p=typeof t.timestamp=="number"?t.timestamp:Date.now(),d=typeof t.id=="string"?t.id:void 0;return{role:n,content:c,timestamp:p,id:d}}function ts(e){const t=e.toLowerCase();return e==="user"||e==="User"?e:e==="assistant"?"assistant":e==="system"?"system":t==="toolresult"||t==="tool_result"||t==="tool"||t==="function"?"tool":e}function qa(e){const t=e,n=typeof t.role=="string"?t.role.toLowerCase():"";return n==="toolresult"||n==="tool_result"}class vi extends Ha{constructor(t){if(super(t),this.it=h,t.type!==Ua.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===h||t==null)return this._t=void 0,this.it=t;if(t===_e)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const n=[t];return n.raw=n,this._t={_$litType$:this.constructor.resultType,strings:n,values:[]}}}vi.directiveName="unsafeHTML",vi.resultType=1;const mi=Ka(vi);const{entries:Va,setPrototypeOf:dr,isFrozen:Ld,getPrototypeOf:Rd,getOwnPropertyDescriptor:Pd}=Object;let{freeze:X,seal:se,create:bi}=Object,{apply:yi,construct:$i}=typeof Reflect<"u"&&Reflect;X||(X=function(t){return t});se||(se=function(t){return t});yi||(yi=function(t,n){for(var i=arguments.length,s=new Array(i>2?i-2:0),r=2;r<i;r++)s[r-2]=arguments[r];return t.apply(n,s)});$i||($i=function(t){for(var n=arguments.length,i=new Array(n>1?n-1:0),s=1;s<n;s++)i[s-1]=arguments[s];return new t(...i)});const qt=J(Array.prototype.forEach),Od=J(Array.prototype.lastIndexOf),ur=J(Array.prototype.pop),pt=J(Array.prototype.push),Nd=J(Array.prototype.splice),Xt=J(String.prototype.toLowerCase),Gn=J(String.prototype.toString),Qn=J(String.prototype.match),ft=J(String.prototype.replace),Dd=J(String.prototype.indexOf),Bd=J(String.prototype.trim),re=J(Object.prototype.hasOwnProperty),Z=J(RegExp.prototype.test),ht=Fd(TypeError);function J(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,i=new Array(n>1?n-1:0),s=1;s<n;s++)i[s-1]=arguments[s];return yi(e,t,i)}}function Fd(e){return function(){for(var t=arguments.length,n=new Array(t),i=0;i<t;i++)n[i]=arguments[i];return $i(e,n)}}function M(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:Xt;dr&&dr(e,null);let i=t.length;for(;i--;){let s=t[i];if(typeof s=="string"){const r=n(s);r!==s&&(Ld(t)||(t[i]=r),s=r)}e[s]=!0}return e}function zd(e){for(let t=0;t<e.length;t++)re(e,t)||(e[t]=null);return e}function pe(e){const t=bi(null);for(const[n,i]of Va(e))re(e,n)&&(Array.isArray(i)?t[n]=zd(i):i&&typeof i=="object"&&i.constructor===Object?t[n]=pe(i):t[n]=i);return t}function gt(e,t){for(;e!==null;){const i=Pd(e,t);if(i){if(i.get)return J(i.get);if(typeof i.value=="function")return J(i.value)}e=Rd(e)}function n(){return null}return n}const pr=X(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),Zn=X(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),Yn=X(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),Ud=X(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),Xn=X(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),Kd=X(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),fr=X(["#text"]),hr=X(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns","slot"]),Jn=X(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),gr=X(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),Vt=X(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),Hd=se(/\{\{[\w\W]*|[\w\W]*\}\}/gm),Wd=se(/<%[\w\W]*|[\w\W]*%>/gm),jd=se(/\$\{[\w\W]*/gm),qd=se(/^data-[\-\w.\u00B7-\uFFFF]+$/),Vd=se(/^aria-[\-\w]+$/),Ga=se(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Gd=se(/^(?:\w+script|data):/i),Qd=se(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Qa=se(/^html$/i),Zd=se(/^[a-z][.\w]*(-[.\w]+)+$/i);var vr=Object.freeze({__proto__:null,ARIA_ATTR:Vd,ATTR_WHITESPACE:Qd,CUSTOM_ELEMENT:Zd,DATA_ATTR:qd,DOCTYPE_NAME:Qa,ERB_EXPR:Wd,IS_ALLOWED_URI:Ga,IS_SCRIPT_OR_DATA:Gd,MUSTACHE_EXPR:Hd,TMPLIT_EXPR:jd});const vt={element:1,text:3,progressingInstruction:7,comment:8,document:9},Yd=function(){return typeof window>"u"?null:window},Xd=function(t,n){if(typeof t!="object"||typeof t.createPolicy!="function")return null;let i=null;const s="data-tt-policy-suffix";n&&n.hasAttribute(s)&&(i=n.getAttribute(s));const r="dompurify"+(i?"#"+i:"");try{return t.createPolicy(r,{createHTML(a){return a},createScriptURL(a){return a}})}catch{return console.warn("TrustedTypes policy "+r+" could not be created."),null}},mr=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}};function Za(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:Yd();const t=T=>Za(T);if(t.version="3.3.1",t.removed=[],!e||!e.document||e.document.nodeType!==vt.document||!e.Element)return t.isSupported=!1,t;let{document:n}=e;const i=n,s=i.currentScript,{DocumentFragment:r,HTMLTemplateElement:a,Node:l,Element:c,NodeFilter:p,NamedNodeMap:d=e.NamedNodeMap||e.MozNamedAttrMap,HTMLFormElement:u,DOMParser:v,trustedTypes:g}=e,$=c.prototype,w=gt($,"cloneNode"),k=gt($,"remove"),E=gt($,"nextSibling"),C=gt($,"childNodes"),N=gt($,"parentNode");if(typeof a=="function"){const T=n.createElement("template");T.content&&T.content.ownerDocument&&(n=T.content.ownerDocument)}let I,L="";const{implementation:A,createNodeIterator:O,createDocumentFragment:te,getElementsByTagName:He}=n,{importNode:Ot}=i;let Q=mr();t.isSupported=typeof Va=="function"&&typeof N=="function"&&A&&A.createHTMLDocument!==void 0;const{MUSTACHE_EXPR:kn,ERB_EXPR:An,TMPLIT_EXPR:Sn,DATA_ATTR:_o,ARIA_ATTR:To,IS_SCRIPT_OR_DATA:Eo,ATTR_WHITESPACE:fs,CUSTOM_ELEMENT:Co}=vr;let{IS_ALLOWED_URI:hs}=vr,K=null;const gs=M({},[...pr,...Zn,...Yn,...Xn,...fr]);let W=null;const vs=M({},[...hr,...Jn,...gr,...Vt]);let F=Object.seal(bi(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),ot=null,_n=null;const We=Object.seal(bi(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let ms=!0,Tn=!0,bs=!1,ys=!0,je=!1,Nt=!0,Ce=!1,En=!1,Cn=!1,qe=!1,Dt=!1,Bt=!1,$s=!0,ws=!1;const Mo="user-content-";let Mn=!0,lt=!1,Ve={},ce=null;const In=M({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let xs=null;const ks=M({},["audio","video","img","source","image","track"]);let Ln=null;const As=M({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Ft="http://www.w3.org/1998/Math/MathML",zt="http://www.w3.org/2000/svg",he="http://www.w3.org/1999/xhtml";let Ge=he,Rn=!1,Pn=null;const Io=M({},[Ft,zt,he],Gn);let Ut=M({},["mi","mo","mn","ms","mtext"]),Kt=M({},["annotation-xml"]);const Lo=M({},["title","style","font","a","script"]);let ct=null;const Ro=["application/xhtml+xml","text/html"],Po="text/html";let U=null,Qe=null;const Oo=n.createElement("form"),Ss=function(f){return f instanceof RegExp||f instanceof Function},On=function(){let f=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(!(Qe&&Qe===f)){if((!f||typeof f!="object")&&(f={}),f=pe(f),ct=Ro.indexOf(f.PARSER_MEDIA_TYPE)===-1?Po:f.PARSER_MEDIA_TYPE,U=ct==="application/xhtml+xml"?Gn:Xt,K=re(f,"ALLOWED_TAGS")?M({},f.ALLOWED_TAGS,U):gs,W=re(f,"ALLOWED_ATTR")?M({},f.ALLOWED_ATTR,U):vs,Pn=re(f,"ALLOWED_NAMESPACES")?M({},f.ALLOWED_NAMESPACES,Gn):Io,Ln=re(f,"ADD_URI_SAFE_ATTR")?M(pe(As),f.ADD_URI_SAFE_ATTR,U):As,xs=re(f,"ADD_DATA_URI_TAGS")?M(pe(ks),f.ADD_DATA_URI_TAGS,U):ks,ce=re(f,"FORBID_CONTENTS")?M({},f.FORBID_CONTENTS,U):In,ot=re(f,"FORBID_TAGS")?M({},f.FORBID_TAGS,U):pe({}),_n=re(f,"FORBID_ATTR")?M({},f.FORBID_ATTR,U):pe({}),Ve=re(f,"USE_PROFILES")?f.USE_PROFILES:!1,ms=f.ALLOW_ARIA_ATTR!==!1,Tn=f.ALLOW_DATA_ATTR!==!1,bs=f.ALLOW_UNKNOWN_PROTOCOLS||!1,ys=f.ALLOW_SELF_CLOSE_IN_ATTR!==!1,je=f.SAFE_FOR_TEMPLATES||!1,Nt=f.SAFE_FOR_XML!==!1,Ce=f.WHOLE_DOCUMENT||!1,qe=f.RETURN_DOM||!1,Dt=f.RETURN_DOM_FRAGMENT||!1,Bt=f.RETURN_TRUSTED_TYPE||!1,Cn=f.FORCE_BODY||!1,$s=f.SANITIZE_DOM!==!1,ws=f.SANITIZE_NAMED_PROPS||!1,Mn=f.KEEP_CONTENT!==!1,lt=f.IN_PLACE||!1,hs=f.ALLOWED_URI_REGEXP||Ga,Ge=f.NAMESPACE||he,Ut=f.MATHML_TEXT_INTEGRATION_POINTS||Ut,Kt=f.HTML_INTEGRATION_POINTS||Kt,F=f.CUSTOM_ELEMENT_HANDLING||{},f.CUSTOM_ELEMENT_HANDLING&&Ss(f.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(F.tagNameCheck=f.CUSTOM_ELEMENT_HANDLING.tagNameCheck),f.CUSTOM_ELEMENT_HANDLING&&Ss(f.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(F.attributeNameCheck=f.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),f.CUSTOM_ELEMENT_HANDLING&&typeof f.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements=="boolean"&&(F.allowCustomizedBuiltInElements=f.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),je&&(Tn=!1),Dt&&(qe=!0),Ve&&(K=M({},fr),W=[],Ve.html===!0&&(M(K,pr),M(W,hr)),Ve.svg===!0&&(M(K,Zn),M(W,Jn),M(W,Vt)),Ve.svgFilters===!0&&(M(K,Yn),M(W,Jn),M(W,Vt)),Ve.mathMl===!0&&(M(K,Xn),M(W,gr),M(W,Vt))),f.ADD_TAGS&&(typeof f.ADD_TAGS=="function"?We.tagCheck=f.ADD_TAGS:(K===gs&&(K=pe(K)),M(K,f.ADD_TAGS,U))),f.ADD_ATTR&&(typeof f.ADD_ATTR=="function"?We.attributeCheck=f.ADD_ATTR:(W===vs&&(W=pe(W)),M(W,f.ADD_ATTR,U))),f.ADD_URI_SAFE_ATTR&&M(Ln,f.ADD_URI_SAFE_ATTR,U),f.FORBID_CONTENTS&&(ce===In&&(ce=pe(ce)),M(ce,f.FORBID_CONTENTS,U)),f.ADD_FORBID_CONTENTS&&(ce===In&&(ce=pe(ce)),M(ce,f.ADD_FORBID_CONTENTS,U)),Mn&&(K["#text"]=!0),Ce&&M(K,["html","head","body"]),K.table&&(M(K,["tbody"]),delete ot.tbody),f.TRUSTED_TYPES_POLICY){if(typeof f.TRUSTED_TYPES_POLICY.createHTML!="function")throw ht('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if(typeof f.TRUSTED_TYPES_POLICY.createScriptURL!="function")throw ht('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');I=f.TRUSTED_TYPES_POLICY,L=I.createHTML("")}else I===void 0&&(I=Xd(g,s)),I!==null&&typeof L=="string"&&(L=I.createHTML(""));X&&X(f),Qe=f}},_s=M({},[...Zn,...Yn,...Ud]),Ts=M({},[...Xn,...Kd]),No=function(f){let x=N(f);(!x||!x.tagName)&&(x={namespaceURI:Ge,tagName:"template"});const _=Xt(f.tagName),B=Xt(x.tagName);return Pn[f.namespaceURI]?f.namespaceURI===zt?x.namespaceURI===he?_==="svg":x.namespaceURI===Ft?_==="svg"&&(B==="annotation-xml"||Ut[B]):!!_s[_]:f.namespaceURI===Ft?x.namespaceURI===he?_==="math":x.namespaceURI===zt?_==="math"&&Kt[B]:!!Ts[_]:f.namespaceURI===he?x.namespaceURI===zt&&!Kt[B]||x.namespaceURI===Ft&&!Ut[B]?!1:!Ts[_]&&(Lo[_]||!_s[_]):!!(ct==="application/xhtml+xml"&&Pn[f.namespaceURI]):!1},de=function(f){pt(t.removed,{element:f});try{N(f).removeChild(f)}catch{k(f)}},Me=function(f,x){try{pt(t.removed,{attribute:x.getAttributeNode(f),from:x})}catch{pt(t.removed,{attribute:null,from:x})}if(x.removeAttribute(f),f==="is")if(qe||Dt)try{de(x)}catch{}else try{x.setAttribute(f,"")}catch{}},Es=function(f){let x=null,_=null;if(Cn)f="<remove></remove>"+f;else{const z=Qn(f,/^[\r\n\t ]+/);_=z&&z[0]}ct==="application/xhtml+xml"&&Ge===he&&(f='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+f+"</body></html>");const B=I?I.createHTML(f):f;if(Ge===he)try{x=new v().parseFromString(B,ct)}catch{}if(!x||!x.documentElement){x=A.createDocument(Ge,"template",null);try{x.documentElement.innerHTML=Rn?L:B}catch{}}const q=x.body||x.documentElement;return f&&_&&q.insertBefore(n.createTextNode(_),q.childNodes[0]||null),Ge===he?He.call(x,Ce?"html":"body")[0]:Ce?x.documentElement:q},Cs=function(f){return O.call(f.ownerDocument||f,f,p.SHOW_ELEMENT|p.SHOW_COMMENT|p.SHOW_TEXT|p.SHOW_PROCESSING_INSTRUCTION|p.SHOW_CDATA_SECTION,null)},Nn=function(f){return f instanceof u&&(typeof f.nodeName!="string"||typeof f.textContent!="string"||typeof f.removeChild!="function"||!(f.attributes instanceof d)||typeof f.removeAttribute!="function"||typeof f.setAttribute!="function"||typeof f.namespaceURI!="string"||typeof f.insertBefore!="function"||typeof f.hasChildNodes!="function")},Ms=function(f){return typeof l=="function"&&f instanceof l};function ge(T,f,x){qt(T,_=>{_.call(t,f,x,Qe)})}const Is=function(f){let x=null;if(ge(Q.beforeSanitizeElements,f,null),Nn(f))return de(f),!0;const _=U(f.nodeName);if(ge(Q.uponSanitizeElement,f,{tagName:_,allowedTags:K}),Nt&&f.hasChildNodes()&&!Ms(f.firstElementChild)&&Z(/<[/\w!]/g,f.innerHTML)&&Z(/<[/\w!]/g,f.textContent)||f.nodeType===vt.progressingInstruction||Nt&&f.nodeType===vt.comment&&Z(/<[/\w]/g,f.data))return de(f),!0;if(!(We.tagCheck instanceof Function&&We.tagCheck(_))&&(!K[_]||ot[_])){if(!ot[_]&&Rs(_)&&(F.tagNameCheck instanceof RegExp&&Z(F.tagNameCheck,_)||F.tagNameCheck instanceof Function&&F.tagNameCheck(_)))return!1;if(Mn&&!ce[_]){const B=N(f)||f.parentNode,q=C(f)||f.childNodes;if(q&&B){const z=q.length;for(let ee=z-1;ee>=0;--ee){const ve=w(q[ee],!0);ve.__removalCount=(f.__removalCount||0)+1,B.insertBefore(ve,E(f))}}}return de(f),!0}return f instanceof c&&!No(f)||(_==="noscript"||_==="noembed"||_==="noframes")&&Z(/<\/no(script|embed|frames)/i,f.innerHTML)?(de(f),!0):(je&&f.nodeType===vt.text&&(x=f.textContent,qt([kn,An,Sn],B=>{x=ft(x,B," ")}),f.textContent!==x&&(pt(t.removed,{element:f.cloneNode()}),f.textContent=x)),ge(Q.afterSanitizeElements,f,null),!1)},Ls=function(f,x,_){if($s&&(x==="id"||x==="name")&&(_ in n||_ in Oo))return!1;if(!(Tn&&!_n[x]&&Z(_o,x))){if(!(ms&&Z(To,x))){if(!(We.attributeCheck instanceof Function&&We.attributeCheck(x,f))){if(!W[x]||_n[x]){if(!(Rs(f)&&(F.tagNameCheck instanceof RegExp&&Z(F.tagNameCheck,f)||F.tagNameCheck instanceof Function&&F.tagNameCheck(f))&&(F.attributeNameCheck instanceof RegExp&&Z(F.attributeNameCheck,x)||F.attributeNameCheck instanceof Function&&F.attributeNameCheck(x,f))||x==="is"&&F.allowCustomizedBuiltInElements&&(F.tagNameCheck instanceof RegExp&&Z(F.tagNameCheck,_)||F.tagNameCheck instanceof Function&&F.tagNameCheck(_))))return!1}else if(!Ln[x]){if(!Z(hs,ft(_,fs,""))){if(!((x==="src"||x==="xlink:href"||x==="href")&&f!=="script"&&Dd(_,"data:")===0&&xs[f])){if(!(bs&&!Z(Eo,ft(_,fs,"")))){if(_)return!1}}}}}}}return!0},Rs=function(f){return f!=="annotation-xml"&&Qn(f,Co)},Ps=function(f){ge(Q.beforeSanitizeAttributes,f,null);const{attributes:x}=f;if(!x||Nn(f))return;const _={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:W,forceKeepAttr:void 0};let B=x.length;for(;B--;){const q=x[B],{name:z,namespaceURI:ee,value:ve}=q,Ze=U(z),Dn=ve;let j=z==="value"?Dn:Bd(Dn);if(_.attrName=Ze,_.attrValue=j,_.keepAttr=!0,_.forceKeepAttr=void 0,ge(Q.uponSanitizeAttribute,f,_),j=_.attrValue,ws&&(Ze==="id"||Ze==="name")&&(Me(z,f),j=Mo+j),Nt&&Z(/((--!?|])>)|<\/(style|title|textarea)/i,j)){Me(z,f);continue}if(Ze==="attributename"&&Qn(j,"href")){Me(z,f);continue}if(_.forceKeepAttr)continue;if(!_.keepAttr){Me(z,f);continue}if(!ys&&Z(/\/>/i,j)){Me(z,f);continue}je&&qt([kn,An,Sn],Ns=>{j=ft(j,Ns," ")});const Os=U(f.nodeName);if(!Ls(Os,Ze,j)){Me(z,f);continue}if(I&&typeof g=="object"&&typeof g.getAttributeType=="function"&&!ee)switch(g.getAttributeType(Os,Ze)){case"TrustedHTML":{j=I.createHTML(j);break}case"TrustedScriptURL":{j=I.createScriptURL(j);break}}if(j!==Dn)try{ee?f.setAttributeNS(ee,z,j):f.setAttribute(z,j),Nn(f)?de(f):ur(t.removed)}catch{Me(z,f)}}ge(Q.afterSanitizeAttributes,f,null)},Do=function T(f){let x=null;const _=Cs(f);for(ge(Q.beforeSanitizeShadowDOM,f,null);x=_.nextNode();)ge(Q.uponSanitizeShadowNode,x,null),Is(x),Ps(x),x.content instanceof r&&T(x.content);ge(Q.afterSanitizeShadowDOM,f,null)};return t.sanitize=function(T){let f=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},x=null,_=null,B=null,q=null;if(Rn=!T,Rn&&(T="<!-->"),typeof T!="string"&&!Ms(T))if(typeof T.toString=="function"){if(T=T.toString(),typeof T!="string")throw ht("dirty is not a string, aborting")}else throw ht("toString is not a function");if(!t.isSupported)return T;if(En||On(f),t.removed=[],typeof T=="string"&&(lt=!1),lt){if(T.nodeName){const ve=U(T.nodeName);if(!K[ve]||ot[ve])throw ht("root node is forbidden and cannot be sanitized in-place")}}else if(T instanceof l)x=Es("<!---->"),_=x.ownerDocument.importNode(T,!0),_.nodeType===vt.element&&_.nodeName==="BODY"||_.nodeName==="HTML"?x=_:x.appendChild(_);else{if(!qe&&!je&&!Ce&&T.indexOf("<")===-1)return I&&Bt?I.createHTML(T):T;if(x=Es(T),!x)return qe?null:Bt?L:""}x&&Cn&&de(x.firstChild);const z=Cs(lt?T:x);for(;B=z.nextNode();)Is(B),Ps(B),B.content instanceof r&&Do(B.content);if(lt)return T;if(qe){if(Dt)for(q=te.call(x.ownerDocument);x.firstChild;)q.appendChild(x.firstChild);else q=x;return(W.shadowroot||W.shadowrootmode)&&(q=Ot.call(i,q,!0)),q}let ee=Ce?x.outerHTML:x.innerHTML;return Ce&&K["!doctype"]&&x.ownerDocument&&x.ownerDocument.doctype&&x.ownerDocument.doctype.name&&Z(Qa,x.ownerDocument.doctype.name)&&(ee="<!DOCTYPE "+x.ownerDocument.doctype.name+`>
`+ee),je&&qt([kn,An,Sn],ve=>{ee=ft(ee,ve," ")}),I&&Bt?I.createHTML(ee):ee},t.setConfig=function(){let T=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};On(T),En=!0},t.clearConfig=function(){Qe=null,En=!1},t.isValidAttribute=function(T,f,x){Qe||On({});const _=U(T),B=U(f);return Ls(_,B,x)},t.addHook=function(T,f){typeof f=="function"&&pt(Q[T],f)},t.removeHook=function(T,f){if(f!==void 0){const x=Od(Q[T],f);return x===-1?void 0:Nd(Q[T],x,1)[0]}return ur(Q[T])},t.removeHooks=function(T){Q[T]=[]},t.removeAllHooks=function(){Q=mr()},t}var wi=Za();function ns(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var Ke=ns();function Ya(e){Ke=e}var kt={exec:()=>null};function R(e,t=""){let n=typeof e=="string"?e:e.source,i={replace:(s,r)=>{let a=typeof r=="string"?r:r.source;return a=a.replace(Y.caret,"$1"),n=n.replace(s,a),i},getRegex:()=>new RegExp(n,t)};return i}var Jd=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),Y={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>new RegExp(`^( {0,3}${e})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,"i")},eu=/^(?:[ \t]*(?:\n|$))+/,tu=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,nu=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Rt=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,iu=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,is=/(?:[*+-]|\d{1,9}[.)])/,Xa=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,Ja=R(Xa).replace(/bull/g,is).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),su=R(Xa).replace(/bull/g,is).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),ss=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,ru=/^[^\n]+/,rs=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,au=R(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",rs).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),ou=R(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,is).getRegex(),$n="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",as=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,lu=R("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",as).replace("tag",$n).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),eo=R(ss).replace("hr",Rt).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",$n).getRegex(),cu=R(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",eo).getRegex(),os={blockquote:cu,code:tu,def:au,fences:nu,heading:iu,hr:Rt,html:lu,lheading:Ja,list:ou,newline:eu,paragraph:eo,table:kt,text:ru},br=R("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Rt).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",$n).getRegex(),du={...os,lheading:su,table:br,paragraph:R(ss).replace("hr",Rt).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",br).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",$n).getRegex()},uu={...os,html:R(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",as).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:kt,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:R(ss).replace("hr",Rt).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Ja).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},pu=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,fu=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,to=/^( {2,}|\\)\n(?!\s*$)/,hu=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,wn=/[\p{P}\p{S}]/u,ls=/[\s\p{P}\p{S}]/u,no=/[^\s\p{P}\p{S}]/u,gu=R(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,ls).getRegex(),io=/(?!~)[\p{P}\p{S}]/u,vu=/(?!~)[\s\p{P}\p{S}]/u,mu=/(?:[^\s\p{P}\p{S}]|~)/u,bu=R(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",Jd?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),so=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,yu=R(so,"u").replace(/punct/g,wn).getRegex(),$u=R(so,"u").replace(/punct/g,io).getRegex(),ro="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",wu=R(ro,"gu").replace(/notPunctSpace/g,no).replace(/punctSpace/g,ls).replace(/punct/g,wn).getRegex(),xu=R(ro,"gu").replace(/notPunctSpace/g,mu).replace(/punctSpace/g,vu).replace(/punct/g,io).getRegex(),ku=R("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,no).replace(/punctSpace/g,ls).replace(/punct/g,wn).getRegex(),Au=R(/\\(punct)/,"gu").replace(/punct/g,wn).getRegex(),Su=R(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),_u=R(as).replace("(?:-->|$)","-->").getRegex(),Tu=R("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",_u).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),rn=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,Eu=R(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",rn).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),ao=R(/^!?\[(label)\]\[(ref)\]/).replace("label",rn).replace("ref",rs).getRegex(),oo=R(/^!?\[(ref)\](?:\[\])?/).replace("ref",rs).getRegex(),Cu=R("reflink|nolink(?!\\()","g").replace("reflink",ao).replace("nolink",oo).getRegex(),yr=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,cs={_backpedal:kt,anyPunctuation:Au,autolink:Su,blockSkip:bu,br:to,code:fu,del:kt,emStrongLDelim:yu,emStrongRDelimAst:wu,emStrongRDelimUnd:ku,escape:pu,link:Eu,nolink:oo,punctuation:gu,reflink:ao,reflinkSearch:Cu,tag:Tu,text:hu,url:kt},Mu={...cs,link:R(/^!?\[(label)\]\((.*?)\)/).replace("label",rn).getRegex(),reflink:R(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",rn).getRegex()},xi={...cs,emStrongRDelimAst:xu,emStrongLDelim:$u,url:R(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",yr).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:R(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",yr).getRegex()},Iu={...xi,br:R(to).replace("{2,}","*").getRegex(),text:R(xi.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Gt={normal:os,gfm:du,pedantic:uu},mt={normal:cs,gfm:xi,breaks:Iu,pedantic:Mu},Lu={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},$r=e=>Lu[e];function be(e,t){if(t){if(Y.escapeTest.test(e))return e.replace(Y.escapeReplace,$r)}else if(Y.escapeTestNoEncode.test(e))return e.replace(Y.escapeReplaceNoEncode,$r);return e}function wr(e){try{e=encodeURI(e).replace(Y.percentDecode,"%")}catch{return null}return e}function xr(e,t){let n=e.replace(Y.findPipe,(r,a,l)=>{let c=!1,p=a;for(;--p>=0&&l[p]==="\\";)c=!c;return c?"|":" |"}),i=n.split(Y.splitPipe),s=0;if(i[0].trim()||i.shift(),i.length>0&&!i.at(-1)?.trim()&&i.pop(),t)if(i.length>t)i.splice(t);else for(;i.length<t;)i.push("");for(;s<i.length;s++)i[s]=i[s].trim().replace(Y.slashPipe,"|");return i}function bt(e,t,n){let i=e.length;if(i===0)return"";let s=0;for(;s<i&&e.charAt(i-s-1)===t;)s++;return e.slice(0,i-s)}function Ru(e,t){if(e.indexOf(t[1])===-1)return-1;let n=0;for(let i=0;i<e.length;i++)if(e[i]==="\\")i++;else if(e[i]===t[0])n++;else if(e[i]===t[1]&&(n--,n<0))return i;return n>0?-2:-1}function kr(e,t,n,i,s){let r=t.href,a=t.title||null,l=e[1].replace(s.other.outputLinkReplace,"$1");i.state.inLink=!0;let c={type:e[0].charAt(0)==="!"?"image":"link",raw:n,href:r,title:a,text:l,tokens:i.inlineTokens(l)};return i.state.inLink=!1,c}function Pu(e,t,n){let i=e.match(n.other.indentCodeCompensation);if(i===null)return t;let s=i[1];return t.split(`
`).map(r=>{let a=r.match(n.other.beginningSpace);if(a===null)return r;let[l]=a;return l.length>=s.length?r.slice(s.length):r}).join(`
`)}var an=class{options;rules;lexer;constructor(e){this.options=e||Ke}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let n=t[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:bt(n,`
`)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let n=t[0],i=Pu(n,t[3]||"",this.rules);return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:i}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(this.rules.other.endingHash.test(n)){let i=bt(n,"#");(this.options.pedantic||!i||this.rules.other.endingSpaceChar.test(i))&&(n=i.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:bt(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let n=bt(t[0],`
`).split(`
`),i="",s="",r=[];for(;n.length>0;){let a=!1,l=[],c;for(c=0;c<n.length;c++)if(this.rules.other.blockquoteStart.test(n[c]))l.push(n[c]),a=!0;else if(!a)l.push(n[c]);else break;n=n.slice(c);let p=l.join(`
`),d=p.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");i=i?`${i}
${p}`:p,s=s?`${s}
${d}`:d;let u=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(d,r,!0),this.lexer.state.top=u,n.length===0)break;let v=r.at(-1);if(v?.type==="code")break;if(v?.type==="blockquote"){let g=v,$=g.raw+`
`+n.join(`
`),w=this.blockquote($);r[r.length-1]=w,i=i.substring(0,i.length-g.raw.length)+w.raw,s=s.substring(0,s.length-g.text.length)+w.text;break}else if(v?.type==="list"){let g=v,$=g.raw+`
`+n.join(`
`),w=this.list($);r[r.length-1]=w,i=i.substring(0,i.length-v.raw.length)+w.raw,s=s.substring(0,s.length-g.raw.length)+w.raw,n=$.substring(r.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:i,tokens:r,text:s}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),i=n.length>1,s={type:"list",raw:"",ordered:i,start:i?+n.slice(0,-1):"",loose:!1,items:[]};n=i?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=i?n:"[*+-]");let r=this.rules.other.listItemRegex(n),a=!1;for(;e;){let c=!1,p="",d="";if(!(t=r.exec(e))||this.rules.block.hr.test(e))break;p=t[0],e=e.substring(p.length);let u=t[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,w=>" ".repeat(3*w.length)),v=e.split(`
`,1)[0],g=!u.trim(),$=0;if(this.options.pedantic?($=2,d=u.trimStart()):g?$=t[1].length+1:($=t[2].search(this.rules.other.nonSpaceChar),$=$>4?1:$,d=u.slice($),$+=t[1].length),g&&this.rules.other.blankLine.test(v)&&(p+=v+`
`,e=e.substring(v.length+1),c=!0),!c){let w=this.rules.other.nextBulletRegex($),k=this.rules.other.hrRegex($),E=this.rules.other.fencesBeginRegex($),C=this.rules.other.headingBeginRegex($),N=this.rules.other.htmlBeginRegex($);for(;e;){let I=e.split(`
`,1)[0],L;if(v=I,this.options.pedantic?(v=v.replace(this.rules.other.listReplaceNesting,"  "),L=v):L=v.replace(this.rules.other.tabCharGlobal,"    "),E.test(v)||C.test(v)||N.test(v)||w.test(v)||k.test(v))break;if(L.search(this.rules.other.nonSpaceChar)>=$||!v.trim())d+=`
`+L.slice($);else{if(g||u.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||E.test(u)||C.test(u)||k.test(u))break;d+=`
`+v}!g&&!v.trim()&&(g=!0),p+=I+`
`,e=e.substring(I.length+1),u=L.slice($)}}s.loose||(a?s.loose=!0:this.rules.other.doubleBlankLine.test(p)&&(a=!0)),s.items.push({type:"list_item",raw:p,task:!!this.options.gfm&&this.rules.other.listIsTask.test(d),loose:!1,text:d,tokens:[]}),s.raw+=p}let l=s.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;s.raw=s.raw.trimEnd();for(let c of s.items){if(this.lexer.state.top=!1,c.tokens=this.lexer.blockTokens(c.text,[]),c.task){if(c.text=c.text.replace(this.rules.other.listReplaceTask,""),c.tokens[0]?.type==="text"||c.tokens[0]?.type==="paragraph"){c.tokens[0].raw=c.tokens[0].raw.replace(this.rules.other.listReplaceTask,""),c.tokens[0].text=c.tokens[0].text.replace(this.rules.other.listReplaceTask,"");for(let d=this.lexer.inlineQueue.length-1;d>=0;d--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[d].src)){this.lexer.inlineQueue[d].src=this.lexer.inlineQueue[d].src.replace(this.rules.other.listReplaceTask,"");break}}let p=this.rules.other.listTaskCheckbox.exec(c.raw);if(p){let d={type:"checkbox",raw:p[0]+" ",checked:p[0]!=="[ ]"};c.checked=d.checked,s.loose?c.tokens[0]&&["paragraph","text"].includes(c.tokens[0].type)&&"tokens"in c.tokens[0]&&c.tokens[0].tokens?(c.tokens[0].raw=d.raw+c.tokens[0].raw,c.tokens[0].text=d.raw+c.tokens[0].text,c.tokens[0].tokens.unshift(d)):c.tokens.unshift({type:"paragraph",raw:d.raw,text:d.raw,tokens:[d]}):c.tokens.unshift(d)}}if(!s.loose){let p=c.tokens.filter(u=>u.type==="space"),d=p.length>0&&p.some(u=>this.rules.other.anyLine.test(u.raw));s.loose=d}}if(s.loose)for(let c of s.items){c.loose=!0;for(let p of c.tokens)p.type==="text"&&(p.type="paragraph")}return s}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let n=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),i=t[2]?t[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",s=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:i,title:s}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=xr(t[1]),i=t[2].replace(this.rules.other.tableAlignChars,"").split("|"),s=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],r={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===i.length){for(let a of i)this.rules.other.tableAlignRight.test(a)?r.align.push("right"):this.rules.other.tableAlignCenter.test(a)?r.align.push("center"):this.rules.other.tableAlignLeft.test(a)?r.align.push("left"):r.align.push(null);for(let a=0;a<n.length;a++)r.header.push({text:n[a],tokens:this.lexer.inline(n[a]),header:!0,align:r.align[a]});for(let a of s)r.rows.push(xr(a,r.header.length).map((l,c)=>({text:l,tokens:this.lexer.inline(l),header:!1,align:r.align[c]})));return r}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let n=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(n)){if(!this.rules.other.endAngleBracket.test(n))return;let r=bt(n.slice(0,-1),"\\");if((n.length-r.length)%2===0)return}else{let r=Ru(t[2],"()");if(r===-2)return;if(r>-1){let a=(t[0].indexOf("!")===0?5:4)+t[1].length+r;t[2]=t[2].substring(0,r),t[0]=t[0].substring(0,a).trim(),t[3]=""}}let i=t[2],s="";if(this.options.pedantic){let r=this.rules.other.pedanticHrefTitle.exec(i);r&&(i=r[1],s=r[3])}else s=t[3]?t[3].slice(1,-1):"";return i=i.trim(),this.rules.other.startAngleBracket.test(i)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(n)?i=i.slice(1):i=i.slice(1,-1)),kr(t,{href:i&&i.replace(this.rules.inline.anyPunctuation,"$1"),title:s&&s.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let i=(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal," "),s=t[i.toLowerCase()];if(!s){let r=n[0].charAt(0);return{type:"text",raw:r,text:r}}return kr(n,s,n[0],this.lexer,this.rules)}}emStrong(e,t,n=""){let i=this.rules.inline.emStrongLDelim.exec(e);if(!(!i||i[3]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!(i[1]||i[2])||!n||this.rules.inline.punctuation.exec(n))){let s=[...i[0]].length-1,r,a,l=s,c=0,p=i[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(p.lastIndex=0,t=t.slice(-1*e.length+s);(i=p.exec(t))!=null;){if(r=i[1]||i[2]||i[3]||i[4]||i[5]||i[6],!r)continue;if(a=[...r].length,i[3]||i[4]){l+=a;continue}else if((i[5]||i[6])&&s%3&&!((s+a)%3)){c+=a;continue}if(l-=a,l>0)continue;a=Math.min(a,a+l+c);let d=[...i[0]][0].length,u=e.slice(0,s+i.index+d+a);if(Math.min(s,a)%2){let g=u.slice(1,-1);return{type:"em",raw:u,text:g,tokens:this.lexer.inlineTokens(g)}}let v=u.slice(2,-2);return{type:"strong",raw:u,text:v,tokens:this.lexer.inlineTokens(v)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(this.rules.other.newLineCharGlobal," "),i=this.rules.other.nonSpaceChar.test(n),s=this.rules.other.startingSpaceChar.test(n)&&this.rules.other.endingSpaceChar.test(n);return i&&s&&(n=n.substring(1,n.length-1)),{type:"codespan",raw:t[0],text:n}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){let t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let n,i;return t[2]==="@"?(n=t[1],i="mailto:"+n):(n=t[1],i=n),{type:"link",raw:t[0],text:n,href:i,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,i;if(t[2]==="@")n=t[0],i="mailto:"+n;else{let s;do s=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(s!==t[0]);n=t[0],t[1]==="www."?i="http://"+t[0]:i=t[0]}return{type:"link",raw:t[0],text:n,href:i,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let n=this.lexer.state.inRawBlock;return{type:"text",raw:t[0],text:t[0],escaped:n}}}},ae=class ki{tokens;options;state;inlineQueue;tokenizer;constructor(t){this.tokens=[],this.tokens.links=Object.create(null),this.options=t||Ke,this.options.tokenizer=this.options.tokenizer||new an,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let n={other:Y,block:Gt.normal,inline:mt.normal};this.options.pedantic?(n.block=Gt.pedantic,n.inline=mt.pedantic):this.options.gfm&&(n.block=Gt.gfm,this.options.breaks?n.inline=mt.breaks:n.inline=mt.gfm),this.tokenizer.rules=n}static get rules(){return{block:Gt,inline:mt}}static lex(t,n){return new ki(n).lex(t)}static lexInline(t,n){return new ki(n).inlineTokens(t)}lex(t){t=t.replace(Y.carriageReturn,`
`),this.blockTokens(t,this.tokens);for(let n=0;n<this.inlineQueue.length;n++){let i=this.inlineQueue[n];this.inlineTokens(i.src,i.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(t,n=[],i=!1){for(this.options.pedantic&&(t=t.replace(Y.tabCharGlobal,"    ").replace(Y.spaceLine,""));t;){let s;if(this.options.extensions?.block?.some(a=>(s=a.call({lexer:this},t,n))?(t=t.substring(s.raw.length),n.push(s),!0):!1))continue;if(s=this.tokenizer.space(t)){t=t.substring(s.raw.length);let a=n.at(-1);s.raw.length===1&&a!==void 0?a.raw+=`
`:n.push(s);continue}if(s=this.tokenizer.code(t)){t=t.substring(s.raw.length);let a=n.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+s.raw,a.text+=`
`+s.text,this.inlineQueue.at(-1).src=a.text):n.push(s);continue}if(s=this.tokenizer.fences(t)){t=t.substring(s.raw.length),n.push(s);continue}if(s=this.tokenizer.heading(t)){t=t.substring(s.raw.length),n.push(s);continue}if(s=this.tokenizer.hr(t)){t=t.substring(s.raw.length),n.push(s);continue}if(s=this.tokenizer.blockquote(t)){t=t.substring(s.raw.length),n.push(s);continue}if(s=this.tokenizer.list(t)){t=t.substring(s.raw.length),n.push(s);continue}if(s=this.tokenizer.html(t)){t=t.substring(s.raw.length),n.push(s);continue}if(s=this.tokenizer.def(t)){t=t.substring(s.raw.length);let a=n.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+s.raw,a.text+=`
`+s.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[s.tag]||(this.tokens.links[s.tag]={href:s.href,title:s.title},n.push(s));continue}if(s=this.tokenizer.table(t)){t=t.substring(s.raw.length),n.push(s);continue}if(s=this.tokenizer.lheading(t)){t=t.substring(s.raw.length),n.push(s);continue}let r=t;if(this.options.extensions?.startBlock){let a=1/0,l=t.slice(1),c;this.options.extensions.startBlock.forEach(p=>{c=p.call({lexer:this},l),typeof c=="number"&&c>=0&&(a=Math.min(a,c))}),a<1/0&&a>=0&&(r=t.substring(0,a+1))}if(this.state.top&&(s=this.tokenizer.paragraph(r))){let a=n.at(-1);i&&a?.type==="paragraph"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+s.raw,a.text+=`
`+s.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):n.push(s),i=r.length!==t.length,t=t.substring(s.raw.length);continue}if(s=this.tokenizer.text(t)){t=t.substring(s.raw.length);let a=n.at(-1);a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+s.raw,a.text+=`
`+s.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):n.push(s);continue}if(t){let a="Infinite loop on byte: "+t.charCodeAt(0);if(this.options.silent){console.error(a);break}else throw new Error(a)}}return this.state.top=!0,n}inline(t,n=[]){return this.inlineQueue.push({src:t,tokens:n}),n}inlineTokens(t,n=[]){let i=t,s=null;if(this.tokens.links){let c=Object.keys(this.tokens.links);if(c.length>0)for(;(s=this.tokenizer.rules.inline.reflinkSearch.exec(i))!=null;)c.includes(s[0].slice(s[0].lastIndexOf("[")+1,-1))&&(i=i.slice(0,s.index)+"["+"a".repeat(s[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(s=this.tokenizer.rules.inline.anyPunctuation.exec(i))!=null;)i=i.slice(0,s.index)+"++"+i.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let r;for(;(s=this.tokenizer.rules.inline.blockSkip.exec(i))!=null;)r=s[2]?s[2].length:0,i=i.slice(0,s.index+r)+"["+"a".repeat(s[0].length-r-2)+"]"+i.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);i=this.options.hooks?.emStrongMask?.call({lexer:this},i)??i;let a=!1,l="";for(;t;){a||(l=""),a=!1;let c;if(this.options.extensions?.inline?.some(d=>(c=d.call({lexer:this},t,n))?(t=t.substring(c.raw.length),n.push(c),!0):!1))continue;if(c=this.tokenizer.escape(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.tag(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.link(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.reflink(t,this.tokens.links)){t=t.substring(c.raw.length);let d=n.at(-1);c.type==="text"&&d?.type==="text"?(d.raw+=c.raw,d.text+=c.text):n.push(c);continue}if(c=this.tokenizer.emStrong(t,i,l)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.codespan(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.br(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.del(t)){t=t.substring(c.raw.length),n.push(c);continue}if(c=this.tokenizer.autolink(t)){t=t.substring(c.raw.length),n.push(c);continue}if(!this.state.inLink&&(c=this.tokenizer.url(t))){t=t.substring(c.raw.length),n.push(c);continue}let p=t;if(this.options.extensions?.startInline){let d=1/0,u=t.slice(1),v;this.options.extensions.startInline.forEach(g=>{v=g.call({lexer:this},u),typeof v=="number"&&v>=0&&(d=Math.min(d,v))}),d<1/0&&d>=0&&(p=t.substring(0,d+1))}if(c=this.tokenizer.inlineText(p)){t=t.substring(c.raw.length),c.raw.slice(-1)!=="_"&&(l=c.raw.slice(-1)),a=!0;let d=n.at(-1);d?.type==="text"?(d.raw+=c.raw,d.text+=c.text):n.push(c);continue}if(t){let d="Infinite loop on byte: "+t.charCodeAt(0);if(this.options.silent){console.error(d);break}else throw new Error(d)}}return n}},on=class{options;parser;constructor(e){this.options=e||Ke}space(e){return""}code({text:e,lang:t,escaped:n}){let i=(t||"").match(Y.notSpaceStart)?.[0],s=e.replace(Y.endingNewline,"")+`
`;return i?'<pre><code class="language-'+be(i)+'">'+(n?s:be(s,!0))+`</code></pre>
`:"<pre><code>"+(n?s:be(s,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return""}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,i="";for(let a=0;a<e.items.length;a++){let l=e.items[a];i+=this.listitem(l)}let s=t?"ol":"ul",r=t&&n!==1?' start="'+n+'"':"";return"<"+s+r+`>
`+i+"</"+s+`>
`}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let s=0;s<e.header.length;s++)n+=this.tablecell(e.header[s]);t+=this.tablerow({text:n});let i="";for(let s=0;s<e.rows.length;s++){let r=e.rows[s];n="";for(let a=0;a<r.length;a++)n+=this.tablecell(r[a]);i+=this.tablerow({text:n})}return i&&(i=`<tbody>${i}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+i+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${be(e,!0)}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let i=this.parser.parseInline(n),s=wr(e);if(s===null)return i;e=s;let r='<a href="'+e+'"';return t&&(r+=' title="'+be(t)+'"'),r+=">"+i+"</a>",r}image({href:e,title:t,text:n,tokens:i}){i&&(n=this.parser.parseInline(i,this.parser.textRenderer));let s=wr(e);if(s===null)return be(n);e=s;let r=`<img src="${e}" alt="${n}"`;return t&&(r+=` title="${be(t)}"`),r+=">",r}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):"escaped"in e&&e.escaped?e.text:be(e.text)}},ds=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}checkbox({raw:e}){return e}},oe=class Ai{options;renderer;textRenderer;constructor(t){this.options=t||Ke,this.options.renderer=this.options.renderer||new on,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new ds}static parse(t,n){return new Ai(n).parse(t)}static parseInline(t,n){return new Ai(n).parseInline(t)}parse(t){let n="";for(let i=0;i<t.length;i++){let s=t[i];if(this.options.extensions?.renderers?.[s.type]){let a=s,l=this.options.extensions.renderers[a.type].call({parser:this},a);if(l!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(a.type)){n+=l||"";continue}}let r=s;switch(r.type){case"space":{n+=this.renderer.space(r);break}case"hr":{n+=this.renderer.hr(r);break}case"heading":{n+=this.renderer.heading(r);break}case"code":{n+=this.renderer.code(r);break}case"table":{n+=this.renderer.table(r);break}case"blockquote":{n+=this.renderer.blockquote(r);break}case"list":{n+=this.renderer.list(r);break}case"checkbox":{n+=this.renderer.checkbox(r);break}case"html":{n+=this.renderer.html(r);break}case"def":{n+=this.renderer.def(r);break}case"paragraph":{n+=this.renderer.paragraph(r);break}case"text":{n+=this.renderer.text(r);break}default:{let a='Token with "'+r.type+'" type was not found.';if(this.options.silent)return console.error(a),"";throw new Error(a)}}}return n}parseInline(t,n=this.renderer){let i="";for(let s=0;s<t.length;s++){let r=t[s];if(this.options.extensions?.renderers?.[r.type]){let l=this.options.extensions.renderers[r.type].call({parser:this},r);if(l!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(r.type)){i+=l||"";continue}}let a=r;switch(a.type){case"escape":{i+=n.text(a);break}case"html":{i+=n.html(a);break}case"link":{i+=n.link(a);break}case"image":{i+=n.image(a);break}case"checkbox":{i+=n.checkbox(a);break}case"strong":{i+=n.strong(a);break}case"em":{i+=n.em(a);break}case"codespan":{i+=n.codespan(a);break}case"br":{i+=n.br(a);break}case"del":{i+=n.del(a);break}case"text":{i+=n.text(a);break}default:{let l='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return i}},$t=class{options;block;constructor(e){this.options=e||Ke}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(){return this.block?ae.lex:ae.lexInline}provideParser(){return this.block?oe.parse:oe.parseInline}},Ou=class{defaults=ns();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=oe;Renderer=on;TextRenderer=ds;Lexer=ae;Tokenizer=an;Hooks=$t;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let i of e)switch(n=n.concat(t.call(this,i)),i.type){case"table":{let s=i;for(let r of s.header)n=n.concat(this.walkTokens(r.tokens,t));for(let r of s.rows)for(let a of r)n=n.concat(this.walkTokens(a.tokens,t));break}case"list":{let s=i;n=n.concat(this.walkTokens(s.items,t));break}default:{let s=i;this.defaults.extensions?.childTokens?.[s.type]?this.defaults.extensions.childTokens[s.type].forEach(r=>{let a=s[r].flat(1/0);n=n.concat(this.walkTokens(a,t))}):s.tokens&&(n=n.concat(this.walkTokens(s.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{let i={...n};if(i.async=this.defaults.async||i.async||!1,n.extensions&&(n.extensions.forEach(s=>{if(!s.name)throw new Error("extension name required");if("renderer"in s){let r=t.renderers[s.name];r?t.renderers[s.name]=function(...a){let l=s.renderer.apply(this,a);return l===!1&&(l=r.apply(this,a)),l}:t.renderers[s.name]=s.renderer}if("tokenizer"in s){if(!s.level||s.level!=="block"&&s.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let r=t[s.level];r?r.unshift(s.tokenizer):t[s.level]=[s.tokenizer],s.start&&(s.level==="block"?t.startBlock?t.startBlock.push(s.start):t.startBlock=[s.start]:s.level==="inline"&&(t.startInline?t.startInline.push(s.start):t.startInline=[s.start]))}"childTokens"in s&&s.childTokens&&(t.childTokens[s.name]=s.childTokens)}),i.extensions=t),n.renderer){let s=this.defaults.renderer||new on(this.defaults);for(let r in n.renderer){if(!(r in s))throw new Error(`renderer '${r}' does not exist`);if(["options","parser"].includes(r))continue;let a=r,l=n.renderer[a],c=s[a];s[a]=(...p)=>{let d=l.apply(s,p);return d===!1&&(d=c.apply(s,p)),d||""}}i.renderer=s}if(n.tokenizer){let s=this.defaults.tokenizer||new an(this.defaults);for(let r in n.tokenizer){if(!(r in s))throw new Error(`tokenizer '${r}' does not exist`);if(["options","rules","lexer"].includes(r))continue;let a=r,l=n.tokenizer[a],c=s[a];s[a]=(...p)=>{let d=l.apply(s,p);return d===!1&&(d=c.apply(s,p)),d}}i.tokenizer=s}if(n.hooks){let s=this.defaults.hooks||new $t;for(let r in n.hooks){if(!(r in s))throw new Error(`hook '${r}' does not exist`);if(["options","block"].includes(r))continue;let a=r,l=n.hooks[a],c=s[a];$t.passThroughHooks.has(r)?s[a]=p=>{if(this.defaults.async&&$t.passThroughHooksRespectAsync.has(r))return(async()=>{let u=await l.call(s,p);return c.call(s,u)})();let d=l.call(s,p);return c.call(s,d)}:s[a]=(...p)=>{if(this.defaults.async)return(async()=>{let u=await l.apply(s,p);return u===!1&&(u=await c.apply(s,p)),u})();let d=l.apply(s,p);return d===!1&&(d=c.apply(s,p)),d}}i.hooks=s}if(n.walkTokens){let s=this.defaults.walkTokens,r=n.walkTokens;i.walkTokens=function(a){let l=[];return l.push(r.call(this,a)),s&&(l=l.concat(s.call(this,a))),l}}this.defaults={...this.defaults,...i}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return ae.lex(e,t??this.defaults)}parser(e,t){return oe.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let i={...n},s={...this.defaults,...i},r=this.onError(!!s.silent,!!s.async);if(this.defaults.async===!0&&i.async===!1)return r(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof t>"u"||t===null)return r(new Error("marked(): input parameter is undefined or null"));if(typeof t!="string")return r(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));if(s.hooks&&(s.hooks.options=s,s.hooks.block=e),s.async)return(async()=>{let a=s.hooks?await s.hooks.preprocess(t):t,l=await(s.hooks?await s.hooks.provideLexer():e?ae.lex:ae.lexInline)(a,s),c=s.hooks?await s.hooks.processAllTokens(l):l;s.walkTokens&&await Promise.all(this.walkTokens(c,s.walkTokens));let p=await(s.hooks?await s.hooks.provideParser():e?oe.parse:oe.parseInline)(c,s);return s.hooks?await s.hooks.postprocess(p):p})().catch(r);try{s.hooks&&(t=s.hooks.preprocess(t));let a=(s.hooks?s.hooks.provideLexer():e?ae.lex:ae.lexInline)(t,s);s.hooks&&(a=s.hooks.processAllTokens(a)),s.walkTokens&&this.walkTokens(a,s.walkTokens);let l=(s.hooks?s.hooks.provideParser():e?oe.parse:oe.parseInline)(a,s);return s.hooks&&(l=s.hooks.postprocess(l)),l}catch(a){return r(a)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let i="<p>An error occurred:</p><pre>"+be(n.message+"",!0)+"</pre>";return t?Promise.resolve(i):i}if(t)return Promise.reject(n);throw n}}},Ue=new Ou;function P(e,t){return Ue.parse(e,t)}P.options=P.setOptions=function(e){return Ue.setOptions(e),P.defaults=Ue.defaults,Ya(P.defaults),P};P.getDefaults=ns;P.defaults=Ke;P.use=function(...e){return Ue.use(...e),P.defaults=Ue.defaults,Ya(P.defaults),P};P.walkTokens=function(e,t){return Ue.walkTokens(e,t)};P.parseInline=Ue.parseInline;P.Parser=oe;P.parser=oe.parse;P.Renderer=on;P.TextRenderer=ds;P.Lexer=ae;P.lexer=ae.lex;P.Tokenizer=an;P.Hooks=$t;P.parse=P;P.options;P.setOptions;P.use;P.walkTokens;P.parseInline;oe.parse;ae.lex;P.setOptions({gfm:!0,breaks:!0,mangle:!1});const Ar=["a","b","blockquote","br","code","del","em","h1","h2","h3","h4","hr","i","li","ol","p","pre","strong","table","tbody","td","th","thead","tr","ul"],Sr=["class","href","rel","target","title","start"];let _r=!1;const Nu=14e4,Du=4e4,Bu=200,ei=5e4,Ne=new Map;function Fu(e){const t=Ne.get(e);return t===void 0?null:(Ne.delete(e),Ne.set(e,t),t)}function Tr(e,t){if(Ne.set(e,t),Ne.size<=Bu)return;const n=Ne.keys().next().value;n&&Ne.delete(n)}function zu(){_r||(_r=!0,wi.addHook("afterSanitizeAttributes",e=>{!(e instanceof HTMLAnchorElement)||!e.getAttribute("href")||(e.setAttribute("rel","noreferrer noopener"),e.setAttribute("target","_blank"))}))}function Si(e){const t=e.trim();if(!t)return"";if(zu(),t.length<=ei){const a=Fu(t);if(a!==null)return a}const n=la(t,Nu),i=n.truncated?`

… truncated (${n.total} chars, showing first ${n.text.length}).`:"";if(n.text.length>Du){const l=`<pre class="code-block">${Uu(`${n.text}${i}`)}</pre>`,c=wi.sanitize(l,{ALLOWED_TAGS:Ar,ALLOWED_ATTR:Sr});return t.length<=ei&&Tr(t,c),c}const s=P.parse(`${n.text}${i}`),r=wi.sanitize(s,{ALLOWED_TAGS:Ar,ALLOWED_ATTR:Sr});return t.length<=ei&&Tr(t,r),r}function Uu(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}const Ku=1500,Hu=2e3,lo="Copy as markdown",Wu="Copied",ju="Copy failed";async function qu(e){if(!e)return!1;try{return await navigator.clipboard.writeText(e),!0}catch{return!1}}function Qt(e,t){e.title=t,e.setAttribute("aria-label",t)}function Vu(e){const t=e.label??lo;return o`
    <button
      class="chat-copy-btn"
      type="button"
      title=${t}
      aria-label=${t}
      @click=${async n=>{const i=n.currentTarget;if(i?.querySelector(".chat-copy-btn__icon"),!i||i.dataset.copying==="1")return;i.dataset.copying="1",i.setAttribute("aria-busy","true"),i.disabled=!0;const s=await qu(e.text());if(i.isConnected){if(delete i.dataset.copying,i.removeAttribute("aria-busy"),i.disabled=!1,!s){i.dataset.error="1",Qt(i,ju),window.setTimeout(()=>{i.isConnected&&(delete i.dataset.error,Qt(i,t))},Hu);return}i.dataset.copied="1",Qt(i,Wu),window.setTimeout(()=>{i.isConnected&&(delete i.dataset.copied,Qt(i,t))},Ku)}}}
    >
      <span class="chat-copy-btn__icon" aria-hidden="true">
        <span class="chat-copy-btn__icon-copy">${G.copy}</span>
        <span class="chat-copy-btn__icon-check">${G.check}</span>
      </span>
    </button>
  `}function Gu(e){return Vu({text:()=>e,label:lo})}const Qu={icon:"puzzle",detailKeys:["command","path","url","targetUrl","targetId","ref","element","node","nodeId","id","requestId","to","channelId","guildId","userId","name","query","pattern","messageId"]},Zu={bash:{icon:"wrench",title:"Bash",detailKeys:["command"]},process:{icon:"wrench",title:"Process",detailKeys:["sessionId"]},read:{icon:"fileText",title:"Read",detailKeys:["path"]},write:{icon:"edit",title:"Write",detailKeys:["path"]},edit:{icon:"penLine",title:"Edit",detailKeys:["path"]},attach:{icon:"paperclip",title:"Attach",detailKeys:["path","url","fileName"]},browser:{icon:"globe",title:"Browser",actions:{status:{label:"status"},start:{label:"start"},stop:{label:"stop"},tabs:{label:"tabs"},open:{label:"open",detailKeys:["targetUrl"]},focus:{label:"focus",detailKeys:["targetId"]},close:{label:"close",detailKeys:["targetId"]},snapshot:{label:"snapshot",detailKeys:["targetUrl","targetId","ref","element","format"]},screenshot:{label:"screenshot",detailKeys:["targetUrl","targetId","ref","element"]},navigate:{label:"navigate",detailKeys:["targetUrl","targetId"]},console:{label:"console",detailKeys:["level","targetId"]},pdf:{label:"pdf",detailKeys:["targetId"]},upload:{label:"upload",detailKeys:["paths","ref","inputRef","element","targetId"]},dialog:{label:"dialog",detailKeys:["accept","promptText","targetId"]},act:{label:"act",detailKeys:["request.kind","request.ref","request.selector","request.text","request.value"]}}},canvas:{icon:"image",title:"Canvas",actions:{present:{label:"present",detailKeys:["target","node","nodeId"]},hide:{label:"hide",detailKeys:["node","nodeId"]},navigate:{label:"navigate",detailKeys:["url","node","nodeId"]},eval:{label:"eval",detailKeys:["javaScript","node","nodeId"]},snapshot:{label:"snapshot",detailKeys:["format","node","nodeId"]},a2ui_push:{label:"A2UI push",detailKeys:["jsonlPath","node","nodeId"]},a2ui_reset:{label:"A2UI reset",detailKeys:["node","nodeId"]}}},nodes:{icon:"smartphone",title:"Nodes",actions:{status:{label:"status"},describe:{label:"describe",detailKeys:["node","nodeId"]},pending:{label:"pending"},approve:{label:"approve",detailKeys:["requestId"]},reject:{label:"reject",detailKeys:["requestId"]},notify:{label:"notify",detailKeys:["node","nodeId","title","body"]},camera_snap:{label:"camera snap",detailKeys:["node","nodeId","facing","deviceId"]},camera_list:{label:"camera list",detailKeys:["node","nodeId"]},camera_clip:{label:"camera clip",detailKeys:["node","nodeId","facing","duration","durationMs"]},screen_record:{label:"screen record",detailKeys:["node","nodeId","duration","durationMs","fps","screenIndex"]}}},cron:{icon:"loader",title:"Cron",actions:{status:{label:"status"},list:{label:"list"},add:{label:"add",detailKeys:["job.name","job.id","job.schedule","job.cron"]},update:{label:"update",detailKeys:["id"]},remove:{label:"remove",detailKeys:["id"]},run:{label:"run",detailKeys:["id"]},runs:{label:"runs",detailKeys:["id"]},wake:{label:"wake",detailKeys:["text","mode"]}}},gateway:{icon:"plug",title:"Gateway",actions:{restart:{label:"restart",detailKeys:["reason","delayMs"]},"config.get":{label:"config get"},"config.schema":{label:"config schema"},"config.apply":{label:"config apply",detailKeys:["restartDelayMs"]},"update.run":{label:"update run",detailKeys:["restartDelayMs"]}}},whatsapp_login:{icon:"circle",title:"WhatsApp Login",actions:{start:{label:"start"},wait:{label:"wait"}}},discord:{icon:"messageSquare",title:"Discord",actions:{react:{label:"react",detailKeys:["channelId","messageId","emoji"]},reactions:{label:"reactions",detailKeys:["channelId","messageId"]},sticker:{label:"sticker",detailKeys:["to","stickerIds"]},poll:{label:"poll",detailKeys:["question","to"]},permissions:{label:"permissions",detailKeys:["channelId"]},readMessages:{label:"read messages",detailKeys:["channelId","limit"]},sendMessage:{label:"send",detailKeys:["to","content"]},editMessage:{label:"edit",detailKeys:["channelId","messageId"]},deleteMessage:{label:"delete",detailKeys:["channelId","messageId"]},threadCreate:{label:"thread create",detailKeys:["channelId","name"]},threadList:{label:"thread list",detailKeys:["guildId","channelId"]},threadReply:{label:"thread reply",detailKeys:["channelId","content"]},pinMessage:{label:"pin",detailKeys:["channelId","messageId"]},unpinMessage:{label:"unpin",detailKeys:["channelId","messageId"]},listPins:{label:"list pins",detailKeys:["channelId"]},searchMessages:{label:"search",detailKeys:["guildId","content"]},memberInfo:{label:"member",detailKeys:["guildId","userId"]},roleInfo:{label:"roles",detailKeys:["guildId"]},emojiList:{label:"emoji list",detailKeys:["guildId"]},roleAdd:{label:"role add",detailKeys:["guildId","userId","roleId"]},roleRemove:{label:"role remove",detailKeys:["guildId","userId","roleId"]},channelInfo:{label:"channel",detailKeys:["channelId"]},channelList:{label:"channels",detailKeys:["guildId"]},voiceStatus:{label:"voice",detailKeys:["guildId","userId"]},eventList:{label:"events",detailKeys:["guildId"]},eventCreate:{label:"event create",detailKeys:["guildId","name"]},timeout:{label:"timeout",detailKeys:["guildId","userId"]},kick:{label:"kick",detailKeys:["guildId","userId"]},ban:{label:"ban",detailKeys:["guildId","userId"]}}},slack:{icon:"messageSquare",title:"Slack",actions:{react:{label:"react",detailKeys:["channelId","messageId","emoji"]},reactions:{label:"reactions",detailKeys:["channelId","messageId"]},sendMessage:{label:"send",detailKeys:["to","content"]},editMessage:{label:"edit",detailKeys:["channelId","messageId"]},deleteMessage:{label:"delete",detailKeys:["channelId","messageId"]},readMessages:{label:"read messages",detailKeys:["channelId","limit"]},pinMessage:{label:"pin",detailKeys:["channelId","messageId"]},unpinMessage:{label:"unpin",detailKeys:["channelId","messageId"]},listPins:{label:"list pins",detailKeys:["channelId"]},memberInfo:{label:"member",detailKeys:["userId"]},emojiList:{label:"emoji list"}}}},Yu={fallback:Qu,tools:Zu},co=Yu,Er=co.fallback??{icon:"puzzle"},Xu=co.tools??{};function Ju(e){return(e??"tool").trim()}function ep(e){const t=e.replace(/_/g," ").trim();return t?t.split(/\s+/).map(n=>n.length<=2&&n.toUpperCase()===n?n:`${n.at(0)?.toUpperCase()??""}${n.slice(1)}`).join(" "):"Tool"}function tp(e){const t=e?.trim();if(t)return t.replace(/_/g," ")}function uo(e){if(e!=null){if(typeof e=="string"){const t=e.trim();if(!t)return;const n=t.split(/\r?\n/)[0]?.trim()??"";return n?n.length>160?`${n.slice(0,157)}…`:n:void 0}if(typeof e=="number"||typeof e=="boolean")return String(e);if(Array.isArray(e)){const t=e.map(i=>uo(i)).filter(i=>!!i);if(t.length===0)return;const n=t.slice(0,3).join(", ");return t.length>3?`${n}…`:n}}}function np(e,t){if(!e||typeof e!="object")return;let n=e;for(const i of t.split(".")){if(!i||!n||typeof n!="object")return;n=n[i]}return n}function ip(e,t){for(const n of t){const i=np(e,n),s=uo(i);if(s)return s}}function sp(e){if(!e||typeof e!="object")return;const t=e,n=typeof t.path=="string"?t.path:void 0;if(!n)return;const i=typeof t.offset=="number"?t.offset:void 0,s=typeof t.limit=="number"?t.limit:void 0;return i!==void 0&&s!==void 0?`${n}:${i}-${i+s}`:n}function rp(e){if(!e||typeof e!="object")return;const t=e;return typeof t.path=="string"?t.path:void 0}function ap(e,t){if(!(!e||!t))return e.actions?.[t]??void 0}function op(e){const t=Ju(e.name),n=t.toLowerCase(),i=Xu[n],s=i?.icon??Er.icon??"puzzle",r=i?.title??ep(t),a=i?.label??t,l=e.args&&typeof e.args=="object"?e.args.action:void 0,c=typeof l=="string"?l.trim():void 0,p=ap(i,c),d=tp(p?.label??c);let u;n==="read"&&(u=sp(e.args)),!u&&(n==="write"||n==="edit"||n==="attach")&&(u=rp(e.args));const v=p?.detailKeys??i?.detailKeys??Er.detailKeys??[];return!u&&v.length>0&&(u=ip(e.args,v)),!u&&e.meta&&(u=e.meta),u&&(u=cp(u)),{name:t,icon:s,title:r,label:a,verb:d,detail:u}}function lp(e){const t=[];if(e.verb&&t.push(e.verb),e.detail&&t.push(e.detail),t.length!==0)return t.join(" · ")}function cp(e){return e&&e.replace(/\/Users\/[^/]+/g,"~").replace(/\/home\/[^/]+/g,"~")}const dp=80,up=2,Cr=100;function pp(e){const t=e.trim();if(t.startsWith("{")||t.startsWith("["))try{const n=JSON.parse(t);return"```json\n"+JSON.stringify(n,null,2)+"\n```"}catch{}return e}function fp(e){const t=e.split(`
`),n=t.slice(0,up),i=n.join(`
`);return i.length>Cr?i.slice(0,Cr)+"…":n.length<t.length?i+"…":i}function hp(e){const t=e,n=gp(t.content),i=[];for(const s of n){const r=String(s.type??"").toLowerCase();(["toolcall","tool_call","tooluse","tool_use"].includes(r)||typeof s.name=="string"&&s.arguments!=null)&&i.push({kind:"call",name:s.name??"tool",args:vp(s.arguments??s.args)})}for(const s of n){const r=String(s.type??"").toLowerCase();if(r!=="toolresult"&&r!=="tool_result")continue;const a=mp(s),l=typeof s.name=="string"?s.name:"tool";i.push({kind:"result",name:l,text:a})}if(qa(e)&&!i.some(s=>s.kind==="result")){const s=typeof t.toolName=="string"&&t.toolName||typeof t.tool_name=="string"&&t.tool_name||"tool",r=ca(e)??void 0;i.push({kind:"result",name:s,text:r})}return i}function Mr(e,t){const n=op({name:e.name,args:e.args}),i=lp(n),s=!!e.text?.trim(),r=!!t,a=r?()=>{if(s){t(pp(e.text));return}const u=`## ${n.label}

${i?`**Command:** \`${i}\`

`:""}*No output — tool completed successfully.*`;t(u)}:void 0,l=s&&(e.text?.length??0)<=dp,c=s&&!l,p=s&&l,d=!s;return o`
    <div
      class="chat-tool-card ${r?"chat-tool-card--clickable":""}"
      @click=${a}
      role=${r?"button":h}
      tabindex=${r?"0":h}
      @keydown=${r?u=>{u.key!=="Enter"&&u.key!==" "||(u.preventDefault(),a?.())}:h}
    >
      <div class="chat-tool-card__header">
        <div class="chat-tool-card__title">
          <span class="chat-tool-card__icon">${G[n.icon]}</span>
          <span>${n.label}</span>
        </div>
        ${r?o`<span class="chat-tool-card__action">${s?"View":""} ${G.check}</span>`:h}
        ${d&&!r?o`<span class="chat-tool-card__status">${G.check}</span>`:h}
      </div>
      ${i?o`<div class="chat-tool-card__detail">${i}</div>`:h}
      ${d?o`<div class="chat-tool-card__status-text muted">Completed</div>`:h}
      ${c?o`<div class="chat-tool-card__preview mono">${fp(e.text)}</div>`:h}
      ${p?o`<div class="chat-tool-card__inline mono">${e.text}</div>`:h}
    </div>
  `}function gp(e){return Array.isArray(e)?e.filter(Boolean):[]}function vp(e){if(typeof e!="string")return e;const t=e.trim();if(!t||!t.startsWith("{")&&!t.startsWith("["))return e;try{return JSON.parse(t)}catch{return e}}function mp(e){if(typeof e.text=="string")return e.text;if(typeof e.content=="string")return e.content}function bp(e){const n=e.content,i=[];if(Array.isArray(n))for(const s of n){if(typeof s!="object"||s===null)continue;const r=s;if(r.type==="image"){const a=r.source;if(a?.type==="base64"&&typeof a.data=="string"){const l=a.data,c=a.media_type||"image/png",p=l.startsWith("data:")?l:`data:${c};base64,${l}`;i.push({url:p})}else typeof r.url=="string"&&i.push({url:r.url})}else if(r.type==="image_url"){const a=r.image_url;typeof a?.url=="string"&&i.push({url:a.url})}}return i}function yp(e){return o`
    <div class="chat-group assistant">
      ${us("assistant",e)}
      <div class="chat-group-messages">
        <div class="chat-bubble chat-reading-indicator" aria-hidden="true">
          <span class="chat-reading-indicator__dots">
            <span></span><span></span><span></span>
          </span>
        </div>
      </div>
    </div>
  `}function $p(e,t,n,i){const s=new Date(t).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}),r=i?.name??"智能体";return o`
    <div class="chat-group assistant">
      ${us("assistant",i)}
      <div class="chat-group-messages">
        ${po({role:"assistant",content:[{type:"text",text:e}],timestamp:t},{isStreaming:!0,showReasoning:!1},n)}
        <div class="chat-group-footer">
          <span class="chat-sender-name">${r}</span>
          <span class="chat-group-timestamp">${s}</span>
        </div>
      </div>
    </div>
  `}function wp(e,t){const n=ts(e.role),i=t.assistantName??"智能体",s=n==="user"?"你":n==="assistant"?i:n,r=n==="user"?"user":n==="assistant"?"assistant":"other",a=new Date(e.timestamp).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});return o`
    <div class="chat-group ${r}">
      ${us(e.role,{name:i,avatar:t.assistantAvatar??null})}
      <div class="chat-group-messages">
        ${e.messages.map((l,c)=>po(l.message,{isStreaming:e.isStreaming&&c===e.messages.length-1,showReasoning:t.showReasoning},t.onOpenSidebar))}
        <div class="chat-group-footer">
          <span class="chat-sender-name">${s}</span>
          <span class="chat-group-timestamp">${a}</span>
        </div>
      </div>
    </div>
  `}function us(e,t){const n=ts(e),i=t?.name?.trim()||"智能体",s=t?.avatar?.trim()||"",r=n==="user"?"我":n==="assistant"?i.charAt(0).toUpperCase()||"助":n==="tool"?"⚙":"?",a=n==="user"?"user":n==="assistant"?"assistant":n==="tool"?"tool":"other";return s&&n==="assistant"?xp(s)?o`<img
        class="chat-avatar ${a}"
        src="${s}"
        alt="${i}"
      />`:o`<div class="chat-avatar ${a}">${s}</div>`:o`<div class="chat-avatar ${a}">${r}</div>`}function xp(e){return/^https?:\/\//i.test(e)||/^data:image\//i.test(e)||/^\//.test(e)}function kp(e){return e.length===0?h:o`
    <div class="chat-message-images">
      ${e.map(t=>o`
          <img
            src=${t.url}
            alt=${t.alt??"附件图片"}
            class="chat-message-image"
            @click=${()=>window.open(t.url,"_blank")}
          />
        `)}
    </div>
  `}function po(e,t,n){const i=e,s=typeof i.role=="string"?i.role:"unknown",r=qa(e)||s.toLowerCase()==="toolresult"||s.toLowerCase()==="tool_result"||typeof i.toolCallId=="string"||typeof i.tool_call_id=="string",a=hp(e),l=a.length>0,c=bp(e),p=c.length>0,d=ca(e),u=t.showReasoning&&s==="assistant"?_l(e):null,v=d?.trim()?d:null,g=u?El(u):null,$=v,w=s==="assistant"&&!!$?.trim(),k=["chat-bubble",w?"has-copy":"",t.isStreaming?"streaming":"","fade-in"].filter(Boolean).join(" ");return!$&&l&&r?o`${a.map(E=>Mr(E,n))}`:!$&&!l&&!p?h:o`
    <div class="${k}">
      ${w?Gu($):h}
      ${kp(c)}
      ${g?o`<div class="chat-thinking">${mi(Si(g))}</div>`:h}
      ${$?o`<div class="chat-text">${mi(Si($))}</div>`:h}
      ${a.map(E=>Mr(E,n))}
    </div>
  `}function Ap(e){return o`
    <div class="sidebar-panel">
      <div class="sidebar-header">
        <div class="sidebar-title">工具输出</div>
        <button @click=${e.onClose} class="btn" title="关闭侧边栏">
          ${G.x}
        </button>
      </div>
      <div class="sidebar-content">
        ${e.error?o`
              <div class="callout danger">${e.error}</div>
              <button @click=${e.onViewRawText} class="btn" style="margin-top: 12px;">
                查看原始文本
              </button>
            `:e.content?o`<div class="sidebar-markdown">${mi(Si(e.content))}</div>`:o`<div class="muted">无可用内容</div>`}
      </div>
    </div>
  `}var Sp=Object.defineProperty,_p=Object.getOwnPropertyDescriptor,xn=(e,t,n,i)=>{for(var s=i>1?void 0:i?_p(t,n):t,r=e.length-1,a;r>=0;r--)(a=e[r])&&(s=(i?a(t,n,s):a(s))||s);return i&&s&&Sp(t,n,s),s};let st=class extends Je{constructor(){super(...arguments),this.splitRatio=.6,this.minRatio=.4,this.maxRatio=.7,this.isDragging=!1,this.startX=0,this.startRatio=0,this.handleMouseDown=e=>{this.isDragging=!0,this.startX=e.clientX,this.startRatio=this.splitRatio,this.classList.add("dragging"),document.addEventListener("mousemove",this.handleMouseMove),document.addEventListener("mouseup",this.handleMouseUp),e.preventDefault()},this.handleMouseMove=e=>{if(!this.isDragging)return;const t=this.parentElement;if(!t)return;const n=t.getBoundingClientRect().width,s=(e.clientX-this.startX)/n;let r=this.startRatio+s;r=Math.max(this.minRatio,Math.min(this.maxRatio,r)),this.dispatchEvent(new CustomEvent("resize",{detail:{splitRatio:r},bubbles:!0,composed:!0}))},this.handleMouseUp=()=>{this.isDragging=!1,this.classList.remove("dragging"),document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp)}}render(){return o``}connectedCallback(){super.connectedCallback(),this.addEventListener("mousedown",this.handleMouseDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("mousedown",this.handleMouseDown),document.removeEventListener("mousemove",this.handleMouseMove),document.removeEventListener("mouseup",this.handleMouseUp)}};st.styles=Fo`
    :host {
      width: 4px;
      cursor: col-resize;
      background: var(--border, #333);
      transition: background 150ms ease-out;
      flex-shrink: 0;
      position: relative;
    }

    :host::before {
      content: "";
      position: absolute;
      top: 0;
      left: -4px;
      right: -4px;
      bottom: 0;
    }

    :host(:hover) {
      background: var(--accent, #007bff);
    }

    :host(.dragging) {
      background: var(--accent, #007bff);
    }
  `;xn([un({type:Number})],st.prototype,"splitRatio",2);xn([un({type:Number})],st.prototype,"minRatio",2);xn([un({type:Number})],st.prototype,"maxRatio",2);st=xn([ta("resizable-divider")],st);const Tp=5e3;function Ep(e){return e?e.active?o`
      <div class="callout info compaction-indicator compaction-indicator--active">
        ${G.loader} 正在压缩上下文...
      </div>
    `:e.completedAt&&Date.now()-e.completedAt<Tp?o`
        <div class="callout success compaction-indicator compaction-indicator--complete">
          ${G.check} 上下文已压缩
        </div>
      `:h:h}function Cp(){return`att-${Date.now()}-${Math.random().toString(36).slice(2,9)}`}function Mp(e,t){const n=e.clipboardData?.items;if(!n||!t.onAttachmentsChange)return;const i=[];for(let s=0;s<n.length;s++){const r=n[s];r.type.startsWith("image/")&&i.push(r)}if(i.length!==0){e.preventDefault();for(const s of i){const r=s.getAsFile();if(!r)continue;const a=new FileReader;a.onload=()=>{const l=a.result,c={id:Cp(),dataUrl:l,mimeType:r.type},p=t.attachments??[];t.onAttachmentsChange?.([...p,c])},a.readAsDataURL(r)}}}function Ip(e){const t=e.attachments??[];return t.length===0?h:o`
    <div class="chat-attachments">
      ${t.map(n=>o`
          <div class="chat-attachment">
            <img
              src=${n.dataUrl}
              alt="附件预览"
              class="chat-attachment__img"
            />
            <button
              class="chat-attachment__remove"
              type="button"
              aria-label="移除附件"
              @click=${()=>{const i=(e.attachments??[]).filter(s=>s.id!==n.id);e.onAttachmentsChange?.(i)}}
            >
              ${G.x}
            </button>
          </div>
        `)}
    </div>
  `}function Lp(e){const t=e.connected,n=e.sending||e.stream!==null,i=!!(e.canAbort&&e.onAbort),r=e.sessions?.sessions?.find(g=>g.key===e.sessionKey)?.reasoningLevel??"off",a=e.showThinking&&r!=="off",l={name:e.assistantName,avatar:e.assistantAvatar??e.assistantAvatarUrl??null},c=(e.attachments?.length??0)>0,p=e.connected?c?"添加消息或粘贴更多图片...":"发送消息（↩ 发送，Shift+↩ 换行，可粘贴图片）":"连接到网关以开始聊天...",d=e.splitRatio??.6,u=!!(e.sidebarOpen&&e.onCloseSidebar),v=o`
    <div
      class="chat-thread"
      role="log"
      aria-live="polite"
      @scroll=${e.onChatScroll}
    >
      ${e.loading?o`<div class="muted">正在加载聊天...</div>`:h}
      ${Wa(Pp(e),g=>g.key,g=>g.kind==="reading-indicator"?yp(l):g.kind==="stream"?$p(g.text,g.startedAt,e.onOpenSidebar,l):g.kind==="group"?wp(g,{onOpenSidebar:e.onOpenSidebar,showReasoning:a,assistantName:e.assistantName,assistantAvatar:l.avatar}):h)}
    </div>
  `;return o`
    <section class="card chat">
      ${e.disabledReason?o`<div class="callout">${e.disabledReason}</div>`:h}

      ${e.error?o`<div class="callout danger">${e.error}</div>`:h}

      ${Ep(e.compactionStatus)}

      ${e.focusMode?o`
            <button
              class="chat-focus-exit"
              type="button"
              @click=${e.onToggleFocusMode}
              aria-label="退出专注模式"
              title="退出专注模式"
            >
              ${G.x}
            </button>
          `:h}

      <div
        class="chat-split-container ${u?"chat-split-container--open":""}"
      >
        <div
          class="chat-main"
          style="flex: ${u?`0 0 ${d*100}%`:"1 1 100%"}"
        >
          ${v}
        </div>

        ${u?o`
              <resizable-divider
                .splitRatio=${d}
                @resize=${g=>e.onSplitRatioChange?.(g.detail.splitRatio)}
              ></resizable-divider>
              <div class="chat-sidebar">
                ${Ap({content:e.sidebarContent??null,error:e.sidebarError??null,onClose:e.onCloseSidebar,onViewRawText:()=>{!e.sidebarContent||!e.onOpenSidebar||e.onOpenSidebar(`\`\`\`
${e.sidebarContent}
\`\`\``)}})}
              </div>
            `:h}
      </div>

      ${e.queue.length?o`
            <div class="chat-queue" role="status" aria-live="polite">
              <div class="chat-queue__title">已排队 (${e.queue.length})</div>
              <div class="chat-queue__list">
                ${e.queue.map(g=>o`
                    <div class="chat-queue__item">
                      <div class="chat-queue__text">
                        ${g.text||(g.attachments?.length?`图片 (${g.attachments.length})`:"")}
                      </div>
                      <button
                        class="btn chat-queue__remove"
                        type="button"
                        aria-label="移除排队消息"
                        @click=${()=>e.onQueueRemove(g.id)}
                      >
                        ${G.x}
                      </button>
                    </div>
                  `)}
              </div>
            </div>
          `:h}

      <div class="chat-compose">
        ${Ip(e)}
        <div class="chat-compose__row">
          <label class="field chat-compose__field">
            <span>消息</span>
            <textarea
              .value=${e.draft}
              ?disabled=${!e.connected}
              @keydown=${g=>{g.key==="Enter"&&(g.isComposing||g.keyCode===229||g.shiftKey||e.connected&&(g.preventDefault(),t&&e.onSend()))}}
              @input=${g=>e.onDraftChange(g.target.value)}
              @paste=${g=>Mp(g,e)}
              placeholder=${p}
            ></textarea>
          </label>
          <div class="chat-compose__actions">
            <button
              class="btn"
              ?disabled=${!e.connected||!i&&e.sending}
              @click=${i?e.onAbort:e.onNewSession}
            >
              ${i?"停止回传":"开启新会话"}
            </button>
            <button
              class="btn primary"
              ?disabled=${!e.connected}
              @click=${e.onSend}
            >
              ${n?"排队":"发送"}<kbd class="btn-kbd">↵</kbd>
            </button>
          </div>
        </div>
      </div>
    </section>
  `}const Ir=200;function Rp(e){const t=[];let n=null;for(const i of e){if(i.kind!=="message"){n&&(t.push(n),n=null),t.push(i);continue}const s=ja(i.message),r=ts(s.role),a=s.timestamp||Date.now();!n||n.role!==r?(n&&t.push(n),n={kind:"group",key:`group:${r}:${i.key}`,role:r,messages:[{message:i.message,key:i.key}],timestamp:a,isStreaming:!1}):n.messages.push({message:i.message,key:i.key})}return n&&t.push(n),t}function Pp(e){const t=[],n=Array.isArray(e.messages)?e.messages:[],i=Array.isArray(e.toolMessages)?e.toolMessages:[],s=Math.max(0,n.length-Ir);s>0&&t.push({kind:"message",key:"chat:history:notice",message:{role:"system",content:`显示最近 ${Ir} 条消息（隐藏了 ${s} 条）。`,timestamp:Date.now()}});for(let r=s;r<n.length;r++){const a=n[r],l=ja(a);!e.showThinking&&l.role.toLowerCase()==="toolresult"||t.push({kind:"message",key:Lr(a,r),message:a})}if(e.showThinking)for(let r=0;r<i.length;r++)t.push({kind:"message",key:Lr(i[r],r+n.length),message:i[r]});if(e.stream!==null){const r=`stream:${e.sessionKey}:${e.streamStartedAt??"live"}`;e.stream.trim().length>0?t.push({kind:"stream",key:r,text:e.stream,startedAt:e.streamStartedAt??Date.now()}):t.push({kind:"reading-indicator",key:r})}return Rp(t)}function Lr(e,t){const n=e,i=typeof n.toolCallId=="string"?n.toolCallId:"";if(i)return`tool:${i}`;const s=typeof n.id=="string"?n.id:"";if(s)return`msg:${s}`;const r=typeof n.messageId=="string"?n.messageId:"";if(r)return`msg:${r}`;const a=typeof n.timestamp=="number"?n.timestamp:null,l=typeof n.role=="string"?n.role:"unknown";return a!=null?`msg:${l}:${a}:${t}`:`msg:${l}:${t}`}function fe(e){if(e)return Array.isArray(e.type)?e.type.filter(n=>n!=="null")[0]??e.type[0]:e.type}function fo(e){if(!e)return"";if(e.default!==void 0)return e.default;switch(fe(e)){case"object":return{};case"array":return[];case"boolean":return!1;case"number":case"integer":return 0;case"string":return"";default:return""}}function Pt(e){return e.map(t=>typeof t=="number"?"*":t).join(".")}function ie(e,t){const n=Pt(e),i=t[n];if(i)return i;const s=n.split(".");for(const[r,a]of Object.entries(t)){if(!r.includes("*"))continue;const l=r.split(".");if(l.length!==s.length)continue;let c=!0;for(let p=0;p<s.length;p+=1)if(l[p]!=="*"&&l[p]!==s[p]){c=!1;break}if(c)return a}}function we(e){return e.replace(/_/g," ").replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/\s+/g," ").replace(/^./,t=>t.toUpperCase())}function Op(e){const t=Pt(e).toLowerCase();return t.includes("token")||t.includes("password")||t.includes("secret")||t.includes("apikey")||t.endsWith("key")}function Np(e,t){const n=Pt(e);if(t.has(n))return!0;const i=n.split(".");for(const s of t){if(!s.includes("*"))continue;const r=s.split(".");if(r.length!==i.length)continue;let a=!0;for(let l=0;l<i.length;l+=1)if(r[l]!=="*"&&r[l]!==i[l]){a=!1;break}if(a)return!0}return!1}const Dp=new Set(["title","description","default","nullable"]);function Bp(e){return Object.keys(e??{}).filter(n=>!Dp.has(n)).length===0}function Fp(e){if(e===void 0)return"";try{return JSON.stringify(e,null,2)??""}catch{return""}}const rt={chevronDown:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,plus:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,minus:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,trash:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,edit:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,refresh:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`};function $e(e){const{schema:t,value:n,path:i,hints:s,unsupported:r,disabled:a,onPatch:l,onDiscoverModels:c}=e,p=e.showLabel??!0,d=fe(t),u=ie(i,s),v=u?.label??t.title??String(i.at(-1)??""),g=v==="undefined"||!v?we(String(i.at(-1)??"")):v,$=u?.help??t.description;if(Pt(i),Np(i,r))return o`<div class="cfg-field cfg-field--error">
      <div class="cfg-field__label">${g}</div>
      <div class="cfg-field__error">不支持的架构节点。请使用原生模式 (Raw)。</div>
    </div>`;if(t.anyOf||t.oneOf){const k=(t.anyOf??t.oneOf??[]).filter(A=>!(A.type==="null"||Array.isArray(A.type)&&A.type.includes("null")));if(k.length===1)return $e({...e,schema:k[0]});const E=A=>{if(A.const!==void 0)return A.const;if(A.enum&&A.enum.length===1)return A.enum[0]},C=k.map(E),N=C.every(A=>A!==void 0);if(N&&C.length>0&&C.length<=5){const A=n??t.default;return o`
        <div class="cfg-field">
          ${p?o`<label class="cfg-field__label">${g}</label>`:h}
          ${$?o`<div class="cfg-field__help">${$}</div>`:h}
          <div class="cfg-segmented">
            ${C.map((O,te)=>o`
              <button
                type="button"
                class="cfg-segmented__btn ${O===A||String(O)===String(A)?"active":""}"
                ?disabled=${a}
                @click=${()=>l(i,O)}
              >
                ${String(O)}
              </button>
            `)}
          </div>
        </div>
      `}if(N&&C.length>5)return Pr({...e,options:C,value:n??t.default});const I=new Set(k.map(A=>fe(A)).filter(Boolean)),L=new Set([...I].map(A=>A==="integer"?"number":A));if([...L].every(A=>["string","number","boolean"].includes(A))){const A=L.has("string"),O=L.has("number");if(L.has("boolean")&&L.size===1)return $e({...e,schema:{...t,type:"boolean",anyOf:void 0,oneOf:void 0}});if(A||O)return Rr({...e,inputType:O&&!A?"number":"text"})}}if(t.enum){const w=t.enum;if(w.length<=5){const k=n??t.default;return o`
        <div class="cfg-field">
          ${p?o`<label class="cfg-field__label">${g}</label>`:h}
          ${$?o`<div class="cfg-field__help">${$}</div>`:h}
          <div class="cfg-segmented">
            ${w.map(E=>o`
              <button
                type="button"
                class="cfg-segmented__btn ${E===k||String(E)===String(k)?"active":""}"
                ?disabled=${a}
                @click=${()=>l(i,E)}
              >
                ${String(E)}
              </button>
            `)}
          </div>
        </div>
      `}return Pr({...e,options:w,value:n??t.default})}if(d==="object")return Up(e);if(d==="array")return Kp(e);if(d==="boolean"){const w=typeof n=="boolean"?n:typeof t.default=="boolean"?t.default:!1;return o`
      <label class="cfg-toggle-row ${a?"disabled":""}">
        <div class="cfg-toggle-row__content">
          <span class="cfg-toggle-row__label">${g}</span>
          ${$?o`<span class="cfg-toggle-row__help">${$}</span>`:h}
        </div>
        <div class="cfg-toggle">
          <input
            type="checkbox"
            .checked=${w}
            ?disabled=${a}
            @change=${k=>l(i,k.target.checked)}
          />
          <span class="cfg-toggle__track"></span>
        </div>
      </label>
    `}return d==="number"||d==="integer"?zp(e):d==="string"?Rr({...e,inputType:"text"}):o`
    <div class="cfg-field cfg-field--error">
      <div class="cfg-field__label">${g}</div>
      <div class="cfg-field__error">不支持的类型: ${d}。请使用原生模式 (Raw)。</div>
    </div>
  `}function Rr(e){const{schema:t,value:n,path:i,hints:s,disabled:r,onPatch:a,inputType:l}=e,c=e.showLabel??!0,p=ie(i,s),d=p?.label??t.title??we(String(i.at(-1))),u=p?.help??t.description,v=p?.sensitive??Op(i),g=p?.placeholder??(v?"••••":t.default!==void 0?`默认值: ${t.default}`:""),$=n??"";return o`
    <div class="cfg-field">
      ${c?o`<label class="cfg-field__label">${d}</label>`:h}
      ${u?o`<div class="cfg-field__help">${u}</div>`:h}
      <div class="cfg-input-wrap">
        <input
          type=${v?"password":l}
          class="cfg-input"
          placeholder=${g}
          .value=${$==null?"":String($)}
          ?disabled=${r}
          @input=${w=>{const k=w.target.value;if(l==="number"){if(k.trim()===""){a(i,void 0);return}const E=Number(k);a(i,Number.isNaN(E)?k:E);return}a(i,k)}}
        />
        ${t.default!==void 0?o`
          <button
            type="button"
            class="cfg-input__reset"
            title="重置为默认值"
            ?disabled=${r}
            @click=${()=>a(i,t.default)}
          >↺</button>
        `:h}
      </div>
    </div>
  `}function zp(e){const{schema:t,value:n,path:i,hints:s,disabled:r,onPatch:a}=e,l=e.showLabel??!0,c=ie(i,s),p=c?.label??t.title??we(String(i.at(-1))),d=c?.help??t.description,u=n??t.default??"",v=typeof u=="number"?u:0;return o`
    <div class="cfg-field">
      ${l?o`<label class="cfg-field__label">${p}</label>`:h}
      ${d?o`<div class="cfg-field__help">${d}</div>`:h}
      <div class="cfg-number">
        <button
          type="button"
          class="cfg-number__btn"
          ?disabled=${r}
          @click=${()=>a(i,v-1)}
        >−</button>
        <input
          type="number"
          class="cfg-number__input"
          .value=${u==null?"":String(u)}
          ?disabled=${r}
          @input=${g=>{const $=g.target.value,w=$===""?void 0:Number($);a(i,w)}}
        />
        <button
          type="button"
          class="cfg-number__btn"
          ?disabled=${r}
          @click=${()=>a(i,v+1)}
        >+</button>
      </div>
    </div>
  `}function Pr(e){const{schema:t,value:n,path:i,hints:s,disabled:r,options:a,onPatch:l}=e,c=e.showLabel??!0,p=ie(i,s),d=p?.label??t.title??we(String(i.at(-1))),u=p?.help??t.description,v=n??t.default,g=a.findIndex(w=>w===v||String(w)===String(v)),$="__unset__";return o`
    <div class="cfg-field">
      ${c?o`<label class="cfg-field__label">${d}</label>`:h}
      ${u?o`<div class="cfg-field__help">${u}</div>`:h}
      <select
        class="cfg-select"
        ?disabled=${r}
        .value=${g>=0?String(g):$}
        @change=${w=>{const k=w.target.value;l(i,k===$?void 0:a[Number(k)])}}
      >
        <option value=${$}>请选择...</option>
        ${a.map((w,k)=>o`
          <option value=${String(k)}>${String(w)}</option>
        `)}
      </select>
    </div>
  `}function Up(e){const{schema:t,value:n,path:i,hints:s,unsupported:r,disabled:a,onPatch:l,onDiscoverModels:c}=e;e.showLabel;const p=ie(i,s),d=p?.label??t.title??String(i.at(-1)??""),u=d==="undefined"||!d?we(String(i.at(-1)??"")):d,v=p?.help??t.description,$=i.length===3&&i[0]==="models"&&i[1]==="providers"?String(i[2]):null,w=n??t.default,k=w&&typeof w=="object"&&!Array.isArray(w)?w:{},E=t.properties??{},N=Object.entries(E).sort((O,te)=>{const He=ie([...i,O[0]],s)?.order??0,Ot=ie([...i,te[0]],s)?.order??0;return He!==Ot?He-Ot:O[0].localeCompare(te[0])}),I=new Set(Object.keys(E)),L=t.additionalProperties,A=!!L&&typeof L=="object";return i.length===1?o`
      <div class="cfg-fields">
        ${N.map(([O,te])=>$e({schema:te,value:k[O],path:[...i,O],hints:s,unsupported:r,disabled:a,onPatch:l,onDiscoverModels:c}))}
        ${A?Or({schema:L,value:k,path:i,hints:s,unsupported:r,disabled:a,reservedKeys:I,onPatch:l}):h}
      </div>
    `:o`
    <details class="cfg-object" open>
      <summary class="cfg-object__header">
        <span class="cfg-object__title">${u}</span>
        ${$?o`
          <button 
            type="button" 
            class="cfg-btn cfg-btn--sm cfg-btn--ghost"
            style="margin-left: auto; margin-right: 8px; font-size: 11px; padding: 2px 6px;"
            ?disabled=${a}
            @click=${O=>{O.preventDefault(),O.stopPropagation(),c?.($)}}
          >
            <span style="display: inline-flex; width: 12px; height: 12px; margin-right: 4px;">${rt.refresh}</span>
            获取模型列表
          </button>
        `:h}
        <span class="cfg-object__chevron">${rt.chevronDown}</span>
      </summary>
      ${v?o`<div class="cfg-object__help">${v}</div>`:h}
      <div class="cfg-object__content">
        ${N.map(([O,te])=>$e({schema:te,value:k[O],path:[...i,O],hints:s,unsupported:r,disabled:a,onPatch:l,onDiscoverModels:c}))}
        ${A?Or({schema:L,value:k,path:i,hints:s,unsupported:r,disabled:a,reservedKeys:I,onPatch:l}):h}
      </div>
    </details>
  `}function Kp(e){const{schema:t,value:n,path:i,hints:s,unsupported:r,disabled:a,onPatch:l}=e,c=e.showLabel??!0,p=ie(i,s),d=p?.label??t.title??we(String(i.at(-1))),u=p?.help??t.description,v=Array.isArray(t.items)?t.items[0]:t.items;if(!v)return o`
      <div class="cfg-field cfg-field--error">
        <div class="cfg-field__label">${d}</div>
        <div class="cfg-field__error">不支持的数组架构。请使用原生模式 (Raw)。</div>
      </div>
    `;const g=Array.isArray(n)?n:Array.isArray(t.default)?t.default:[];return o`
    <div class="cfg-array">
      <div class="cfg-array__header">
        ${c?o`<span class="cfg-array__label">${d}</span>`:h}
        <span class="cfg-array__count">${g.length} 个条目</span>
        <button
          type="button"
          class="cfg-array__add"
          ?disabled=${a}
          @click=${()=>{const $=[...g,fo(v)];l(i,$)}}
        >
          <span class="cfg-array__add-icon">${rt.plus}</span>
          添加
        </button>
      </div>
      ${u?o`<div class="cfg-array__help">${u}</div>`:h}

      ${g.length===0?o`
        <div class="cfg-array__empty">
          暂无项目。点击“添加”创建一个。
        </div>
      `:o`
        <div class="cfg-array__items">
          ${g.map(($,w)=>o`
            <div class="cfg-array__item">
              <div class="cfg-array__item-header">
                <span class="cfg-array__item-index">#${w+1}</span>
                <button
                  type="button"
                  class="cfg-array__item-remove"
                  title="删除项目"
                  ?disabled=${a}
                  @click=${()=>{const k=[...g];k.splice(w,1),l(i,k)}}
                >
                  ${rt.trash}
                </button>
              </div>
              <div class="cfg-array__item-content">
                ${$e({schema:v,value:$,path:[...i,w],hints:s,unsupported:r,disabled:a,showLabel:!1,onPatch:l,onDiscoverModels})}
              </div>
            </div>
          `)}
        </div>
      `}
    </div>
  `}function Or(e){const{schema:t,value:n,path:i,hints:s,unsupported:r,disabled:a,reservedKeys:l,onPatch:c}=e,p=Bp(t),d=Object.entries(n??{}).filter(([u])=>!l.has(u));return o`
    <div class="cfg-map">
      <div class="cfg-map__header">
        <span class="cfg-map__label">自定义条目</span>
        <button
          type="button"
          class="cfg-map__add"
          ?disabled=${a}
          @click=${()=>{const u={...n??{}};let v=1,g=`custom-${v}`;for(;g in u;)v+=1,g=`custom-${v}`;u[g]=p?{}:fo(t),c(i,u)}}
        >
          <span class="cfg-map__add-icon">${rt.plus}</span>
          添加条目
        </button>
      </div>

      ${d.length===0?o`
        <div class="cfg-map__empty">暂无自定义条目。</div>
      `:o`
        <div class="cfg-map__items">
          ${d.map(([u,v])=>{const g=[...i,u],$=Fp(v);return o`
              <div class="cfg-map__item">
                <div class="cfg-map__item-key">
                  <input
                    type="text"
                    class="cfg-input cfg-input--sm"
                    placeholder="键 (Key)"
                    .value=${u}
                    ?disabled=${a}
                    @change=${w=>{const k=w.target.value.trim();if(!k||k===u)return;const E={...n??{}};k in E||(E[k]=E[u],delete E[u],c(i,E))}}
                  />
                </div>
                <div class="cfg-map__item-value">
                  ${p?o`
                        <textarea
                          class="cfg-textarea cfg-textarea--sm"
                          placeholder="JSON 值"
                          rows="2"
                          .value=${$}
                          ?disabled=${a}
                          @change=${w=>{const k=w.target,E=k.value.trim();if(!E){c(g,void 0);return}try{c(g,JSON.parse(E))}catch{k.value=$}}}
                        ></textarea>
                      `:$e({schema:t,value:v,path:g,hints:s,unsupported:r,disabled:a,showLabel:!1,onPatch:c,onDiscoverModels})}
                </div>
                <button
                  type="button"
                  class="cfg-map__item-remove"
                  title="删除条目"
                  ?disabled=${a}
                  @click=${()=>{const w={...n??{}};delete w[u],c(i,w)}}
                >
                  ${rt.trash}
                </button>
              </div>
            `})}
        </div>
      `}
    </div>
  `}const Nr={env:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,update:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,agents:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path><circle cx="8" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle></svg>`,auth:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,channels:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,messages:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,commands:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,hooks:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,skills:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,tools:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,gateway:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,wizard:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 4V2"></path><path d="M15 16v-2"></path><path d="M8 9h2"></path><path d="M20 9h2"></path><path d="M17.8 11.8 19 13"></path><path d="M15 9h0"></path><path d="M17.8 6.2 19 5"></path><path d="m3 21 9-9"></path><path d="M12.2 6.2 11 5"></path></svg>`,meta:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`,logging:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,browser:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>`,ui:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,models:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,bindings:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,broadcast:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>`,audio:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,session:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,cron:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,web:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,discovery:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,canvasHost:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,talk:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,plugins:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v6"></path><path d="m4.93 10.93 4.24 4.24"></path><path d="M2 12h6"></path><path d="m4.93 13.07 4.24-4.24"></path><path d="M12 22v-6"></path><path d="m19.07 13.07-4.24-4.24"></path><path d="M22 12h-6"></path><path d="m19.07 10.93-4.24 4.24"></path></svg>`,default:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`},ps={env:{label:"环境",description:"传递给网关进程的环境变量"},update:{label:"更新",description:"自动更新设置与发布渠道"},agents:{label:"智能体",description:"智能体配置、模型与身份"},auth:{label:"身份验证",description:"API 密钥与身份验证配置文件"},channels:{label:"渠道",description:"消息渠道 (Telegram, Discord, Slack 等)"},messages:{label:"消息",description:"消息处理与路由设置"},commands:{label:"命令",description:"自定义斜杠命令"},hooks:{label:"钩子",description:"Webhook 与事件钩子"},skills:{label:"技能",description:"技能包与底层技术能力"},tools:{label:"工具",description:"工具配置 (浏览器、搜索等)"},gateway:{label:"网关",description:"网关服务器设置 (端口、身份验证、绑定)"},wizard:{label:"设置向导",description:"设置向导状态与历史记录"},meta:{label:"元数据",description:"网关元数据与版本信息"},logging:{label:"日志",description:"日志级别与输出配置"},browser:{label:"浏览器",description:"浏览器自动化设置"},ui:{label:"界面",description:"用户界面偏好设置"},models:{label:"模型",description:"AI 模型配置与供应商"},bindings:{label:"绑定",description:"按键绑定与快捷键"},broadcast:{label:"广播",description:"广播与通知设置"},audio:{label:"音频",description:"音频输入/输出设置"},session:{label:"会话",description:"会话管理与持久化"},cron:{label:"定时任务",description:"计划任务与自动化"},web:{label:"网页",description:"Web 服务器与 API 设置"},discovery:{label:"发现",description:"服务发现与网络设置"},canvasHost:{label:"画布宿主",description:"画布渲染与显示"},talk:{label:"语音",description:"语音与对话设置"},plugins:{label:"插件",description:"插件管理与扩展"}};function Dr(e){return Nr[e]??Nr.default}function Hp(e,t,n){if(!n)return!0;const i=n.toLowerCase(),s=ps[e];return e.toLowerCase().includes(i)||s&&(s.label.toLowerCase().includes(i)||s.description.toLowerCase().includes(i))?!0:wt(t,i)}function wt(e,t){if(e.title?.toLowerCase().includes(t)||e.description?.toLowerCase().includes(t)||e.enum?.some(i=>String(i).toLowerCase().includes(t)))return!0;if(e.properties){for(const[i,s]of Object.entries(e.properties))if(i.toLowerCase().includes(t)||wt(s,t))return!0}if(e.items){const i=Array.isArray(e.items)?e.items:[e.items];for(const s of i)if(s&&wt(s,t))return!0}if(e.additionalProperties&&typeof e.additionalProperties=="object"&&wt(e.additionalProperties,t))return!0;const n=e.anyOf??e.oneOf??e.allOf;if(n){for(const i of n)if(i&&wt(i,t))return!0}return!1}function Wp(e){if(!e.schema)return o`<div class="muted">架构定义不可用。</div>`;const t=e.schema,n=e.value??{};if(fe(t)!=="object"||!t.properties)return o`<div class="callout danger">不支持的架构。请使用原生模式 (Raw)。</div>`;const i=new Set(e.unsupportedPaths??[]),s=t.properties,r=e.searchQuery??"",a=e.activeSection,l=e.activeSubsection??null,p=Object.entries(s).sort((u,v)=>{const g=ie([u[0]],e.uiHints)?.order??50,$=ie([v[0]],e.uiHints)?.order??50;return g!==$?g-$:u[0].localeCompare(v[0])}).filter(([u,v])=>!(a&&u!==a||r&&!Hp(u,v,r)));let d=null;if(a&&l&&p.length===1){const u=p[0]?.[1];u&&fe(u)==="object"&&u.properties&&u.properties[l]&&(d={sectionKey:a,subsectionKey:l,schema:u.properties[l]})}return p.length===0?o`
      <div class="config-empty">
        <div class="config-empty__icon">${G.search}</div>
        <div class="config-empty__text">
          ${r?`没有匹配 “${r}” 的设置`:"此部分暂无设置"}
        </div>
      </div>
    `:o`
    <div class="config-form config-form--modern">
      ${d?(()=>{const{sectionKey:u,subsectionKey:v,schema:g}=d,$=ie([u,v],e.uiHints),w=$?.label??g.title??we(v),k=$?.help??g.description??"",E=n[u],C=E&&typeof E=="object"?E[v]:void 0,N=`config-section-${u}-${v}`;return o`
              <section class="config-section-card" id=${N}>
                <div class="config-section-card__header">
                  <span class="config-section-card__icon">${Dr(u)}</span>
                  <div class="config-section-card__titles">
                    <h3 class="config-section-card__title">${w}</h3>
                    ${k?o`<p class="config-section-card__desc">${k}</p>`:h}
                  </div>
                </div>
                <div class="config-section-card__content">
                  ${$e({schema:g,value:C,path:[u,v],hints:e.uiHints,unsupported:i,disabled:e.disabled??!1,showLabel:!1,onPatch:e.onPatch,onDiscoverModels:e.onDiscoverModels})}
                </div>
              </section>
            `})():p.map(([u,v])=>{const g=ps[u]??{label:u.charAt(0).toUpperCase()+u.slice(1),description:v.description??""};return o`
              <section class="config-section-card" id="config-section-${u}">
                <div class="config-section-card__header">
                  <span class="config-section-card__icon">${Dr(u)}</span>
                  <div class="config-section-card__titles">
                    <h3 class="config-section-card__title">${g.label}</h3>
                    ${g.description?o`<p class="config-section-card__desc">${g.description}</p>`:h}
                  </div>
                </div>
                <div class="config-section-card__content">
                  ${$e({schema:v,value:n[u],path:[u],hints:e.uiHints,unsupported:i,disabled:e.disabled??!1,showLabel:!1,onPatch:e.onPatch,onDiscoverModels:e.onDiscoverModels})}
                </div>
              </section>
            `})}
    </div>
  `}const jp=new Set(["title","description","default","nullable"]);function qp(e){return Object.keys(e??{}).filter(n=>!jp.has(n)).length===0}function ho(e){const t=e.filter(s=>s!=null),n=t.length!==e.length,i=[];for(const s of t)i.some(r=>Object.is(r,s))||i.push(s);return{enumValues:i,nullable:n}}function go(e){return!e||typeof e!="object"?{schema:null,unsupportedPaths:["<root>"]}:At(e,[])}function At(e,t){const n=new Set,i={...e},s=Pt(t)||"<root>";if(e.anyOf||e.oneOf||e.allOf){const l=Vp(e,t);return l||{schema:e,unsupportedPaths:[s]}}const r=Array.isArray(e.type)&&e.type.includes("null"),a=fe(e)??(e.properties||e.additionalProperties?"object":void 0);if(i.type=a??e.type,i.nullable=r||e.nullable,i.enum){const{enumValues:l,nullable:c}=ho(i.enum);i.enum=l,c&&(i.nullable=!0),l.length===0&&n.add(s)}if(a==="object"){const l=e.properties??{},c={};for(const[p,d]of Object.entries(l)){const u=At(d,[...t,p]);u.schema&&(c[p]=u.schema);for(const v of u.unsupportedPaths)n.add(v)}if(i.properties=c,e.additionalProperties===!0)i.additionalProperties=!0;else if(e.additionalProperties===!1)i.additionalProperties=!1;else if(e.additionalProperties&&typeof e.additionalProperties=="object"&&!qp(e.additionalProperties)){const p=At(e.additionalProperties,[...t,"*"]);i.additionalProperties=p.schema??e.additionalProperties}}else if(a==="array"){const l=Array.isArray(e.items)?e.items[0]:e.items;if(!l)n.add(s);else{const c=At(l,[...t,"*"]);i.items=c.schema??l}}else a!=="string"&&a!=="number"&&a!=="integer"&&a!=="boolean"&&!i.enum&&n.add(s);return{schema:i,unsupportedPaths:Array.from(n)}}function Vp(e,t){if(e.allOf)return null;const n=e.anyOf??e.oneOf;if(!n)return null;const i=[],s=[];let r=!1;for(const l of n){if(!l||typeof l!="object")return null;if(Array.isArray(l.enum)){const{enumValues:c,nullable:p}=ho(l.enum);i.push(...c),p&&(r=!0);continue}if("const"in l){if(l.const==null){r=!0;continue}i.push(l.const);continue}if(fe(l)==="null"){r=!0;continue}s.push(l)}if(i.length>0&&s.length===0){const l=[];for(const c of i)l.some(p=>Object.is(p,c))||l.push(c);return{schema:{...e,enum:l,nullable:r,anyOf:void 0,oneOf:void 0,allOf:void 0},unsupportedPaths:[]}}if(s.length===1){const l=At(s[0],t);return l.schema&&(l.schema.nullable=r||l.schema.nullable),l}const a=["string","number","integer","boolean"];return s.length>0&&i.length===0&&s.every(l=>l.type&&a.includes(String(l.type)))?{schema:{...e,nullable:r},unsupportedPaths:[]}:null}const _i={all:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,env:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,update:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,agents:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path><circle cx="8" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle></svg>`,auth:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,channels:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,messages:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,commands:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,hooks:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,skills:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,tools:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,gateway:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,wizard:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 4V2"></path><path d="M15 16v-2"></path><path d="M8 9h2"></path><path d="M20 9h2"></path><path d="M17.8 11.8 19 13"></path><path d="M15 9h0"></path><path d="M17.8 6.2 19 5"></path><path d="m3 21 9-9"></path><path d="M12.2 6.2 11 5"></path></svg>`,meta:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`,logging:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,browser:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>`,ui:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,models:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,bindings:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,broadcast:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path></svg>`,audio:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,session:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,cron:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,web:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,discovery:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,canvasHost:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,talk:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`,plugins:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6"></path><path d="m4.93 10.93 4.24 4.24"></path><path d="M2 12h6"></path><path d="m4.93 13.07 4.24-4.24"></path><path d="M12 22v-6"></path><path d="m19.07 13.07-4.24-4.24"></path><path d="M22 12h-6"></path><path d="m19.07 10.93-4.24 4.24"></path></svg>`,default:o`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`},Br=[{key:"models",label:"大模型"},{key:"auth",label:"身份验证"},{key:"agents",label:"智能体"},{key:"channels",label:"渠道"},{key:"env",label:"环境"},{key:"gateway",label:"网关"},{key:"skills",label:"技能"},{key:"tools",label:"工具"},{key:"messages",label:"消息"},{key:"commands",label:"命令"},{key:"hooks",label:"钩子"},{key:"update",label:"更新"},{key:"wizard",label:"设置向导"},{key:"ui",label:"界面"},{key:"logging",label:"日志"}],Fr="__all__";function zr(e){return _i[e]??_i.default}function Gp(e,t){const n=ps[e];return n||{label:t?.title??we(e),description:t?.description??""}}function Qp(e){const{key:t,schema:n,uiHints:i}=e;if(!n||fe(n)!=="object"||!n.properties)return[];const s=Object.entries(n.properties).map(([r,a])=>{const l=ie([t,r],i),c=l?.label??a.title??we(r),p=l?.help??a.description??"",d=l?.order??50;return{key:r,label:c,description:p,order:d}});return s.sort((r,a)=>r.order!==a.order?r.order-a.order:r.key.localeCompare(a.key)),s}function Zp(e,t){if(!e||!t)return[];const n=[];function i(s,r,a){if(s===r)return;if(typeof s!=typeof r){n.push({path:a,from:s,to:r});return}if(typeof s!="object"||s===null||r===null){s!==r&&n.push({path:a,from:s,to:r});return}if(Array.isArray(s)&&Array.isArray(r)){JSON.stringify(s)!==JSON.stringify(r)&&n.push({path:a,from:s,to:r});return}const l=s,c=r,p=new Set([...Object.keys(l),...Object.keys(c)]);for(const d of p)i(l[d],c[d],a?`${a}.${d}`:d)}return i(e,t,""),n}function Ur(e,t=40){let n;try{n=JSON.stringify(e)??String(e)}catch{n=String(e)}return n.length<=t?n:n.slice(0,t-3)+"..."}function Yp(e){const t=e.valid==null?"unknown":e.valid?"valid":"invalid",n=go(e.schema),i=n.schema?n.unsupportedPaths.length>0:!1,s=n.schema?.properties??{},r=Br.filter(A=>A.key in s),a=new Set(Br.map(A=>A.key)),l=Object.keys(s).filter(A=>!a.has(A)).map(A=>({key:A,label:A.charAt(0).toUpperCase()+A.slice(1)})),c=[...r,...l],p=e.activeSection&&n.schema&&fe(n.schema)==="object"?n.schema.properties?.[e.activeSection]:void 0,d=e.activeSection?Gp(e.activeSection,p):null,u=e.activeSection?Qp({key:e.activeSection,schema:p,uiHints:e.uiHints}):[],v=e.formMode==="form"&&!!e.activeSection&&u.length>0,g=e.activeSubsection===Fr,$=e.searchQuery||g?null:e.activeSubsection??u[0]?.key??null,w=e.formMode==="form"?Zp(e.originalValue,e.formValue):[],k=e.formMode==="raw"&&e.raw!==e.originalRaw,E=e.formMode==="form"?w.length>0:k,C=!!e.formValue&&!e.loading&&!!n.schema,N=e.connected&&!e.saving&&E&&(e.formMode==="raw"?!0:C),I=e.connected&&!e.applying&&!e.updating&&E&&(e.formMode==="raw"?!0:C),L=e.connected&&!e.applying&&!e.updating;return o`
    <div class="config-layout">
      <!-- Sidebar -->
      <aside class="config-sidebar">
        <div class="config-sidebar__header">
          <div class="config-sidebar__title">设置</div>
          <span class="pill pill--sm ${t==="valid"?"pill--ok":t==="invalid"?"pill--danger":""}">${t==="valid"?"有效":t==="invalid"?"无效":"未知"}</span>
        </div>

        <!-- Search -->
        <div class="config-search">
          <svg class="config-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            class="config-search__input"
            placeholder="搜索设置..."
            .value=${e.searchQuery}
            @input=${A=>e.onSearchChange(A.target.value)}
          />
          ${e.searchQuery?o`
            <button
              class="config-search__clear"
              @click=${()=>e.onSearchChange("")}
            >×</button>
          `:h}
        </div>

        <!-- Section nav -->
        <nav class="config-nav">
          <button
            class="config-nav__item ${e.activeSection===null?"active":""}"
            @click=${()=>e.onSectionChange(null)}
          >
            <span class="config-nav__icon">${_i.all}</span>
            <span class="config-nav__label">所有设置</span>
          </button>
          ${c.map(A=>o`
            <button
              class="config-nav__item ${e.activeSection===A.key?"active":""}"
              @click=${()=>e.onSectionChange(A.key)}
            >
              <span class="config-nav__icon">${zr(A.key)}</span>
              <span class="config-nav__label">${A.label}</span>
            </button>
          `)}
        </nav>

        <!-- Mode toggle at bottom -->
        <div class="config-sidebar__footer">
          <div class="config-mode-toggle">
            <button
              class="config-mode-toggle__btn ${e.formMode==="form"?"active":""}"
              ?disabled=${e.schemaLoading||!e.schema}
              @click=${()=>e.onFormModeChange("form")}
            >
              表单
            </button>
            <button
              class="config-mode-toggle__btn ${e.formMode==="raw"?"active":""}"
              @click=${()=>e.onFormModeChange("raw")}
            >
              原文 (JSON5)
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="config-main">
        <!-- Action bar -->
        <div class="config-actions">
          <div class="config-actions__left">
            ${E?o`
              <span class="config-changes-badge">${e.formMode==="raw"?"未保存的更改":`有 ${w.length} 项更改未保存`}</span>
            `:o`
              <span class="config-status muted">无更改</span>
            `}
          </div>
          <div class="config-actions__right">
            <button class="btn btn--sm" ?disabled=${e.loading} @click=${e.onReload}>
              ${e.loading?"正在加载...":"重新加载"}
            </button>
            <button
              class="btn btn--sm primary"
              ?disabled=${!N}
              @click=${e.onSave}
            >
              ${e.saving?"正在保存...":"保存"}
            </button>
            <button
              class="btn btn--sm"
              ?disabled=${!I}
              @click=${e.onApply}
            >
              ${e.applying?"正在应用...":"应用"}
            </button>
            <button
              class="btn btn--sm"
              ?disabled=${!L}
              @click=${e.onUpdate}
            >
              ${e.updating?"正在更新...":"更新"}
            </button>
          </div>
        </div>

        <!-- Diff panel (form mode only - raw mode doesn't have granular diff) -->
        ${E&&e.formMode==="form"?o`
          <details class="config-diff">
            <summary class="config-diff__summary">
              <span>查看 ${w.length} 项待处理的更改</span>
              <svg class="config-diff__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </summary>
            <div class="config-diff__content">
              ${w.map(A=>o`
                <div class="config-diff__item">
                  <div class="config-diff__path">${A.path}</div>
                  <div class="config-diff__values">
                    <span class="config-diff__from">${Ur(A.from)}</span>
                    <span class="config-diff__arrow">→</span>
                    <span class="config-diff__to">${Ur(A.to)}</span>
                  </div>
                </div>
              `)}
            </div>
          </details>
        `:h}

        ${d&&e.formMode==="form"?o`
              <div class="config-section-hero">
                <div class="config-section-hero__icon">${zr(e.activeSection??"")}</div>
                <div class="config-section-hero__text">
                  <div class="config-section-hero__title">${d.label}</div>
                  ${d.description?o`<div class="config-section-hero__desc">${d.description}</div>`:h}
                </div>
              </div>
            `:h}

        ${v?o`
              <div class="config-subnav">
                <button
                  class="config-subnav__item ${$===null?"active":""}"
                  @click=${()=>e.onSubsectionChange(Fr)}
                >
                  全部
                </button>
                ${u.map(A=>o`
                    <button
                      class="config-subnav__item ${$===A.key?"active":""}"
                      title=${A.description||A.label}
                      @click=${()=>e.onSubsectionChange(A.key)}
                    >
                      ${A.label}
                    </button>
                  `)}
              </div>
            `:h}

        <!-- Form content -->
        <div class="config-content">
          ${e.formMode==="form"?o`
                ${e.schemaLoading?o`<div class="config-loading">
                      <div class="config-loading__spinner"></div>
                      <span>正在加载架构 (Schema)...</span>
                    </div>`:Wp({schema:n.schema,uiHints:e.uiHints,value:e.formValue,disabled:e.loading||!e.formValue,unsupportedPaths:n.unsupportedPaths,onPatch:e.onFormPatch,onDiscoverModels:e.onDiscoverModels,searchQuery:e.searchQuery,activeSection:e.activeSection,activeSubsection:$})}
                ${i?o`<div class="callout danger" style="margin-top: 12px;">
                      表单视图无法安全编辑某些字段。
                      请使用“原文”模式以避免丢失配置项。
                    </div>`:h}
              `:o`
                <label class="field config-raw-field">
                  <span>JSON5 源码</span>
                  <textarea
                    .value=${e.raw}
                    @input=${A=>e.onRawChange(A.target.value)}
                  ></textarea>
                </label>
              `}
        </div>

        ${e.issues.length>0?o`<div class="callout danger" style="margin-top: 12px;">
              <pre class="code-block">${JSON.stringify(e.issues,null,2)}</pre>
            </div>`:h}
      </main>
    </div>
  `}function Xp(e){if(!e&&e!==0)return"无";const t=Math.round(e/1e3);if(t<60)return`${t}s`;const n=Math.round(t/60);return n<60?`${n}m`:`${Math.round(n/60)}h`}function Jp(e,t){const n=t.snapshot,i=n?.channels;if(!n||!i)return!1;const s=i[e],r=typeof s?.configured=="boolean"&&s.configured,a=typeof s?.running=="boolean"&&s.running,l=typeof s?.connected=="boolean"&&s.connected,p=(n.channelAccounts?.[e]??[]).some(d=>d.configured||d.running||d.connected);return r||a||l||p}function ef(e,t){return t?.[e]?.length??0}function vo(e,t){const n=ef(e,t);return n<2?h:o`<div class="account-count">账号 (${n})</div>`}function tf(e,t){let n=e;for(const i of t){if(!n)return null;const s=fe(n);if(s==="object"){const r=n.properties??{};if(typeof i=="string"&&r[i]){n=r[i];continue}const a=n.additionalProperties;if(typeof i=="string"&&a&&typeof a=="object"){n=a;continue}return null}if(s==="array"){if(typeof i!="number")return null;n=(Array.isArray(n.items)?n.items[0]:n.items)??null;continue}return null}return n}function nf(e,t){const i=(e.channels??{})[t],s=e[t];return(i&&typeof i=="object"?i:null)??(s&&typeof s=="object"?s:null)??{}}function sf(e){const t=go(e.schema),n=t.schema;if(!n)return o`<div class="callout danger">架构不可用。请使用原始数据。</div>`;const i=tf(n,["channels",e.channelId]);if(!i)return o`<div class="callout danger">渠道配置架构不可用。</div>`;const s=e.configValue??{},r=nf(s,e.channelId);return o`
    <div class="config-form">
      ${$e({schema:i,value:r,path:["channels",e.channelId],hints:e.uiHints,unsupported:new Set(t.unsupportedPaths),disabled:e.disabled,showLabel:!1,onPatch:e.onPatch})}
    </div>
  `}function xe(e){const{channelId:t,props:n}=e,i=n.configSaving||n.configSchemaLoading;return o`
    <div style="margin-top: 16px;">
      ${n.configSchemaLoading?o`<div class="muted">正在加载配置架构...</div>`:sf({channelId:t,configValue:n.configForm,schema:n.configSchema,uiHints:n.configUiHints,disabled:i,onPatch:n.onConfigPatch})}
      <div class="row" style="margin-top: 12px;">
        <button
          class="btn primary"
          ?disabled=${i||!n.configFormDirty}
          @click=${()=>n.onConfigSave()}
        >
          ${n.configSaving?"正在保存...":"保存"}
        </button>
        <button
          class="btn"
          ?disabled=${i}
          @click=${()=>n.onConfigReload()}
        >
          重载
        </button>
      </div>
    </div>
  `}function rf(e){const{props:t,discord:n,accountCountLabel:i}=e;return o`
    <div class="card">
      <div class="card-title">Discord</div>
      <div class="card-sub">机器人状态与渠道配置。</div>
      ${i}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">已配置</span>
          <span>${n?.configured?"是":"否"}</span>
        </div>
        <div>
          <span class="label">运行中</span>
          <span>${n?.running?"是":"否"}</span>
        </div>
        <div>
          <span class="label">上次启动</span>
          <span>${n?.lastStartAt?D(n.lastStartAt):"无"}</span>
        </div>
        <div>
          <span class="label">上次探测</span>
          <span>${n?.lastProbeAt?D(n.lastProbeAt):"无"}</span>
        </div>
      </div>

      ${n?.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:h}

      ${n?.probe?o`<div class="callout" style="margin-top: 12px;">
            探测 ${n.probe.ok?"成功":"失败"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:h}

      ${xe({channelId:"discord",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          刷新探测
        </button>
      </div>
    </div>
  `}function af(e){const{props:t,googleChat:n,accountCountLabel:i}=e;return o`
    <div class="card">
      <div class="card-title">Google Chat</div>
      <div class="card-sub">Chat API Webhook 状态与渠道配置。</div>
      ${i}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">已配置</span>
          <span>${n?n.configured?"是":"否":"无"}</span>
        </div>
        <div>
          <span class="label">运行中</span>
          <span>${n?n.running?"是":"否":"无"}</span>
        </div>
        <div>
          <span class="label">凭据</span>
          <span>${n?.credentialSource??"无"}</span>
        </div>
        <div>
          <span class="label">受众 (Audience)</span>
          <span>
            ${n?.audienceType?`${n.audienceType}${n.audience?` · ${n.audience}`:""}`:"无"}
          </span>
        </div>
        <div>
          <span class="label">上次启动</span>
          <span>${n?.lastStartAt?D(n.lastStartAt):"无"}</span>
        </div>
        <div>
          <span class="label">上次探测</span>
          <span>${n?.lastProbeAt?D(n.lastProbeAt):"无"}</span>
        </div>
      </div>

      ${n?.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:h}

      ${n?.probe?o`<div class="callout" style="margin-top: 12px;">
            探测 ${n.probe.ok?"成功":"失败"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:h}

      ${xe({channelId:"googlechat",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          刷新探测
        </button>
      </div>
    </div>
  `}function of(e){const{props:t,imessage:n,accountCountLabel:i}=e;return o`
    <div class="card">
      <div class="card-title">iMessage</div>
      <div class="card-sub">macOS 桥接状态与渠道配置。</div>
      ${i}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">已配置</span>
          <span>${n?.configured?"是":"否"}</span>
        </div>
        <div>
          <span class="label">运行中</span>
          <span>${n?.running?"是":"否"}</span>
        </div>
        <div>
          <span class="label">上次启动</span>
          <span>${n?.lastStartAt?D(n.lastStartAt):"无"}</span>
        </div>
        <div>
          <span class="label">上次探测</span>
          <span>${n?.lastProbeAt?D(n.lastProbeAt):"无"}</span>
        </div>
      </div>

      ${n?.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:h}

      ${n?.probe?o`<div class="callout" style="margin-top: 12px;">
            探测 ${n.probe.ok?"成功":"失败"} ·
            ${n.probe.error??""}
          </div>`:h}

      ${xe({channelId:"imessage",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          刷新探测
        </button>
      </div>
    </div>
  `}function lf(e){const{values:t,original:n}=e;return t.name!==n.name||t.displayName!==n.displayName||t.about!==n.about||t.picture!==n.picture||t.banner!==n.banner||t.website!==n.website||t.nip05!==n.nip05||t.lud16!==n.lud16}function cf(e){const{state:t,callbacks:n,accountId:i}=e,s=lf(t),r=(l,c,p={})=>{const{type:d="text",placeholder:u,maxLength:v,help:g}=p,$=t.values[l]??"",w=t.fieldErrors[l],k=`nostr-profile-${l}`;return d==="textarea"?o`
        <div class="form-field" style="margin-bottom: 12px;">
          <label for="${k}" style="display: block; margin-bottom: 4px; font-weight: 500;">
            ${c}
          </label>
          <textarea
            id="${k}"
            .value=${$}
            placeholder=${u??""}
            maxlength=${v??2e3}
            rows="3"
            style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; resize: vertical; font-family: inherit;"
            @input=${E=>{const C=E.target;n.onFieldChange(l,C.value)}}
            ?disabled=${t.saving}
          ></textarea>
          ${g?o`<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${g}</div>`:h}
          ${w?o`<div style="font-size: 12px; color: var(--danger-color); margin-top: 2px;">${w}</div>`:h}
        </div>
      `:o`
      <div class="form-field" style="margin-bottom: 12px;">
        <label for="${k}" style="display: block; margin-bottom: 4px; font-weight: 500;">
          ${c}
        </label>
        <input
          id="${k}"
          type=${d}
          .value=${$}
          placeholder=${u??""}
          maxlength=${v??256}
          style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;"
          @input=${E=>{const C=E.target;n.onFieldChange(l,C.value)}}
          ?disabled=${t.saving}
        />
        ${g?o`<div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${g}</div>`:h}
        ${w?o`<div style="font-size: 12px; color: var(--danger-color); margin-top: 2px;">${w}</div>`:h}
      </div>
    `},a=()=>{const l=t.values.picture;return l?o`
      <div style="margin-bottom: 12px;">
        <img
          src=${l}
          alt="头像预览"
          style="max-width: 80px; max-height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);"
          @error=${c=>{const p=c.target;p.style.display="none"}}
          @load=${c=>{const p=c.target;p.style.display="block"}}
        />
      </div>
    `:h};return o`
    <div class="nostr-profile-form" style="padding: 16px; background: var(--bg-secondary); border-radius: 8px; margin-top: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 16px;">编辑资料</div>
        <div style="font-size: 12px; color: var(--text-muted);">账户: ${i}</div>
      </div>

      ${t.error?o`<div class="callout danger" style="margin-bottom: 12px;">${t.error}</div>`:h}

      ${t.success?o`<div class="callout success" style="margin-bottom: 12px;">${t.success}</div>`:h}

      ${a()}

      ${r("name","用户名",{placeholder:"satoshi",maxLength:256,help:"短用户名（例如：satoshi）"})}

      ${r("displayName","显示名称",{placeholder:"Satoshi Nakamoto",maxLength:256,help:"您的完整显示名称"})}

      ${r("about","简介",{type:"textarea",placeholder:"向大家介绍一下您自己...",maxLength:2e3,help:"简短的个人履历或描述"})}

      ${r("picture","头像 URL",{type:"url",placeholder:"https://example.com/avatar.jpg",help:"个人头像的 HTTPS 链接"})}

      ${t.showAdvanced?o`
            <div style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 12px;">
              <div style="font-weight: 500; margin-bottom: 12px; color: var(--text-muted);">高级设置</div>

              ${r("banner","横幅 URL",{type:"url",placeholder:"https://example.com/banner.jpg",help:"横幅图片的 HTTPS 链接"})}

              ${r("website","网站",{type:"url",placeholder:"https://example.com",help:"您的个人网站"})}

              ${r("nip05","NIP-05 标识符",{placeholder:"you@example.com",help:"可验证的标识符（例如：you@domain.com）"})}

              ${r("lud16","闪电网络地址",{placeholder:"you@getalby.com",help:"用于接收打赏的闪电网络地址（LUD-16）"})}
            </div>
          `:h}

      <div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
        <button
          class="btn primary"
          @click=${n.onSave}
          ?disabled=${t.saving||!s}
        >
          ${t.saving?"正在保存...":"保存并发布"}
        </button>

        <button
          class="btn"
          @click=${n.onImport}
          ?disabled=${t.importing||t.saving}
        >
          ${t.importing?"正在导入...":"从中继导入"}
        </button>

        <button
          class="btn"
          @click=${n.onToggleAdvanced}
        >
          ${t.showAdvanced?"隐藏高级设置":"显示高级设置"}
        </button>

        <button
          class="btn"
          @click=${n.onCancel}
          ?disabled=${t.saving}
        >
          取消
        </button>
      </div>

      ${s?o`<div style="font-size: 12px; color: var(--warning-color); margin-top: 8px;">
            您有未保存的更改
          </div>`:h}
    </div>
  `}function df(e){const t={name:e?.name??"",displayName:e?.displayName??"",about:e?.about??"",picture:e?.picture??"",banner:e?.banner??"",website:e?.website??"",nip05:e?.nip05??"",lud16:e?.lud16??""};return{values:t,original:{...t},saving:!1,importing:!1,error:null,success:null,fieldErrors:{},showAdvanced:!!(e?.banner||e?.website||e?.nip05||e?.lud16)}}function Kr(e){return e?e.length<=20?e:`${e.slice(0,8)}...${e.slice(-8)}`:"无"}function uf(e){const{props:t,nostr:n,nostrAccounts:i,accountCountLabel:s,profileFormState:r,profileFormCallbacks:a,onEditProfile:l}=e,c=i[0],p=n?.configured??c?.configured??!1,d=n?.running??c?.running??!1,u=n?.publicKey??c?.publicKey,v=n?.lastStartAt??c?.lastStartAt??null,g=n?.lastError??c?.lastError??null,$=i.length>1,w=r!=null,k=C=>{const N=C.publicKey,I=C.profile,L=I?.displayName??I?.name??C.name??C.accountId;return o`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">${L}</div>
          <div class="account-card-id">${C.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">运行中</span>
            <span>${C.running?"是":"否"}</span>
          </div>
          <div>
            <span class="label">已配置</span>
            <span>${C.configured?"是":"否"}</span>
          </div>
          <div>
            <span class="label">公钥</span>
            <span class="monospace" title="${N??""}">${Kr(N)}</span>
          </div>
          <div>
            <span class="label">上次呼入</span>
            <span>${C.lastInboundAt?D(C.lastInboundAt):"无"}</span>
          </div>
          ${C.lastError?o`
                <div class="account-card-error">${C.lastError}</div>
              `:h}
        </div>
      </div>
    `},E=()=>{if(w&&a)return cf({state:r,callbacks:a,accountId:i[0]?.accountId??"default"});const C=c?.profile??n?.profile,{name:N,displayName:I,about:L,picture:A,nip05:O}=C??{},te=N||I||L||A||O;return o`
      <div style="margin-top: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-weight: 500;">个人资料</div>
          ${p?o`
                <button
                  class="btn btn-sm"
                  @click=${l}
                  style="font-size: 12px; padding: 4px 8px;"
                >
                  编辑资料
                </button>
              `:h}
        </div>
        ${te?o`
              <div class="status-list">
                ${A?o`
                      <div style="margin-bottom: 8px;">
                        <img
                          src=${A}
                          alt="头像"
                          style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);"
                          @error=${He=>{He.target.style.display="none"}}
                        />
                      </div>
                    `:h}
                ${N?o`<div><span class="label">用户名</span><span>${N}</span></div>`:h}
                ${I?o`<div><span class="label">显示名称</span><span>${I}</span></div>`:h}
                ${L?o`<div><span class="label">关于</span><span style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">${L}</span></div>`:h}
                ${O?o`<div><span class="label">NIP-05</span><span>${O}</span></div>`:h}
              </div>
            `:o`
              <div style="color: var(--text-muted); font-size: 13px;">
                尚未设置个人资料。点击“编辑资料”添加您的姓名、简介和头像。
              </div>
            `}
      </div>
    `};return o`
    <div class="card">
      <div class="card-title">Nostr</div>
      <div class="card-sub">基于 Nostr 中继的去中心化私信 (NIP-04)。</div>
      ${s}

      ${$?o`
            <div class="account-card-list">
              ${i.map(C=>k(C))}
            </div>
          `:o`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">已配置</span>
                <span>${p?"是":"否"}</span>
              </div>
              <div>
                <span class="label">运行中</span>
                <span>${d?"是":"否"}</span>
              </div>
              <div>
                <span class="label">公钥</span>
                <span class="monospace" title="${u??""}"
                  >${Kr(u)}</span
                >
              </div>
              <div>
                <span class="label">上次启动</span>
                <span>${v?D(v):"无"}</span>
              </div>
            </div>
          `}

      ${g?o`<div class="callout danger" style="margin-top: 12px;">${g}</div>`:h}

      ${E()}

      ${xe({channelId:"nostr",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!1)}>刷新</button>
      </div>
    </div>
  `}function pf(e){const{props:t,signal:n,accountCountLabel:i}=e;return o`
    <div class="card">
      <div class="card-title">Signal</div>
      <div class="card-sub">signal-cli 状态与渠道配置。</div>
      ${i}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">已配置</span>
          <span>${n?.configured?"是":"否"}</span>
        </div>
        <div>
          <span class="label">运行中</span>
          <span>${n?.running?"是":"否"}</span>
        </div>
        <div>
          <span class="label">基础 URL</span>
          <span>${n?.baseUrl??"无"}</span>
        </div>
        <div>
          <span class="label">上次启动</span>
          <span>${n?.lastStartAt?D(n.lastStartAt):"无"}</span>
        </div>
        <div>
          <span class="label">上次探测</span>
          <span>${n?.lastProbeAt?D(n.lastProbeAt):"无"}</span>
        </div>
      </div>

      ${n?.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:h}

      ${n?.probe?o`<div class="callout" style="margin-top: 12px;">
            探测 ${n.probe.ok?"成功":"失败"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:h}

      ${xe({channelId:"signal",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          刷新探测
        </button>
      </div>
    </div>
  `}function ff(e){const{props:t,slack:n,accountCountLabel:i}=e;return o`
    <div class="card">
      <div class="card-title">Slack</div>
      <div class="card-sub">Socket 模式状态与渠道配置。</div>
      ${i}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">已配置</span>
          <span>${n?.configured?"是":"否"}</span>
        </div>
        <div>
          <span class="label">运行中</span>
          <span>${n?.running?"是":"否"}</span>
        </div>
        <div>
          <span class="label">上次启动</span>
          <span>${n?.lastStartAt?D(n.lastStartAt):"无"}</span>
        </div>
        <div>
          <span class="label">上次探测</span>
          <span>${n?.lastProbeAt?D(n.lastProbeAt):"无"}</span>
        </div>
      </div>

      ${n?.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:h}

      ${n?.probe?o`<div class="callout" style="margin-top: 12px;">
            探测 ${n.probe.ok?"成功":"失败"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:h}

      ${xe({channelId:"slack",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          刷新探测
        </button>
      </div>
    </div>
  `}function hf(e){const{props:t,telegram:n,telegramAccounts:i,accountCountLabel:s}=e,r=i.length>1,a=l=>{const p=l.probe?.bot?.username,d=l.name||l.accountId;return o`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">
            ${p?`@${p}`:d}
          </div>
          <div class="account-card-id">${l.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">运行中</span>
            <span>${l.running?"是":"否"}</span>
          </div>
          <div>
            <span class="label">已配置</span>
            <span>${l.configured?"是":"否"}</span>
          </div>
          <div>
            <span class="label">上次读入</span>
            <span>${l.lastInboundAt?D(l.lastInboundAt):"无"}</span>
          </div>
          ${l.lastError?o`
                <div class="account-card-error">
                  ${l.lastError}
                </div>
              `:h}
        </div>
      </div>
    `};return o`
    <div class="card">
      <div class="card-title">Telegram</div>
      <div class="card-sub">机器人状态与渠道配置。</div>
      ${s}

      ${r?o`
            <div class="account-card-list">
              ${i.map(l=>a(l))}
            </div>
          `:o`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">已配置</span>
                <span>${n?.configured?"是":"否"}</span>
              </div>
              <div>
                <span class="label">运行中</span>
                <span>${n?.running?"是":"否"}</span>
              </div>
              <div>
                <span class="label">模式</span>
                <span>${n?.mode??"未知"}</span>
              </div>
              <div>
                <span class="label">上次启动</span>
                <span>${n?.lastStartAt?D(n.lastStartAt):"无"}</span>
              </div>
              <div>
                <span class="label">上次探测</span>
                <span>${n?.lastProbeAt?D(n.lastProbeAt):"无"}</span>
              </div>
            </div>
          `}

      ${n?.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:h}

      ${n?.probe?o`<div class="callout" style="margin-top: 12px;">
            探测 ${n.probe.ok?"成功":"失败"} ·
            ${n.probe.status??""} ${n.probe.error??""}
          </div>`:h}

      ${xe({channelId:"telegram",props:t})}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          刷新探测
        </button>
      </div>
    </div>
  `}function gf(e){const{props:t,whatsapp:n,accountCountLabel:i}=e;return o`
    <div class="card">
      <div class="card-title">WhatsApp</div>
      <div class="card-sub">绑定 WhatsApp Web 并监控连接健康状况。</div>
      ${i}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">已配置</span>
          <span>${n?.configured?"是":"否"}</span>
        </div>
        <div>
          <span class="label">已绑定</span>
          <span>${n?.linked?"是":"否"}</span>
        </div>
        <div>
          <span class="label">运行中</span>
          <span>${n?.running?"是":"否"}</span>
        </div>
        <div>
          <span class="label">在线</span>
          <span>${n?.connected?"是":"否"}</span>
        </div>
        <div>
          <span class="label">上次连接</span>
          <span>
            ${n?.lastConnectedAt?D(n.lastConnectedAt):"无"}
          </span>
        </div>
        <div>
          <span class="label">上次消息</span>
          <span>
            ${n?.lastMessageAt?D(n.lastMessageAt):"无"}
          </span>
        </div>
        <div>
          <span class="label">授权时长</span>
          <span>
            ${n?.authAgeMs!=null?Xp(n.authAgeMs):"无"}
          </span>
        </div>
      </div>

      ${n?.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${n.lastError}
          </div>`:h}

      ${t.whatsappMessage?o`<div class="callout" style="margin-top: 12px;">
            ${t.whatsappMessage}
          </div>`:h}

      ${t.whatsappQrDataUrl?o`<div class="qr-wrap">
            <img src=${t.whatsappQrDataUrl} alt="WhatsApp QR" />
          </div>`:h}

      <div class="row" style="margin-top: 14px; flex-wrap: wrap;">
        <button
          class="btn primary"
          ?disabled=${t.whatsappBusy}
          @click=${()=>t.onWhatsAppStart(!1)}
        >
          ${t.whatsappBusy?"请稍候…":"显示二维码"}
        </button>
        <button
          class="btn"
          ?disabled=${t.whatsappBusy}
          @click=${()=>t.onWhatsAppStart(!0)}
        >
          重新绑定
        </button>
        <button
          class="btn"
          ?disabled=${t.whatsappBusy}
          @click=${()=>t.onWhatsAppWait()}
        >
          等待扫描
        </button>
        <button
          class="btn danger"
          ?disabled=${t.whatsappBusy}
          @click=${()=>t.onWhatsAppLogout()}
        >
          直接注销
        </button>
        <button class="btn" @click=${()=>t.onRefresh(!0)}>
          刷新
        </button>
      </div>

      ${xe({channelId:"whatsapp",props:t})}
    </div>
  `}function vf(e){const t=e.snapshot?.channels,n=t?.whatsapp??void 0,i=t?.telegram??void 0,s=t?.discord??null;t?.googlechat;const r=t?.slack??null,a=t?.signal??null,l=t?.imessage??null;t?.feishu,t?.wecom;const c=t?.nostr??null,d=mf(e.snapshot).map((u,v)=>({key:u,enabled:Jp(u,e),order:v})).sort((u,v)=>u.enabled!==v.enabled?u.enabled?-1:1:u.order-v.order);return o`
    <section class="grid grid-cols-2">
      ${d.map(u=>bf(u.key,e,{whatsapp:n,telegram:i,discord:s,slack:r,signal:a,imessage:l,nostr:c,channelAccounts:e.snapshot?.channelAccounts??null}))}
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">渠道运行状况</div>
          <div class="card-sub">来自网关的渠道状态快照。</div>
        </div>
        <div class="muted">${e.lastSuccessAt?D(e.lastSuccessAt):"无"}</div>
      </div>
      ${e.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${e.lastError}
          </div>`:h}
      <pre class="code-block" style="margin-top: 12px;">
${e.snapshot?JSON.stringify(e.snapshot,null,2):"暂无快照。"}
      </pre>
    </section>
  `}function mf(e){return e?.channelMeta?.length?e.channelMeta.map(t=>t.id):e?.channelOrder?.length?e.channelOrder:["whatsapp","telegram","discord","googlechat","slack","signal","imessage","feishu","wecom","nostr"]}function bf(e,t,n){const i=vo(e,n.channelAccounts);switch(e){case"whatsapp":return gf({props:t,whatsapp:n.whatsapp,accountCountLabel:i});case"telegram":return hf({props:t,telegram:n.telegram,telegramAccounts:n.channelAccounts?.telegram??[],accountCountLabel:i});case"discord":return rf({props:t,discord:n.discord,accountCountLabel:i});case"googlechat":return af({props:t,accountCountLabel:i});case"slack":return ff({props:t,slack:n.slack,accountCountLabel:i});case"signal":return pf({props:t,signal:n.signal,accountCountLabel:i});case"imessage":return of({props:t,imessage:n.imessage,accountCountLabel:i});case"nostr":{const s=n.channelAccounts?.nostr??[],r=s[0],a=r?.accountId??"default",l=r?.profile??null,c=t.nostrProfileAccountId===a?t.nostrProfileFormState:null,p=c?{onFieldChange:t.onNostrProfileFieldChange,onSave:t.onNostrProfileSave,onImport:t.onNostrProfileImport,onCancel:t.onNostrProfileCancel,onToggleAdvanced:t.onNostrProfileToggleAdvanced}:null;return uf({props:t,nostr:n.nostr,nostrAccounts:s,accountCountLabel:i,profileFormState:c,profileFormCallbacks:p,onEditProfile:()=>t.onNostrProfileEdit(a,l)})}default:return yf(e,t,n.channelAccounts??{})}}function yf(e,t,n){const i=wf(t.snapshot,e),s=t.snapshot?.channels?.[e],r=typeof s?.configured=="boolean"?s.configured:void 0,a=typeof s?.running=="boolean"?s.running:void 0,l=typeof s?.connected=="boolean"?s.connected:void 0,c=typeof s?.lastError=="string"?s.lastError:void 0,p=n[e]??[],d=vo(e,n);return o`
    <div class="card">
      <div class="card-title">${i}</div>
      <div class="card-sub">渠道状态与配置。</div>
      ${d}

      ${p.length>0?o`
            <div class="account-card-list">
              ${p.map(u=>Sf(u))}
            </div>
          `:o`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">已配置</span>
                <span>${r==null?"无":r?"是":"否"}</span>
              </div>
              <div>
                <span class="label">运行中</span>
                <span>${a==null?"无":a?"是":"否"}</span>
              </div>
              <div>
                <span class="label">已连接</span>
                <span>${l==null?"无":l?"是":"否"}</span>
              </div>
            </div>
          `}

      ${c?o`<div class="callout danger" style="margin-top: 12px;">
            ${c}
          </div>`:h}

      ${xe({channelId:e,props:t})}
    </div>
  `}function $f(e){return e?.channelMeta?.length?Object.fromEntries(e.channelMeta.map(t=>[t.id,t])):{}}function wf(e,t){return $f(e)[t]?.label??e?.channelLabels?.[t]??t}const xf=600*1e3;function mo(e){return e.lastInboundAt?Date.now()-e.lastInboundAt<xf:!1}function kf(e){return e.running?"是":mo(e)?"活跃":"否"}function Af(e){return e.connected===!0?"是":e.connected===!1?"否":mo(e)?"活跃":"无"}function Sf(e){const t=kf(e),n=Af(e);return o`
    <div class="account-card">
      <div class="account-card-header">
        <div class="account-card-title">${e.name||e.accountId}</div>
        <div class="account-card-id">${e.accountId}</div>
      </div>
      <div class="status-list account-card-status">
        <div>
          <span class="label">运行中 (Running)</span>
          <span>${t}</span>
        </div>
        <div>
          <span class="label">已配置 (Configured)</span>
          <span>${e.configured?"是":"否"}</span>
        </div>
        <div>
          <span class="label">已连接 (Connected)</span>
          <span>${n}</span>
        </div>
        <div>
          <span class="label">上次读入 (Last inbound)</span>
          <span>${e.lastInboundAt?D(e.lastInboundAt):"无"}</span>
        </div>
        ${e.lastError?o`
              <div class="account-card-error">
                ${e.lastError}
              </div>
            `:h}
      </div>
    </div>
  `}function _f(e){const t=e.host??"未知",n=e.ip?`(${e.ip})`:"",i=e.mode??"",s=e.version??"";return`${t} ${n} ${i} ${s}`.trim()}function Tf(e){const t=e.ts??null;return t?D(t):"无"}function bo(e){return e?`${Et(e)} (${D(e)})`:"无"}function Ef(e){if(e.totalTokens==null)return"无";const t=e.totalTokens??0,n=e.contextTokens??0;return n?`${t} / ${n}`:String(t)}function Cf(e){if(e==null)return"";try{return JSON.stringify(e,null,2)}catch{return String(e)}}function Mf(e){const t=e.state??{},n=t.nextRunAtMs?Et(t.nextRunAtMs):"无",i=t.lastRunAtMs?Et(t.lastRunAtMs):"无";return`${t.lastStatus??"无"} · 下次 ${n} · 上次 ${i}`}function If(e){const t=e.schedule;return t.kind==="at"?`定期 ${Et(t.atMs)}`:t.kind==="every"?`每隔 ${oa(t.everyMs)}`:`定时 ${t.expr}${t.tz?` (${t.tz})`:""}`}function Lf(e){const t=e.payload;return t.kind==="systemEvent"?`系统: ${t.text}`:`智能体: ${t.message}`}function Rf(e){const t=["last",...e.channels.filter(Boolean)],n=e.form.channel?.trim();n&&!t.includes(n)&&t.push(n);const i=new Set;return t.filter(s=>i.has(s)?!1:(i.add(s),!0))}function Pf(e,t){if(t==="last")return"last";const n=e.channelMeta?.find(i=>i.id===t);return n?.label?n.label:e.channelLabels?.[t]??t}function Of(e){const t=Rf(e);return o`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">任务调度器 (Scheduler)</div>
        <div class="card-sub">管理网关自带的定时任务调度状态。</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">是否启用</div>
            <div class="stat-value">
              ${e.status?e.status.enabled?"是":"否":"无"}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">任务数</div>
            <div class="stat-value">${e.status?.jobs??"无"}</div>
          </div>
          <div class="stat">
            <div class="stat-label">下次唤醒</div>
            <div class="stat-value">${bo(e.status?.nextWakeAtMs??null)}</div>
          </div>
        </div>
        <div class="row" style="margin-top: 12px;">
          <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"正在刷新…":"刷新"}
          </button>
          ${e.error?o`<span class="muted">${e.error}</span>`:h}
        </div>
      </div>

      <div class="card">
        <div class="card-title">新建任务</div>
        <div class="card-sub">创建一个定时的唤醒或智能体运行任务。</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>任务名称</span>
            <input
              .value=${e.form.name}
              @input=${n=>e.onFormChange({name:n.target.value})}
            />
          </label>
          <label class="field">
            <span>描述</span>
            <input
              .value=${e.form.description}
              @input=${n=>e.onFormChange({description:n.target.value})}
            />
          </label>
          <label class="field">
            <span>智能体 ID</span>
            <input
              .value=${e.form.agentId}
              @input=${n=>e.onFormChange({agentId:n.target.value})}
              placeholder="默认"
            />
          </label>
          <label class="field checkbox">
            <span>是否启用</span>
            <input
              type="checkbox"
              .checked=${e.form.enabled}
              @change=${n=>e.onFormChange({enabled:n.target.checked})}
            />
          </label>
          <label class="field">
            <span>排程方式</span>
            <select
              .value=${e.form.scheduleKind}
              @change=${n=>e.onFormChange({scheduleKind:n.target.value})}
            >
              <option value="every">每隔 (Every)</option>
              <option value="at">于 (At)</option>
              <option value="cron">定时 (Cron)</option>
            </select>
          </label>
        </div>
        ${Nf(e)}
        <div class="form-grid" style="margin-top: 12px;">
          <label class="field">
            <span>会话类型</span>
            <select
              .value=${e.form.sessionTarget}
              @change=${n=>e.onFormChange({sessionTarget:n.target.value})}
            >
              <option value="main">主会话 (Main)</option>
              <option value="isolated">隔离会话 (Isolated)</option>
            </select>
          </label>
          <label class="field">
            <span>唤醒模式</span>
            <select
              .value=${e.form.wakeMode}
              @change=${n=>e.onFormChange({wakeMode:n.target.value})}
            >
              <option value="next-heartbeat">下次心跳</option>
              <option value="now">立即唤醒</option>
            </select>
          </label>
          <label class="field">
            <span>载荷类型</span>
            <select
              .value=${e.form.payloadKind}
              @change=${n=>e.onFormChange({payloadKind:n.target.value})}
            >
              <option value="systemEvent">系统事件</option>
              <option value="agentTurn">智能体轮次</option>
            </select>
          </label>
        </div>
        <label class="field" style="margin-top: 12px;">
          <span>${e.form.payloadKind==="systemEvent"?"系统事件文本":"智能体消息文本"}</span>
          <textarea
            .value=${e.form.payloadText}
            @input=${n=>e.onFormChange({payloadText:n.target.value})}
            rows="4"
          ></textarea>
        </label>
	          ${e.form.payloadKind==="agentTurn"?o`
	              <div class="form-grid" style="margin-top: 12px;">
                <label class="field checkbox">
                  <span>投递</span>
                  <input
                    type="checkbox"
                    .checked=${e.form.deliver}
                    @change=${n=>e.onFormChange({deliver:n.target.checked})}
                  />
	                </label>
	                <label class="field">
	                  <span>渠道</span>
	                  <select
	                    .value=${e.form.channel||"last"}
	                    @change=${n=>e.onFormChange({channel:n.target.value})}
	                  >
	                    ${t.map(n=>o`<option value=${n}>
                            ${Pf(e,n)}
                          </option>`)}
                  </select>
                </label>
                <label class="field">
                  <span>接收者</span>
                  <input
                    .value=${e.form.to}
                    @input=${n=>e.onFormChange({to:n.target.value})}
                    placeholder="+1555… 或聊天 ID"
                  />
                </label>
                <label class="field">
                  <span>超时时间 (秒)</span>
                  <input
                    .value=${e.form.timeoutSeconds}
                    @input=${n=>e.onFormChange({timeoutSeconds:n.target.value})}
                  />
                </label>
                ${e.form.sessionTarget==="isolated"?o`
                      <label class="field">
                        <span>发布到主会话前缀</span>
                        <input
                          .value=${e.form.postToMainPrefix}
                          @input=${n=>e.onFormChange({postToMainPrefix:n.target.value})}
                        />
                      </label>
                    `:h}
              </div>
            `:h}
        <div class="row" style="margin-top: 14px;">
          <button class="btn primary" ?disabled=${e.busy} @click=${e.onAdd}>
            ${e.busy?"正在保存…":"添加任务"}
          </button>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">任务列表</div>
      <div class="card-sub">存储在网关中的所有定时任务。</div>
      ${e.jobs.length===0?o`<div class="muted" style="margin-top: 12px;">暂无任务。</div>`:o`
            <div class="list" style="margin-top: 12px;">
              ${e.jobs.map(n=>Df(n,e))}
            </div>
          `}
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">运行历史</div>
      <div class="card-sub">最近运行记录: ${e.runsJobId??"(请选择一个任务)"}。</div>
      ${e.runsJobId==null?o`
            <div class="muted" style="margin-top: 12px;">
              选择一个任务以查看运行历史。
            </div>
          `:e.runs.length===0?o`<div class="muted" style="margin-top: 12px;">暂无运行记录。</div>`:o`
              <div class="list" style="margin-top: 12px;">
                ${e.runs.map(n=>Bf(n))}
              </div>
            `}
    </section>
  `}function Nf(e){const t=e.form;return t.scheduleKind==="at"?o`
      <label class="field" style="margin-top: 12px;">
        <span>运行于</span>
        <input
          type="datetime-local"
          .value=${t.scheduleAt}
          @input=${n=>e.onFormChange({scheduleAt:n.target.value})}
        />
      </label>
    `:t.scheduleKind==="every"?o`
      <div class="form-grid" style="margin-top: 12px;">
        <label class="field">
          <span>每隔</span>
          <input
            .value=${t.everyAmount}
            @input=${n=>e.onFormChange({everyAmount:n.target.value})}
          />
        </label>
        <label class="field">
          <span>单位</span>
          <select
            .value=${t.everyUnit}
            @change=${n=>e.onFormChange({everyUnit:n.target.value})}
          >
            <option value="minutes">分钟</option>
            <option value="hours">小时</option>
            <option value="days">天</option>
          </select>
        </label>
      </div>
    `:o`
    <div class="form-grid" style="margin-top: 12px;">
      <label class="field">
        <span>Cron 表达式</span>
        <input
          .value=${t.cronExpr}
          @input=${n=>e.onFormChange({cronExpr:n.target.value})}
        />
      </label>
      <label class="field">
        <span>时区 (可选)</span>
        <input
          .value=${t.cronTz}
          @input=${n=>e.onFormChange({cronTz:n.target.value})}
        />
      </label>
    </div>
  `}function Df(e,t){const i=`list-item list-item-clickable${t.runsJobId===e.id?" list-item-selected":""}`;return o`
    <div class=${i} @click=${()=>t.onLoadRuns(e.id)}>
      <div class="list-main">
        <div class="list-title">${e.name}</div>
        <div class="list-sub">${If(e)}</div>
        <div class="muted">${Lf(e)}</div>
        ${e.agentId?o`<div class="muted">智能体ID: ${e.agentId}</div>`:h}
        <div class="chip-row" style="margin-top: 6px;">
          <span class="chip">${e.enabled?"已启用":"已停用"}</span>
          <span class="chip">${e.sessionTarget}</span>
          <span class="chip">${e.wakeMode}</span>
        </div>
      </div>
      <div class="list-meta">
        <div>${Mf(e)}</div>
        <div class="row" style="justify-content: flex-end; margin-top: 8px;">
          <button
            class="btn"
            ?disabled=${t.busy}
            @click=${s=>{s.stopPropagation(),t.onToggle(e,!e.enabled)}}
          >
            ${e.enabled?"停用":"启用"}
          </button>
          <button
            class="btn"
            ?disabled=${t.busy}
            @click=${s=>{s.stopPropagation(),t.onRun(e)}}
          >
            运行
          </button>
          <button
            class="btn"
            ?disabled=${t.busy}
            @click=${s=>{s.stopPropagation(),t.onLoadRuns(e.id)}}
          >
            运行记录
          </button>
          <button
            class="btn danger"
            ?disabled=${t.busy}
            @click=${s=>{s.stopPropagation(),t.onRemove(e)}}
          >
            移除
          </button>
        </div>
      </div>
    </div>
  `}function Bf(e){return o`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${e.status}</div>
        <div class="list-sub">${e.summary??""}</div>
      </div>
      <div class="list-meta">
        <div>${Et(e.ts)}</div>
        <div class="muted">${e.durationMs??0}ms</div>
        ${e.error?o`<div class="muted">${e.error}</div>`:h}
      </div>
    </div>
  `}function Ff(e){return o`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="row" style="justify-content: space-between;">
          <div>
            <div class="card-title">系统快照</div>
            <div class="card-sub">状态、健康状况和心跳数据。</div>
          </div>
          <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"刷新中...":"刷新"}
          </button>
        </div>
        <div class="stack" style="margin-top: 12px;">
          <div>
            <div class="muted">状态 (Status)</div>
            <pre class="code-block">${JSON.stringify(e.status??{},null,2)}</pre>
          </div>
          <div>
            <div class="muted">健康状况 (Health)</div>
            <pre class="code-block">${JSON.stringify(e.health??{},null,2)}</pre>
          </div>
          <div>
            <div class="muted">最后心跳时间 (Heartbeat)</div>
            <pre class="code-block">${JSON.stringify(e.heartbeat??{},null,2)}</pre>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">手动 RPC 调用</div>
        <div class="card-sub">通过 JSON 参数调用原始网关方法。</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>方法名 (Method)</span>
            <input
              .value=${e.callMethod}
              @input=${t=>e.onCallMethodChange(t.target.value)}
              placeholder="system-presence"
            />
          </label>
          <label class="field">
            <span>参数 (JSON)</span>
            <textarea
              .value=${e.callParams}
              @input=${t=>e.onCallParamsChange(t.target.value)}
              rows="6"
            ></textarea>
          </label>
        </div>
        <div class="row" style="margin-top: 12px;">
          <button class="btn primary" @click=${e.onCall}>执行调用</button>
        </div>
        ${e.callError?o`<div class="callout danger" style="margin-top: 12px;">
              ${e.callError}
            </div>`:h}
        ${e.callResult?o`<pre class="code-block" style="margin-top: 12px;">${e.callResult}</pre>`:h}
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">模型列表 (Models)</div>
      <div class="card-sub">来自 models.list 的完整模型目录。</div>
      <pre class="code-block" style="margin-top: 12px;">${JSON.stringify(e.models??[],null,2)}</pre>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">事件日志 (Event Log)</div>
      <div class="card-sub">最新的网关实时事件流。</div>
      ${e.eventLog.length===0?o`<div class="muted" style="margin-top: 12px;">尚无事件发布。</div>`:o`
            <div class="list" style="margin-top: 12px;">
              ${e.eventLog.map(t=>o`
                  <div class="list-item">
                    <div class="list-main">
                      <div class="list-title">${t.event}</div>
                      <div class="list-sub">${new Date(t.ts).toLocaleTimeString()}</div>
                    </div>
                    <div class="list-meta">
                      <pre class="code-block">${Cf(t.payload)}</pre>
                    </div>
                  </div>
                `)}
            </div>
          `}
    </section>
  `}function zf(e){return o`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">连通实例 (Instances)</div>
          <div class="card-sub">来自网关与客户端的状态信号。</div>
        </div>
        <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
          ${e.loading?"加载中…":"刷新"}
        </button>
      </div>
      ${e.lastError?o`<div class="callout danger" style="margin-top: 12px;">
            ${e.lastError}
          </div>`:h}
      ${e.statusMessage?o`<div class="callout" style="margin-top: 12px;">
            ${e.statusMessage}
          </div>`:h}
      <div class="list" style="margin-top: 16px;">
        ${e.entries.length===0?o`<div class="muted">暂无上报的实例。</div>`:e.entries.map(t=>Uf(t))}
      </div>
    </section>
  `}function Uf(e){const t=e.lastInputSeconds!=null?`${e.lastInputSeconds} 秒前`:"无",n=e.mode??"未知模式",i=Array.isArray(e.roles)?e.roles.filter(Boolean):[],s=Array.isArray(e.scopes)?e.scopes.filter(Boolean):[],r=s.length>0?s.length>3?`${s.length} 个作用域`:`作用域: ${s.join(", ")}`:null;return o`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${e.host??"未知主机"}</div>
        <div class="list-sub">${_f(e)}</div>
        <div class="chip-row">
          <span class="chip">${n}</span>
          ${i.map(a=>o`<span class="chip">${a}</span>`)}
          ${r?o`<span class="chip">${r}</span>`:h}
          ${e.platform?o`<span class="chip">${e.platform}</span>`:h}
          ${e.deviceFamily?o`<span class="chip">${e.deviceFamily}</span>`:h}
          ${e.modelIdentifier?o`<span class="chip">${e.modelIdentifier}</span>`:h}
          ${e.version?o`<span class="chip">${e.version}</span>`:h}
        </div>
      </div>
      <div class="list-meta">
        <div>${Tf(e)}</div>
        <div class="muted">最后输入: ${t}</div>
        <div class="muted">原因: ${e.reason??"无"}</div>
      </div>
    </div>
  `}const Hr=["trace","debug","info","warn","error","fatal"];function Kf(e){if(!e)return"";const t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleTimeString()}function Hf(e,t){return t?[e.message,e.subsystem,e.raw].filter(Boolean).join(" ").toLowerCase().includes(t):!0}function Wf(e){const t=e.filterText.trim().toLowerCase(),n=Hr.some(r=>!e.levelFilters[r]),i=e.entries.filter(r=>r.level&&!e.levelFilters[r.level]?!1:Hf(r,t)),s=t||n;return o`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">日志</div>
          <div class="card-sub">网关日志文件 (JSONL)。</div>
        </div>
        <div class="row" style="gap: 8px;">
          <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
            ${e.loading?"加载中...":"刷新"}
          </button>
          <button
            class="btn"
            ?disabled=${i.length===0}
            @click=${()=>e.onExport(i.map(r=>r.raw),s?"filtered":"visible")}
          >
            导出 ${s?"过滤后":"全部"}日志
          </button>
        </div>
      </div>

      <div class="filters" style="margin-top: 14px;">
        <label class="field" style="min-width: 220px;">
          <span>搜索</span>
          <input
            .value=${e.filterText}
            @input=${r=>e.onFilterTextChange(r.target.value)}
            placeholder="搜索日志..."
          />
        </label>
        <label class="field checkbox">
          <span>自动滚动</span>
          <input
            type="checkbox"
            .checked=${e.autoFollow}
            @change=${r=>e.onToggleAutoFollow(r.target.checked)}
          />
        </label>
      </div>

      <div class="chip-row" style="margin-top: 12px;">
        ${Hr.map(r=>o`
            <label class="chip log-chip ${r}">
              <input
                type="checkbox"
                .checked=${e.levelFilters[r]}
                @change=${a=>e.onLevelToggle(r,a.target.checked)}
              />
              <span>${r}</span>
            </label>
          `)}
      </div>

      ${e.file?o`<div class="muted" style="margin-top: 10px;">文件: ${e.file}</div>`:h}
      ${e.truncated?o`<div class="callout" style="margin-top: 10px;">
            日志输出已截断；仅显示最新部分。
          </div>`:h}
      ${e.error?o`<div class="callout danger" style="margin-top: 10px;">${e.error}</div>`:h}

      <div class="log-stream" style="margin-top: 12px;" @scroll=${e.onScroll}>
        ${i.length===0?o`<div class="muted" style="padding: 12px;">无日志条目。</div>`:i.map(r=>o`
                <div class="log-row">
                  <div class="log-time mono">${Kf(r.time)}</div>
                  <div class="log-level ${r.level??""}">${r.level??""}</div>
                  <div class="log-subsystem mono">${r.subsystem??""}</div>
                  <div class="log-message mono">${r.message??r.raw}</div>
                </div>
              `)}
      </div>
    </section>
  `}function jf(e){const t=Yf(e),n=ih(e);return o`
    ${rh(n)}
    ${sh(t)}
    ${qf(e)}
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">接入点 (Nodes)</div>
          <div class="card-sub">已连接的远程执行节点。</div>
        </div>
        <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
          ${e.loading?"加载中...":"刷新"}
        </button>
      </div>
      <div class="list" style="margin-top: 16px;">
        ${e.nodes.length===0?o`<div class="muted">未找到接入点。</div>`:e.nodes.map(i=>gh(i))}
      </div>
    </section>
  `}function qf(e){const t=e.devicesList??{pending:[],paired:[]},n=Array.isArray(t.pending)?t.pending:[],i=Array.isArray(t.paired)?t.paired:[];return o`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">设备管理 (Devices)</div>
          <div class="card-sub">配对请求及身份令牌。</div>
        </div>
        <button class="btn" ?disabled=${e.devicesLoading} @click=${e.onDevicesRefresh}>
          ${e.devicesLoading?"加载中...":"刷新"}
        </button>
      </div>
      ${e.devicesError?o`<div class="callout danger" style="margin-top: 12px;">${e.devicesError}</div>`:h}
      <div class="list" style="margin-top: 16px;">
        ${n.length>0?o`
              <div class="muted" style="margin-bottom: 8px;">待处理</div>
              ${n.map(s=>Vf(s,e))}
            `:h}
        ${i.length>0?o`
              <div class="muted" style="margin-top: 12px; margin-bottom: 8px;">已配对</div>
              ${i.map(s=>Gf(s,e))}
            `:h}
        ${n.length===0&&i.length===0?o`<div class="muted">无已配对设备。</div>`:h}
      </div>
    </section>
  `}function Vf(e,t){const n=e.displayName?.trim()||e.deviceId,i=typeof e.ts=="number"?D(e.ts):"无",s=e.role?.trim()?`角色: ${e.role}`:"角色: -",r=e.isRepair?" · 修复":"",a=e.remoteIp?` · ${e.remoteIp}`:"";return o`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${n}</div>
        <div class="list-sub">${e.deviceId}${a}</div>
        <div class="muted" style="margin-top: 6px;">
          ${s} · 请求于 ${i}${r}
        </div>
      </div>
      <div class="list-meta">
        <div class="row" style="justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn--sm primary" @click=${()=>t.onDeviceApprove(e.requestId)}>
            通过
          </button>
          <button class="btn btn--sm" @click=${()=>t.onDeviceReject(e.requestId)}>
            拒绝
          </button>
        </div>
      </div>
    </div>
  `}function Gf(e,t){const n=e.displayName?.trim()||e.deviceId,i=e.remoteIp?` · ${e.remoteIp}`:"",s=`角色: ${ai(e.roles)}`,r=`范围: ${ai(e.scopes)}`,a=Array.isArray(e.tokens)?e.tokens:[];return o`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${n}</div>
        <div class="list-sub">${e.deviceId}${i}</div>
        <div class="muted" style="margin-top: 6px;">${s} · ${r}</div>
        ${a.length===0?o`<div class="muted" style="margin-top: 6px;">身份令牌: 无</div>`:o`
              <div class="muted" style="margin-top: 10px;">身份令牌</div>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                ${a.map(l=>Qf(e.deviceId,l,t))}
              </div>
            `}
      </div>
    </div>
  `}function Qf(e,t,n){const i=t.revokedAtMs?"已撤销":"活跃",s=`范围: ${ai(t.scopes)}`,r=D(t.rotatedAtMs??t.createdAtMs??t.lastUsedAtMs??null);return o`
    <div class="row" style="justify-content: space-between; gap: 8px;">
      <div class="list-sub">${t.role} · ${i} · ${s} · ${r}</div>
      <div class="row" style="justify-content: flex-end; gap: 6px; flex-wrap: wrap;">
        <button
          class="btn btn--sm"
          @click=${()=>n.onDeviceRotate(e,t.role,t.scopes)}
        >
          轮换
        </button>
        ${t.revokedAtMs?h:o`
              <button
                class="btn btn--sm danger"
                @click=${()=>n.onDeviceRevoke(e,t.role)}
              >
                撤销
              </button>
            `}
      </div>
    </div>
  `}const Se="__defaults__",Wr=[{value:"deny",label:"拒绝"},{value:"allowlist",label:"白名单"},{value:"full",label:"完全开放"}],Zf=[{value:"off",label:"关闭"},{value:"on-miss",label:"未命中匹配时"},{value:"always",label:"总是询问"}];function Yf(e){const t=e.configForm,n=ph(e.nodes),{defaultBinding:i,agents:s}=hh(t),r=!!t,a=e.configSaving||e.configFormMode==="raw";return{ready:r,disabled:a,configDirty:e.configDirty,configLoading:e.configLoading,configSaving:e.configSaving,defaultBinding:i,agents:s,nodes:n,onBindDefault:e.onBindDefault,onBindAgent:e.onBindAgent,onSave:e.onSaveBindings,onLoadConfig:e.onLoadConfig,formMode:e.configFormMode}}function jr(e){return e==="allowlist"||e==="full"||e==="deny"?e:"deny"}function Xf(e){return e==="always"||e==="off"||e==="on-miss"?e:"on-miss"}function Jf(e){const t=e?.defaults??{};return{security:jr(t.security),ask:Xf(t.ask),askFallback:jr(t.askFallback??"deny"),autoAllowSkills:!!(t.autoAllowSkills??!1)}}function eh(e){const t=e?.agents??{},n=Array.isArray(t.list)?t.list:[],i=[];return n.forEach(s=>{if(!s||typeof s!="object")return;const r=s,a=typeof r.id=="string"?r.id.trim():"";if(!a)return;const l=typeof r.name=="string"?r.name.trim():void 0,c=r.default===!0;i.push({id:a,name:l||void 0,isDefault:c})}),i}function th(e,t){const n=eh(e),i=Object.keys(t?.agents??{}),s=new Map;n.forEach(a=>s.set(a.id,a)),i.forEach(a=>{s.has(a)||s.set(a,{id:a})});const r=Array.from(s.values());return r.length===0&&r.push({id:"main",isDefault:!0}),r.sort((a,l)=>{if(a.isDefault&&!l.isDefault)return-1;if(!a.isDefault&&l.isDefault)return 1;const c=a.name?.trim()?a.name:a.id,p=l.name?.trim()?l.name:l.id;return c.localeCompare(p)}),r}function nh(e,t){return e===Se?Se:e&&t.some(n=>n.id===e)?e:Se}function ih(e){const t=e.execApprovalsForm??e.execApprovalsSnapshot?.file??null,n=!!t,i=Jf(t),s=th(e.configForm,t),r=fh(e.nodes),a=e.execApprovalsTarget;let l=a==="node"&&e.execApprovalsTargetNodeId?e.execApprovalsTargetNodeId:null;a==="node"&&l&&!r.some(u=>u.id===l)&&(l=null);const c=nh(e.execApprovalsSelectedAgent,s),p=c!==Se?(t?.agents??{})[c]??null:null,d=Array.isArray(p?.allowlist)?p.allowlist??[]:[];return{ready:n,disabled:e.execApprovalsSaving||e.execApprovalsLoading,dirty:e.execApprovalsDirty,loading:e.execApprovalsLoading,saving:e.execApprovalsSaving,form:t,defaults:i,selectedScope:c,selectedAgent:p,agents:s,allowlist:d,target:a,targetNodeId:l,targetNodes:r,onSelectScope:e.onExecApprovalsSelectAgent,onSelectTarget:e.onExecApprovalsTargetChange,onPatch:e.onExecApprovalsPatch,onRemove:e.onExecApprovalsRemove,onLoad:e.onLoadExecApprovals,onSave:e.onSaveExecApprovals}}function sh(e){const t=e.nodes.length>0,n=e.defaultBinding??"";return o`
    <section class="card">
      <div class="row" style="justify-content: space-between; align-items: center;">
        <div>
          <div class="card-title">执行节点绑定 (Exec binding)</div>
          <div class="card-sub">
            在使用 <span class="mono">exec host=node</span> 时，将智能体固定到特定节点执行。
          </div>
        </div>
        <button
          class="btn"
          ?disabled=${e.disabled||!e.configDirty}
          @click=${e.onSave}
        >
          ${e.configSaving?"保存中...":"保存设置"}
        </button>
      </div>

      ${e.formMode==="raw"?o`<div class="callout warn" style="margin-top: 12px;">
            请将配置标签页切换到 <strong>表单 (Form)</strong> 模式以便在此处编辑绑定设置。
          </div>`:h}

      ${e.ready?o`
            <div class="list" style="margin-top: 16px;">
              <div class="list-item">
                <div class="list-main">
                  <div class="list-title">默认绑定节点</div>
                  <div class="list-sub">当智能体未指定节点绑定时使用的默认执行节点。</div>
                </div>
                <div class="list-meta">
                  <label class="field">
                    <span>执行节点</span>
                    <select
                      ?disabled=${e.disabled||!t}
                      @change=${i=>{const r=i.target.value.trim();e.onBindDefault(r||null)}}
                    >
                      <option value="" ?selected=${n===""}>任意节点</option>
                      ${e.nodes.map(i=>o`<option
                            value=${i.id}
                            ?selected=${n===i.id}
                          >
                            ${i.label}
                          </option>`)}
                    </select>
                  </label>
                  ${t?h:o`<div class="muted">没有可用于执行 system.run 的节点。</div>`}
                </div>
              </div>

              ${e.agents.length===0?o`<div class="muted">未找到智能体。</div>`:e.agents.map(i=>uh(i,e))}
            </div>
          `:o`<div class="row" style="margin-top: 12px; gap: 12px;">
            <div class="muted">请先加载配置以编辑绑定设置。</div>
            <button class="btn" ?disabled=${e.configLoading} @click=${e.onLoadConfig}>
              ${e.configLoading?"加载中...":"加载配置"}
            </button>
          </div>`}
    </section>
  `}function rh(e){const t=e.ready,n=e.target!=="node"||!!e.targetNodeId;return o`
    <section class="card">
      <div class="row" style="justify-content: space-between; align-items: center;">
        <div>
          <div class="card-title">执行审批 (Exec approvals)</div>
          <div class="card-sub">
            针对 <span class="mono">exec host=gateway/node</span> 的执行白名单及审批策略。
          </div>
        </div>
        <button
          class="btn"
          ?disabled=${e.disabled||!e.dirty||!n}
          @click=${e.onSave}
        >
          ${e.saving?"保存中...":"保存设置"}
        </button>
      </div>

      ${ah(e)}

      ${t?o`
            ${oh(e)}
            ${lh(e)}
            ${e.selectedScope===Se?h:ch(e)}
          `:o`<div class="row" style="margin-top: 12px; gap: 12px;">
            <div class="muted">请先加载执行审批数据以编辑白名单。</div>
            <button class="btn" ?disabled=${e.loading||!n} @click=${e.onLoad}>
              ${e.loading?"加载中...":"加载审批数据"}
            </button>
          </div>`}
    </section>
  `}function ah(e){const t=e.targetNodes.length>0,n=e.targetNodeId??"";return o`
    <div class="list" style="margin-top: 12px;">
      <div class="list-item">
        <div class="list-main">
          <div class="list-title">管理目标</div>
          <div class="list-sub">
            网关模式编辑本地审批；节点模式编辑选定的执行节点。
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>控制端</span>
            <select
              ?disabled=${e.disabled}
              @change=${i=>{if(i.target.value==="node"){const a=e.targetNodes[0]?.id??null;e.onSelectTarget("node",n||a)}else e.onSelectTarget("gateway",null)}}
            >
              <option value="gateway" ?selected=${e.target==="gateway"}>网关</option>
              <option value="node" ?selected=${e.target==="node"}>节点</option>
            </select>
          </label>
          ${e.target==="node"?o`
                <label class="field">
                  <span>执行节点</span>
                  <select
                    ?disabled=${e.disabled||!t}
                    @change=${i=>{const r=i.target.value.trim();e.onSelectTarget("node",r||null)}}
                  >
                    <option value="" ?selected=${n===""}>选择节点...</option>
                    ${e.targetNodes.map(i=>o`<option
                          value=${i.id}
                          ?selected=${n===i.id}
                        >
                          ${i.label}
                        </option>`)}
                  </select>
                </label>
              `:h}
        </div>
      </div>
      ${e.target==="node"&&!t?o`<div class="muted">尚未有节点报告可用的执行审批能力。</div>`:h}
    </div>
  `}function oh(e){return o`
    <div class="row" style="margin-top: 12px; gap: 8px; flex-wrap: wrap;">
      <span class="label">适用范围</span>
      <div class="row" style="gap: 8px; flex-wrap: wrap;">
        <button
          class="btn btn--sm ${e.selectedScope===Se?"active":""}"
          @click=${()=>e.onSelectScope(Se)}
        >
          全局默认
        </button>
        ${e.agents.map(t=>{const n=t.name?.trim()?`${t.name} (${t.id})`:t.id;return o`
            <button
              class="btn btn--sm ${e.selectedScope===t.id?"active":""}"
              @click=${()=>e.onSelectScope(t.id)}
            >
              ${n}
            </button>
          `})}
      </div>
    </div>
  `}function lh(e){const t=e.selectedScope===Se,n=e.defaults,i=e.selectedAgent??{},s=t?["defaults"]:["agents",e.selectedScope],r=typeof i.security=="string"?i.security:void 0,a=typeof i.ask=="string"?i.ask:void 0,l=typeof i.askFallback=="string"?i.askFallback:void 0,c=t?n.security:r??"__default__",p=t?n.ask:a??"__default__",d=t?n.askFallback:l??"__default__",u=typeof i.autoAllowSkills=="boolean"?i.autoAllowSkills:void 0,v=u??n.autoAllowSkills,g=u==null;return o`
    <div class="list" style="margin-top: 16px;">
      <div class="list-item">
        <div class="list-main">
          <div class="list-title">安全等级 (Security)</div>
          <div class="list-sub">
            ${t?"默认安全执行模式。":`当前默认值: ${n.security}。`}
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>模式</span>
            <select
              ?disabled=${e.disabled}
              @change=${$=>{const k=$.target.value;!t&&k==="__default__"?e.onRemove([...s,"security"]):e.onPatch([...s,"security"],k)}}
            >
              ${t?h:o`<option value="__default__" ?selected=${c==="__default__"}>
                    使用默认 (${n.security})
                  </option>`}
              ${Wr.map($=>o`<option
                    value=${$.value}
                    ?selected=${c===$.value}
                  >
                    ${$.label}
                  </option>`)}
            </select>
          </label>
        </div>
      </div>

      <div class="list-item">
        <div class="list-main">
          <div class="list-title">审批询问 (Ask)</div>
          <div class="list-sub">
            ${t?"默认弹窗询问策略。":`当前默认值: ${n.ask}。`}
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>策略</span>
            <select
              ?disabled=${e.disabled}
              @change=${$=>{const k=$.target.value;!t&&k==="__default__"?e.onRemove([...s,"ask"]):e.onPatch([...s,"ask"],k)}}
            >
              ${t?h:o`<option value="__default__" ?selected=${p==="__default__"}>
                    使用默认 (${n.ask})
                  </option>`}
              ${Zf.map($=>o`<option
                    value=${$.value}
                    ?selected=${p===$.value}
                  >
                    ${$.label}
                  </option>`)}
            </select>
          </label>
        </div>
      </div>

      <div class="list-item">
        <div class="list-main">
          <div class="list-title">询问回退 (Ask fallback)</div>
          <div class="list-sub">
            ${t?"当 UI 提示无法显示时的回退选择。":`当前默认值: ${n.askFallback}。`}
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>回退策略</span>
            <select
              ?disabled=${e.disabled}
              @change=${$=>{const k=$.target.value;!t&&k==="__default__"?e.onRemove([...s,"askFallback"]):e.onPatch([...s,"askFallback"],k)}}
            >
              ${t?h:o`<option value="__default__" ?selected=${d==="__default__"}>
                    使用默认 (${n.askFallback})
                  </option>`}
              ${Wr.map($=>o`<option
                    value=${$.value}
                    ?selected=${d===$.value}
                  >
                    ${$.label}
                  </option>`)}
            </select>
          </label>
        </div>
      </div>

      <div class="list-item">
        <div class="list-main">
          <div class="list-title">自动允许技能 CLI</div>
          <div class="list-sub">
            ${t?"通过网关直接执行已安装的技能入口程序。":g?`使用默认 (${n.autoAllowSkills?"开启":"关闭"})。`:`已覆盖设定 (${v?"开启":"关闭"})。`}
          </div>
        </div>
        <div class="list-meta">
          <label class="field">
            <span>开启</span>
            <input
              type="checkbox"
              ?disabled=${e.disabled}
              .checked=${v}
              @change=${$=>{const w=$.target;e.onPatch([...s,"autoAllowSkills"],w.checked)}}
            />
          </label>
          ${!t&&!g?o`<button
                class="btn btn--sm"
                ?disabled=${e.disabled}
                @click=${()=>e.onRemove([...s,"autoAllowSkills"])}
              >
                恢复默认
              </button>`:h}
        </div>
      </div>
    </div>
  `}function ch(e){const t=["agents",e.selectedScope,"allowlist"],n=e.allowlist;return o`
    <div class="row" style="margin-top: 18px; justify-content: space-between;">
      <div>
        <div class="card-title">白名单 (Allowlist)</div>
        <div class="card-sub">支持不区分大小写的 Glob 通配符。</div>
      </div>
      <button
        class="btn btn--sm"
        ?disabled=${e.disabled}
        @click=${()=>{const i=[...n,{pattern:""}];e.onPatch(t,i)}}
      >
        添加模式
      </button>
    </div>
    <div class="list" style="margin-top: 12px;">
      ${n.length===0?o`<div class="muted">暂无白名单项。</div>`:n.map((i,s)=>dh(e,i,s))}
    </div>
  `}function dh(e,t,n){const i=t.lastUsedAt?D(t.lastUsedAt):"从未使用",s=t.lastUsedCommand?oi(t.lastUsedCommand,120):null,r=t.lastResolvedPath?oi(t.lastResolvedPath,120):null;return o`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${t.pattern?.trim()?t.pattern:"新规则模式"}</div>
        <div class="list-sub">上次使用: ${i}</div>
        ${s?o`<div class="list-sub mono">${s}</div>`:h}
        ${r?o`<div class="list-sub mono">${r}</div>`:h}
      </div>
      <div class="list-meta">
        <label class="field">
          <span>模式</span>
          <input
            type="text"
            .value=${t.pattern??""}
            ?disabled=${e.disabled}
            @input=${a=>{const l=a.target;e.onPatch(["agents",e.selectedScope,"allowlist",n,"pattern"],l.value)}}
          />
        </label>
        <button
          class="btn btn--sm danger"
          ?disabled=${e.disabled}
          @click=${()=>{if(e.allowlist.length<=1){e.onRemove(["agents",e.selectedScope,"allowlist"]);return}e.onRemove(["agents",e.selectedScope,"allowlist",n])}}
        >
          移除
        </button>
      </div>
    </div>
  `}function uh(e,t){const n=e.binding??"__default__",i=e.name?.trim()?`${e.name} (${e.id})`:e.id,s=t.nodes.length>0;return o`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${i}</div>
        <div class="list-sub">
          ${e.isDefault?"默认智能体":"智能体"} ·
          ${n==="__default__"?`使用全局默认 (${t.defaultBinding??"任意节点"})`:`覆盖设定: ${e.binding}`}
        </div>
      </div>
      <div class="list-meta">
        <label class="field">
          <span>绑定节点</span>
          <select
            ?disabled=${t.disabled||!s}
            @change=${r=>{const l=r.target.value.trim();t.onBindAgent(e.index,l==="__default__"?null:l)}}
          >
            <option value="__default__" ?selected=${n==="__default__"}>
              使用全局默认
            </option>
            ${t.nodes.map(r=>o`<option
                  value=${r.id}
                  ?selected=${n===r.id}
                >
                  ${r.label}
                </option>`)}
          </select>
        </label>
      </div>
    </div>
  `}function ph(e){const t=[];for(const n of e){if(!(Array.isArray(n.commands)?n.commands:[]).some(l=>String(l)==="system.run"))continue;const r=typeof n.nodeId=="string"?n.nodeId.trim():"";if(!r)continue;const a=typeof n.displayName=="string"&&n.displayName.trim()?n.displayName.trim():r;t.push({id:r,label:a===r?r:`${a} · ${r}`})}return t.sort((n,i)=>n.label.localeCompare(i.label)),t}function fh(e){const t=[];for(const n of e){if(!(Array.isArray(n.commands)?n.commands:[]).some(l=>String(l)==="system.execApprovals.get"||String(l)==="system.execApprovals.set"))continue;const r=typeof n.nodeId=="string"?n.nodeId.trim():"";if(!r)continue;const a=typeof n.displayName=="string"&&n.displayName.trim()?n.displayName.trim():r;t.push({id:r,label:a===r?r:`${a} · ${r}`})}return t.sort((n,i)=>n.label.localeCompare(i.label)),t}function hh(e){const t={id:"main",name:void 0,index:0,isDefault:!0,binding:null};if(!e||typeof e!="object")return{defaultBinding:null,agents:[t]};const i=(e.tools??{}).exec??{},s=typeof i.node=="string"&&i.node.trim()?i.node.trim():null,r=e.agents??{},a=Array.isArray(r.list)?r.list:[];if(a.length===0)return{defaultBinding:s,agents:[t]};const l=[];return a.forEach((c,p)=>{if(!c||typeof c!="object")return;const d=c,u=typeof d.id=="string"?d.id.trim():"";if(!u)return;const v=typeof d.name=="string"?d.name.trim():void 0,g=d.default===!0,w=(d.tools??{}).exec??{},k=typeof w.node=="string"&&w.node.trim()?w.node.trim():null;l.push({id:u,name:v||void 0,index:p,isDefault:g,binding:k})}),l.length===0&&l.push(t),{defaultBinding:s,agents:l}}function gh(e){const t=!!e.connected,n=!!e.paired,i=typeof e.displayName=="string"&&e.displayName.trim()||(typeof e.nodeId=="string"?e.nodeId:"未知节点"),s=Array.isArray(e.caps)?e.caps:[],r=Array.isArray(e.commands)?e.commands:[];return o`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${i}</div>
        <div class="list-sub">
          ${typeof e.nodeId=="string"?e.nodeId:""}
          ${typeof e.remoteIp=="string"?` · ${e.remoteIp}`:""}
          ${typeof e.version=="string"?` · ${e.version}`:""}
        </div>
        <div class="chip-row" style="margin-top: 6px;">
          <span class="chip">${n?"已配对":"未配对"}</span>
          <span class="chip ${t?"chip-ok":"chip-warn"}">
            ${t?"在线":"离线"}
          </span>
          ${s.slice(0,12).map(a=>o`<span class="chip">${String(a)}</span>`)}
          ${r.slice(0,8).map(a=>o`<span class="chip">${String(a)}</span>`)}
        </div>
      </div>
    </div>
  `}function vh(e){const t=e.hello?.snapshot,n=t?.uptimeMs?oa(t.uptimeMs):"无",i=t?.policy?.tickIntervalMs?`${t.policy.tickIntervalMs}ms`:"无",s=(()=>{if(e.connected||!e.lastError)return null;const a=e.lastError.toLowerCase();if(!(a.includes("unauthorized")||a.includes("connect failed")))return null;const c=!!e.settings.token.trim(),p=!!e.password.trim();return!c&&!p?o`
        <div class="muted" style="margin-top: 8px;">
          此网关需要身份验证。请添加令牌或密码，然后点击“连接”。
          <div style="margin-top: 6px;">
            <span class="mono">openclaw dashboard --no-open</span> → 获取带令牌的 URL<br />
            <span class="mono">openclaw doctor --generate-gateway-token</span> → 设置令牌
          </div>
          <div style="margin-top: 6px;">
            <a
              class="session-link"
              href="https://docs.clawd.bot/web/dashboard"
              target="_blank"
              rel="noreferrer"
              title="控制面板身份验证文档（在新标签页中打开）"
              >文档：控制面板身份验证</a
            >
          </div>
        </div>
      `:o`
      <div class="muted" style="margin-top: 8px;">
        身份验证失败。请通过
        <span class="mono">openclaw dashboard --no-open</span> 重新复制带令牌的 URL，或者更新令牌，然后点击“连接”。
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.clawd.bot/web/dashboard"
            target="_blank"
            rel="noreferrer"
            title="控制面板身份验证文档（在新标签页中打开）"
            >文档：控制面板身份验证</a
          >
        </div>
      </div>
    `})(),r=(()=>{if(e.connected||!e.lastError||(typeof window<"u"?window.isSecureContext:!0)!==!1)return null;const l=e.lastError.toLowerCase();return!l.includes("secure context")&&!l.includes("device identity required")?null:o`
      <div class="muted" style="margin-top: 8px;">
        此页面处于 HTTP 环境，浏览器会拦截设备身份。请使用 HTTPS (Tailscale Serve) 或在网关主机上打开
        <span class="mono">http://127.0.0.1:18789</span>。
        <div style="margin-top: 6px;">
          如果必须使用 HTTP，请设置
          <span class="mono">gateway.controlUi.allowInsecureAuth: true</span> (仅令牌验证)。
        </div>
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.clawd.bot/gateway/tailscale"
            target="_blank"
            rel="noreferrer"
            title="Tailscale Serve 文档（在新标签页中打开）"
            >文档：Tailscale Serve</a
          >
          <span class="muted"> · </span>
          <a
            class="session-link"
            href="https://docs.clawd.bot/web/control-ui#insecure-http"
            target="_blank"
            rel="noreferrer"
            title="不安全 HTTP 文档（在新标签页中打开）"
            >文档：不安全 HTTP</a
          >
        </div>
      </div>
    `})();return o`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">网关访问</div>
        <div class="card-sub">控制面板如何连接网关及其身份验证方式。</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>WebSocket 地址</span>
            <input
              .value=${e.settings.gatewayUrl}
              @input=${a=>{const l=a.target.value;e.onSettingsChange({...e.settings,gatewayUrl:l})}}
              placeholder="ws://127.0.0.1:18789"
            />
          </label>
          <label class="field">
            <span>网关令牌 (Token)</span>
            <input
              .value=${e.settings.token}
              @input=${a=>{const l=a.target.value;e.onSettingsChange({...e.settings,token:l})}}
              placeholder="网关访问令牌"
            />
          </label>
          <label class="field">
            <span>密码 (不存储)</span>
            <input
              type="password"
              .value=${e.password}
              @input=${a=>{const l=a.target.value;e.onPasswordChange(l)}}
              placeholder="系统或共享密码"
            />
          </label>
          <label class="field">
            <span>默认会话键 (Session Key)</span>
            <input
              .value=${e.settings.sessionKey}
              @input=${a=>{const l=a.target.value;e.onSessionKeyChange(l)}}
            />
          </label>
        </div>
        <div class="row" style="margin-top: 14px;">
          <button class="btn" @click=${()=>e.onConnect()}>连接</button>
          <button class="btn" @click=${()=>e.onRefresh()}>刷新</button>
          <span class="muted">点击“连接”以应用连接设置。</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">快照</div>
        <div class="card-sub">最新的网关握手信息。</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">状态</div>
            <div class="stat-value ${e.connected?"ok":"warn"}">
              ${e.connected?"已连接":"未连接"}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">运行时间</div>
            <div class="stat-value">${n}</div>
          </div>
          <div class="stat">
            <div class="stat-label">心跳间隔 (Tick)</div>
            <div class="stat-value">${i}</div>
          </div>
          <div class="stat">
            <div class="stat-label">渠道上次刷新</div>
            <div class="stat-value">
              ${e.lastChannelsRefresh?D(e.lastChannelsRefresh):"无"}
            </div>
          </div>
        </div>
        ${e.lastError?o`<div class="callout danger" style="margin-top: 14px;">
              <div>${e.lastError}</div>
              ${s??""}
              ${r??""}
            </div>`:o`<div class="callout" style="margin-top: 14px;">
              使用“渠道”页面链接 WhatsApp, Telegram, Discord, Signal 或 iMessage。
            </div>`}
      </div>
    </section>

    <section class="grid grid-cols-3" style="margin-top: 18px;">
      <div class="card stat-card">
        <div class="stat-label">实例</div>
        <div class="stat-value">${e.presenceCount}</div>
        <div class="muted">过去 5 分钟内的在线心跳数量。</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">会话</div>
        <div class="stat-value">${e.sessionsCount??"无"}</div>
        <div class="muted">网关追踪的近期会话键数量。</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">定时任务</div>
        <div class="stat-value">
          ${e.cronEnabled==null?"无":e.cronEnabled?"已启用":"已禁用"}
        </div>
        <div class="muted">下次唤醒：${bo(e.cronNext)}</div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">备忘录</div>
      <div class="card-sub">远程控制设置的快速提醒。</div>
      <div class="note-grid" style="margin-top: 14px;">
        <div>
          <div class="note-title">Tailscale serve</div>
          <div class="muted">
            推荐使用 serve 模式，将网关保持在 loopback 并使用 tailnet 身份验证。
          </div>
        </div>
        <div>
          <div class="note-title">会话清理</div>
          <div class="muted">使用 /new 或 sessions.patch 重置上下文。</div>
        </div>
        <div>
          <div class="note-title">Cron 提醒</div>
          <div class="muted">对循环运行的任务使用独立的会话。</div>
        </div>
      </div>
    </section>
  `}const mh=["","off","minimal","low","medium","high"],bh=["","off","on"],yh=[{value:"",label:"继承"},{value:"off",label:"关闭 (显式)"},{value:"on",label:"开启"}],$h=[{value:"",label:"继承"},{value:"off",label:"关闭"},{value:"on",label:"开启"},{value:"stream",label:"流式推理"}],wh={"":"继承",off:"关闭",on:"开启",minimal:"极简",low:"低",medium:"中",high:"高"};function xh(e){if(!e)return"";const t=e.trim().toLowerCase();return t==="z.ai"||t==="z-ai"?"zai":t}function yo(e){return xh(e)==="zai"}function kh(e){return yo(e)?bh:mh}function Ah(e,t){return!t||!e||e==="off"?e:"on"}function Sh(e,t){return e?t&&e==="on"?"low":e:null}function _h(e){const t=e.result?.sessions??[];return o`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">会话</div>
          <div class="card-sub">活跃会话密钥及各会话覆盖设置。</div>
        </div>
        <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
          ${e.loading?"加载中...":"刷新"}
        </button>
      </div>

      <div class="filters" style="margin-top: 14px;">
        <label class="field">
          <span>活跃于（分钟内）</span>
          <input
            .value=${e.activeMinutes}
            @input=${n=>e.onFiltersChange({activeMinutes:n.target.value,limit:e.limit,includeGlobal:e.includeGlobal,includeUnknown:e.includeUnknown})}
          />
        </label>
        <label class="field">
          <span>限制数量</span>
          <input
            .value=${e.limit}
            @input=${n=>e.onFiltersChange({activeMinutes:e.activeMinutes,limit:n.target.value,includeGlobal:e.includeGlobal,includeUnknown:e.includeUnknown})}
          />
        </label>
        <label class="field checkbox">
          <span>包含全局</span>
          <input
            type="checkbox"
            .checked=${e.includeGlobal}
            @change=${n=>e.onFiltersChange({activeMinutes:e.activeMinutes,limit:e.limit,includeGlobal:n.target.checked,includeUnknown:e.includeUnknown})}
          />
        </label>
        <label class="field checkbox">
          <span>包含未知</span>
          <input
            type="checkbox"
            .checked=${e.includeUnknown}
            @change=${n=>e.onFiltersChange({activeMinutes:e.activeMinutes,limit:e.limit,includeGlobal:e.includeGlobal,includeUnknown:n.target.checked})}
          />
        </label>
      </div>

      ${e.error?o`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:h}

      <div class="muted" style="margin-top: 12px;">
        ${e.result?`存储：${e.result.path}`:""}
      </div>

      <div class="table" style="margin-top: 16px;">
        <div class="table-head">
          <div>密钥</div>
          <div>标签</div>
          <div>种类</div>
          <div>更新时间</div>
          <div>Token数</div>
          <div>思考深度</div>
          <div>详细日志</div>
          <div>推理模式</div>
          <div>操作</div>
        </div>
        ${t.length===0?o`<div class="muted">未找到会话。</div>`:t.map(n=>Th(n,e.basePath,e.onPatch,e.onDelete,e.loading))}
      </div>
    </section>
  `}function Th(e,t,n,i,s){const r=e.updatedAt?D(e.updatedAt):"无",a=e.thinkingLevel??"",l=yo(e.modelProvider),c=Ah(a,l),p=kh(e.modelProvider),d=e.verboseLevel??"",u=e.reasoningLevel??"",v=e.displayName??e.key,g=e.kind!=="global",$=g?`${Ni("chat",t)}?session=${encodeURIComponent(e.key)}`:null;return o`
    <div class="table-row">
      <div class="mono">${g?o`<a href=${$} class="session-link">${v}</a>`:v}</div>
      <div>
        <input
          .value=${e.label??""}
          ?disabled=${s}
          placeholder="(可选)"
          @change=${w=>{const k=w.target.value.trim();n(e.key,{label:k||null})}}
        />
      </div>
      <div>${e.kind}</div>
      <div>${r}</div>
      <div>${Ef(e)}</div>
      <div>
        <select
          .value=${c}
          ?disabled=${s}
          @change=${w=>{const k=w.target.value;n(e.key,{thinkingLevel:Sh(k,l)})}}
        >
          ${p.map(w=>o`<option value=${w}>${wh[w]||w}</option>`)}
        </select>
      </div>
      <div>
        <select
          .value=${d}
          ?disabled=${s}
          @change=${w=>{const k=w.target.value;n(e.key,{verboseLevel:k||null})}}
        >
          ${yh.map(w=>o`<option value=${w.value}>${w.label}</option>`)}
        </select>
      </div>
      <div>
        <select
          .value=${u}
          ?disabled=${s}
          @change=${w=>{const k=w.target.value;n(e.key,{reasoningLevel:k||null})}}
        >
          ${$h.map(w=>o`<option value=${w.value}>${w.label}</option>`)}
        </select>
      </div>
      <div>
        <button class="btn danger" ?disabled=${s} @click=${()=>i(e.key)}>
          删除
        </button>
      </div>
    </div>
  `}function Eh(e){const t=Math.max(0,e),n=Math.floor(t/1e3);if(n<60)return`${n} 秒`;const i=Math.floor(n/60);return i<60?`${i} 分钟`:`${Math.floor(i/60)} 小时`}function Re(e,t){return t?o`<div class="exec-approval-meta-row"><span>${e}</span><span>${t}</span></div>`:h}function Ch(e){const t=e.execApprovalQueue[0];if(!t)return h;const n=t.request,i=t.expiresAtMs-Date.now(),s=i>0?`剩余时间: ${Eh(i)}`:"已过期",r=e.execApprovalQueue.length;return o`
    <div class="exec-approval-overlay" role="dialog" aria-live="polite">
      <div class="exec-approval-card">
        <div class="exec-approval-header">
          <div>
            <div class="exec-approval-title">需要审批执行请求</div>
            <div class="exec-approval-sub">${s}</div>
          </div>
          ${r>1?o`<div class="exec-approval-queue">${r} 项待处理</div>`:h}
        </div>
        <div class="exec-approval-command mono">${n.command}</div>
        <div class="exec-approval-meta">
          ${Re("主机",n.host)}
          ${Re("智能体",n.agentId)}
          ${Re("会话",n.sessionKey)}
          ${Re("工作目录",n.cwd)}
          ${Re("解析路径",n.resolvedPath)}
          ${Re("安全等级",n.security)}
          ${Re("询问模式",n.ask)}
        </div>
        ${e.execApprovalError?o`<div class="exec-approval-error">${e.execApprovalError}</div>`:h}
        <div class="exec-approval-actions">
          <button
            class="btn primary"
            ?disabled=${e.execApprovalBusy}
            @click=${()=>e.handleExecApprovalDecision("allow-once")}
          >
            允许本次
          </button>
          <button
            class="btn"
            ?disabled=${e.execApprovalBusy}
            @click=${()=>e.handleExecApprovalDecision("allow-always")}
          >
            总是允许
          </button>
          <button
            class="btn danger"
            ?disabled=${e.execApprovalBusy}
            @click=${()=>e.handleExecApprovalDecision("deny")}
          >
            拒绝
          </button>
        </div>
      </div>
    </div>
  `}function Ti(e){return e?o`<div class="onboarding-message">${e}</div>`:h}function Mh(e,t){return Object.is(e,t)}function Ih(e,t,n){const i=e.options??[];return o`
    <div class="list onboarding-options">
      ${i.map(s=>{const r=Mh(s.value,t);return o`
          <div
            class="list-item list-item-clickable ${r?"list-item-selected":""}"
            @click=${()=>n(s.value)}
          >
            <div class="list-main">
              <div class="list-title">${s.label}</div>
              ${s.hint?o`<div class="list-sub">${s.hint}</div>`:h}
            </div>
            <div class="list-meta">
              <div class="pill">${r?"已选择":""}</div>
            </div>
          </div>
        `})}
    </div>
  `}function Lh(e,t,n){const i=Array.isArray(t)?t:[],s=e.options??[];return o`
    <div class="list onboarding-options">
      ${s.map(r=>{const a=i.some(l=>Object.is(l,r.value));return o`
          <div
            class="list-item list-item-clickable ${a?"list-item-selected":""}"
            @click=${()=>{const l=a?i.filter(c=>!Object.is(c,r.value)):[...i,r.value];n(l)}}
          >
            <div class="list-main">
              <div class="list-title">${r.label}</div>
              ${r.hint?o`<div class="list-sub">${r.hint}</div>`:h}
            </div>
            <div class="list-meta">
              <label class="field checkbox">
                <input type="checkbox" .checked=${a} />
                <span>${a?"已启用":""}</span>
              </label>
            </div>
          </div>
        `})}
    </div>
  `}function Rh(e,t,n){const i=typeof t=="string"?t:"",s=e.sensitive?"password":"text";return o`
    <label class="field">
      <span>${e.placeholder??""}</span>
      <input
        type=${s}
        .value=${i}
        placeholder=${e.placeholder??""}
        @input=${r=>n(r.target.value)}
      />
    </label>
  `}function Ph(e,t,n){return o`
    <label class="field checkbox">
      <input
        type="checkbox"
        .checked=${typeof t=="boolean"?t:!1}
        @change=${s=>n(s.target.checked)}
      />
      <span>${e.message??"确认"}</span>
    </label>
  `}function Oh(e,t,n){switch(e.type){case"note":case"action":case"progress":return Ti(e.message);case"select":return Ih(e,t,n);case"multiselect":return Lh(e,t,i=>n(i));case"text":return Rh(e,t,i=>n(i));case"confirm":return Ph(e,t,i=>n(i));default:return Ti(e.message)}}function Nh(e,t){const n=!e.onboardingWizardBusy,i=t.title??"",s=t.message&&(t.type==="text"||t.type==="select"||t.type==="multiselect");return o`
    <div class="card onboarding-card">
      <div class="onboarding-step-header">
        <div>
          <div class="card-title">${i||"继续设置"}</div>
          ${s?Ti(t.message):h}
        </div>
        <div class="pill">${t.type}</div>
      </div>
      <div class="onboarding-step-body">
        ${Oh(t,e.onboardingWizardDraft,e.onWizardDraftChange)}
      </div>
      <div class="onboarding-actions">
        <button class="btn" @click=${()=>e.onWizardCancel()} ?disabled=${e.onboardingWizardBusy}>
          取消
        </button>
        <button class="btn primary" @click=${()=>e.onWizardNext()} ?disabled=${!n}>
          继续
        </button>
      </div>
    </div>
  `}function Dh(e){return e.onboardingWizardStatus==="done"?o`
      <div class="card onboarding-card">
        <div class="card-title">向导已完成</div>
        <div class="card-sub">配置已经写入网关。你可以进入控制台继续使用。</div>
        <div class="onboarding-actions">
          <button class="btn primary" @click=${()=>e.onExit()}>进入控制台</button>
        </div>
      </div>
    `:e.onboardingWizardStatus==="cancelled"?o`
      <div class="card onboarding-card">
        <div class="card-title">向导已取消</div>
        <div class="card-sub">你可以稍后在设置里重新运行向导。</div>
        <div class="onboarding-actions">
          <button class="btn" @click=${()=>e.onWizardStart()}>重新开始</button>
          <button class="btn primary" @click=${()=>e.onExit()}>进入控制台</button>
        </div>
      </div>
    `:e.onboardingWizardStatus==="error"?o`
      <div class="card onboarding-card">
        <div class="card-title">向导遇到错误</div>
        <div class="card-sub">${e.onboardingWizardError??"请稍后重试。"}</div>
        <div class="onboarding-actions">
          <button class="btn" @click=${()=>e.onWizardStart()}>重试</button>
        </div>
      </div>
    `:h}function Bh(e){const t=e.onboardingWizardStep;return o`
    <div class="shell shell--onboarding">
      <main class="content onboarding-content">
        <div class="onboarding-container">
          <div class="onboarding-header">
            <div>
              <div class="onboarding-title">Clawdbot 启动向导</div>
              <div class="onboarding-sub">一步步完成本机网关配置。</div>
            </div>
            <div class="pill ${e.connected?"":"danger"}">
              ${e.connected?"网关已连接":"等待网关连接"}
            </div>
          </div>

          ${e.connected?h:o`
                <div class="card onboarding-card">
                  <div class="card-title">连接网关</div>
                  <div class="card-sub">确保网关已启动，随后点击重试。</div>
                  <div class="onboarding-actions">
                    <button class="btn primary" @click=${()=>e.onReconnect()}>
                      重新连接
                    </button>
                  </div>
                </div>
              `}

          ${e.onboardingWizardError?o`<div class="pill danger">${e.onboardingWizardError}</div>`:h}

          ${t?Nh(e,t):h}
          ${Dh(e)}

          ${!t&&e.connected&&e.onboardingWizardBusy?o`
                <div class="card onboarding-card">
                  <div class="card-title">正在准备下一步…</div>
                  <div class="card-sub">请稍候，向导正在加载。</div>
                </div>
              `:h}

          ${!t&&e.onboardingWizardStatus===null&&e.connected?o`
                <div class="card onboarding-card">
                  <div class="card-title">准备开始</div>
                  <div class="card-sub">我们将引导你配置模型、渠道与技能。</div>
                  <div class="onboarding-actions">
                    <button class="btn primary" @click=${()=>e.onWizardStart()}>
                      开始向导
                    </button>
                  </div>
                </div>
              `:h}
        </div>
      </main>
    </div>
  `}function Fh(e){const t=e.report?.skills??[],n=e.filter.trim().toLowerCase(),i=n?t.filter(s=>[s.name,s.description,s.source].join(" ").toLowerCase().includes(n)):t;return o`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">技能 (Skills)</div>
          <div class="card-sub">包含内置、托管及工作区技能。</div>
        </div>
        <button class="btn" ?disabled=${e.loading} @click=${e.onRefresh}>
          ${e.loading?"加载中…":"刷新"}
        </button>
      </div>

      <div class="filters" style="margin-top: 14px;">
        <label class="field" style="flex: 1;">
          <span>筛选</span>
          <input
            .value=${e.filter}
            @input=${s=>e.onFilterChange(s.target.value)}
            placeholder="搜索技能名称或描述"
          />
        </label>
        <div class="muted">${i.length} 个已显示</div>
      </div>

      ${e.error?o`<div class="callout danger" style="margin-top: 12px;">${e.error}</div>`:h}

      ${i.length===0?o`<div class="muted" style="margin-top: 16px;">未找到相关技能。</div>`:o`
            <div class="list" style="margin-top: 16px;">
              ${i.map(s=>zh(s,e))}
            </div>
          `}
    </section>
  `}function zh(e,t){const n=t.busyKey===e.skillKey,i=t.edits[e.skillKey]??"",s=t.messages[e.skillKey]??null,r=e.install.length>0&&e.missing.bins.length>0,a=[...e.missing.bins.map(c=>`程序:${c}`),...e.missing.env.map(c=>`变量:${c}`),...e.missing.config.map(c=>`配置:${c}`),...e.missing.os.map(c=>`系统:${c}`)],l=[];return e.disabled&&l.push("已停用"),e.blockedByAllowlist&&l.push("被白名单拦截"),o`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">
          ${e.emoji?`${e.emoji} `:""}${e.name}
        </div>
        <div class="list-sub">${oi(e.description,140)}</div>
        <div class="chip-row" style="margin-top: 6px;">
          <span class="chip">${e.source}</span>
          <span class="chip ${e.eligible?"chip-ok":"chip-warn"}">
            ${e.eligible?"符合运行条件":"运行受限制"}
          </span>
          ${e.disabled?o`<span class="chip chip-warn">已停用</span>`:h}
        </div>
        ${a.length>0?o`
              <div class="muted" style="margin-top: 6px;">
                缺失项: ${a.join(", ")}
              </div>
            `:h}
        ${l.length>0?o`
              <div class="muted" style="margin-top: 6px;">
                原因: ${l.join(", ")}
              </div>
            `:h}
      </div>
      <div class="list-meta">
        <div class="row" style="justify-content: flex-end; flex-wrap: wrap;">
          <button
            class="btn"
            ?disabled=${n}
            @click=${()=>t.onToggle(e.skillKey,e.disabled)}
          >
            ${e.disabled?"启用":"停用"}
          </button>
          ${r?o`<button
                class="btn"
                ?disabled=${n}
                @click=${()=>t.onInstall(e.skillKey,e.name,e.install[0].id)}
              >
                ${n?"正在安装…":e.install[0].label}
              </button>`:h}
        </div>
        ${s?o`<div
              class="muted"
              style="margin-top: 8px; color: ${s.kind==="error"?"var(--danger-color, #d14343)":"var(--success-color, #0a7f5a)"};"
            >
              ${s.message}
            </div>`:h}
        ${e.primaryEnv?o`
              <div class="field" style="margin-top: 10px;">
                <span>API 密钥</span>
                <input
                  type="password"
                  .value=${i}
                  @input=${c=>t.onEdit(e.skillKey,c.target.value)}
                />
              </div>
              <button
                class="btn primary"
                style="margin-top: 8px;"
                ?disabled=${n}
                @click=${()=>t.onSaveKey(e.skillKey)}
              >
                保存密钥
              </button>
            `:h}
      </div>
    </div>
  `}function Uh(e,t){const n=Ni(t,e.basePath);return o`
    <a
      href=${n}
      class="nav-item ${e.tab===t?"active":""}"
      @click=${i=>{i.defaultPrevented||i.button!==0||i.metaKey||i.ctrlKey||i.shiftKey||i.altKey||(i.preventDefault(),e.setTab(t))}}
      title=${ri(t)}
    >
      <span class="nav-item__icon" aria-hidden="true">${G[bl(t)]}</span>
      <span class="nav-item__text">${ri(t)}</span>
    </a>
  `}function Kh(e){const t=Hh(e.sessionKey,e.sessionsResult),n=e.onboarding,i=e.onboarding,s=e.onboarding?!1:e.settings.chatShowThinking,r=e.onboarding?!0:e.settings.chatFocusMode,a=o`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>`,l=o`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h3"></path><path d="M20 7V4h-3"></path><path d="M4 17v3h3"></path><path d="M20 17v3h-3"></path><circle cx="12" cy="12" r="3"></circle></svg>`;return o`
    <div class="chat-controls">
      <label class="field chat-controls__session">
        <select
          .value=${e.sessionKey}
          ?disabled=${!e.connected}
          @change=${c=>{const p=c.target.value;e.sessionKey=p,e.chatMessage="",e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:p,lastActiveSessionKey:p}),e.loadAssistantIdentity(),bd(e,p),tt(e)}}
        >
          ${Wa(t,c=>c.key,c=>o`<option value=${c.key}>
                ${c.displayName??c.key}
              </option>`)}
        </select>
      </label>
      <button
        class="btn btn--sm btn--icon"
        ?disabled=${e.chatLoading||!e.connected}
        @click=${()=>{e.resetToolStream(),tt(e)}}
        title="刷新对话历史"
      >
        ${a}
      </button>
      <span class="chat-controls__separator">|</span>
      <button
        class="btn btn--sm btn--icon ${s?"active":""}"
        ?disabled=${n}
        @click=${()=>{n||e.applySettings({...e.settings,chatShowThinking:!e.settings.chatShowThinking})}}
        aria-pressed=${s}
        title=${n?"设置向导期间禁用":"切换智能体思考/工作输出"}
      >
        ${G.brain}
      </button>
      <button
        class="btn btn--sm btn--icon ${r?"active":""}"
        ?disabled=${i}
        @click=${()=>{i||e.applySettings({...e.settings,chatFocusMode:!e.settings.chatFocusMode})}}
        aria-pressed=${r}
        title=${i?"设置向导期间持用":"切换专注模式 (隐藏侧边栏和页眉)"}
      >
        ${l}
      </button>
    </div>
  `}function Hh(e,t){const n=new Set,i=[],s=t?.sessions?.find(r=>r.key===e);if(n.add(e),i.push({key:e,displayName:s?.displayName}),t?.sessions)for(const r of t.sessions)n.has(r.key)||(n.add(r.key),i.push({key:r.key,displayName:r.displayName}));return i}const Wh=["system","light","dark"];function jh(e){const t=Math.max(0,Wh.indexOf(e.theme)),n=i=>s=>{const a={element:s.currentTarget};(s.clientX||s.clientY)&&(a.pointerClientX=s.clientX,a.pointerClientY=s.clientY),e.setTheme(i,a)};return o`
    <div class="theme-toggle" style="--theme-index: ${t};">
      <div class="theme-toggle__track" role="group" aria-label="主题切换">
        <span class="theme-toggle__indicator"></span>
        <button
          class="theme-toggle__button ${e.theme==="system"?"active":""}"
          @click=${n("system")}
          aria-pressed=${e.theme==="system"}
          aria-label="系统主题"
          title="自动"
        >
          ${Gh()}
        </button>
        <button
          class="theme-toggle__button ${e.theme==="light"?"active":""}"
          @click=${n("light")}
          aria-pressed=${e.theme==="light"}
          aria-label="浅色主题"
          title="浅色"
        >
          ${qh()}
        </button>
        <button
          class="theme-toggle__button ${e.theme==="dark"?"active":""}"
          @click=${n("dark")}
          aria-pressed=${e.theme==="dark"}
          aria-label="深色主题"
          title="深色"
        >
          ${Vh()}
        </button>
      </div>
    </div>
  `}function qh(){return o`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  `}function Vh(){return o`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
      ></path>
    </svg>
  `}function Gh(){return o`
    <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2"></rect>
      <line x1="8" x2="16" y1="21" y2="21"></line>
      <line x1="12" x2="12" y1="17" y2="21"></line>
    </svg>
  `}const Qh=/^data:/i,Zh=/^https?:\/\//i;function Yh(e){const t=e.agentsList?.agents??[],i=ia(e.sessionKey)?.agentId??e.agentsList?.defaultId??"main",r=t.find(l=>l.id===i)?.identity,a=r?.avatarUrl??r?.avatar;if(a)return Qh.test(a)||Zh.test(a)?a:r?.avatarUrl}function Xh(e){if(e.onboarding)return Bh({connected:e.connected,basePath:e.basePath,onboardingWizardStep:e.onboardingWizardStep,onboardingWizardStatus:e.onboardingWizardStatus,onboardingWizardError:e.onboardingWizardError,onboardingWizardBusy:e.onboardingWizardBusy,onboardingWizardDraft:e.onboardingWizardDraft,onWizardStart:()=>{e.handleOnboardingStart()},onWizardNext:()=>{e.handleOnboardingNext()},onWizardCancel:()=>{e.handleOnboardingCancel()},onWizardDraftChange:d=>e.handleOnboardingDraftChange(d),onReconnect:()=>e.connect(),onExit:()=>e.handleOnboardingExit()});const t=e.presenceEntries.length,n=e.sessionsResult?.count??null,i=e.cronStatus?.nextWakeAtMs??null,s=e.connected?null:"已断开与网关的连接。",r=e.tab==="chat",a=r&&(e.settings.chatFocusMode||e.onboarding),l=e.onboarding?!1:e.settings.chatShowThinking,c=Yh(e),p=e.chatAvatarUrl??c??null;return o`
    <div class="shell ${r?"shell--chat":""} ${a?"shell--chat-focus":""} ${e.settings.navCollapsed?"shell--nav-collapsed":""} ${e.onboarding?"shell--onboarding":""}">
      <header class="topbar">
        <div class="topbar-left">
          <button
            class="nav-collapse-toggle"
            @click=${()=>e.applySettings({...e.settings,navCollapsed:!e.settings.navCollapsed})}
            title="${e.settings.navCollapsed?"展开侧边栏":"折叠侧边栏"}"
            aria-label="${e.settings.navCollapsed?"展开侧边栏":"折叠侧边栏"}"
          >
            <span class="nav-collapse-toggle__icon">${G.menu}</span>
          </button>
          <div class="brand">
            <div class="brand-logo">
              <img src="https://mintcdn.com/clawdhub/4rYvG-uuZrMK_URE/assets/pixel-lobster.svg?fit=max&auto=format&n=4rYvG-uuZrMK_URE&q=85&s=da2032e9eac3b5d9bfe7eb96ca6a8a26" alt="Clawdbot" />
            </div>
            <div class="brand-text">
              <div class="brand-title">CLAWDBOT</div>
              <div class="brand-sub">网关控制面板</div>
            </div>
          </div>
        </div>
        <div class="topbar-status">
          <div class="pill">
            <span class="statusDot ${e.connected?"ok":""}"></span>
            <span>运行状态</span>
            <span class="mono">${e.connected?"良好":"离线"}</span>
          </div>
          ${jh(e)}
        </div>
      </header>
      <aside class="nav ${e.settings.navCollapsed?"nav--collapsed":""}">
        ${vl.map(d=>{const u=e.settings.navGroupsCollapsed[d.label]??!1,v=d.tabs.some(g=>g===e.tab);return o`
            <div class="nav-group ${u&&!v?"nav-group--collapsed":""}">
              <button
                class="nav-label"
                @click=${()=>{const g={...e.settings.navGroupsCollapsed};g[d.label]=!u,e.applySettings({...e.settings,navGroupsCollapsed:g})}}
                aria-expanded=${!u}
              >
                <span class="nav-label__text">${d.label}</span>
                <span class="nav-label__chevron">${u?"+":"−"}</span>
              </button>
              <div class="nav-group__items">
                ${d.tabs.map(g=>Uh(e,g))}
              </div>
            </div>
          `})}
        <div class="nav-group nav-group--links">
          <div class="nav-label nav-label--static">
            <span class="nav-label__text">相关资源</span>
          </div>
          <div class="nav-group__items">
            <a
              class="nav-item nav-item--external"
              href="https://docs.clawd.bot"
              target="_blank"
              rel="noreferrer"
              title="查看文档（在新标签页中打开）"
            >
              <span class="nav-item__icon" aria-hidden="true">${G.book}</span>
              <span class="nav-item__text">官方文档</span>
            </a>
          </div>
        </div>
      </aside>
      <main class="content ${r?"content--chat":""}">
        <section class="content-header">
          <div>
            <div class="page-title">${ri(e.tab)}</div>
            <div class="page-sub">${yl(e.tab)}</div>
          </div>
          <div class="page-meta">
            ${e.lastError?o`<div class="pill danger">${e.lastError}</div>`:h}
            ${r?Kh(e):h}
          </div>
        </section>

        ${e.tab==="overview"?vh({connected:e.connected,hello:e.hello,settings:e.settings,password:e.password,lastError:e.lastError,presenceCount:t,sessionsCount:n,cronEnabled:e.cronStatus?.enabled??null,cronNext:i,lastChannelsRefresh:e.channelsLastSuccess,onSettingsChange:d=>e.applySettings(d),onPasswordChange:d=>e.password=d,onSessionKeyChange:d=>{e.sessionKey=d,e.chatMessage="",e.resetToolStream(),e.applySettings({...e.settings,sessionKey:d,lastActiveSessionKey:d}),e.loadAssistantIdentity()},onConnect:()=>e.connect(),onRefresh:()=>e.loadOverview()}):h}

        ${e.tab==="channels"?vf({connected:e.connected,loading:e.channelsLoading,snapshot:e.channelsSnapshot,lastError:e.channelsError,lastSuccessAt:e.channelsLastSuccess,whatsappMessage:e.whatsappLoginMessage,whatsappQrDataUrl:e.whatsappLoginQrDataUrl,whatsappConnected:e.whatsappLoginConnected,whatsappBusy:e.whatsappBusy,configSchema:e.configSchema,configSchemaLoading:e.configSchemaLoading,configForm:e.configForm,configUiHints:e.configUiHints,configSaving:e.configSaving,configFormDirty:e.configFormDirty,nostrProfileFormState:e.nostrProfileFormState,nostrProfileAccountId:e.nostrProfileAccountId,onRefresh:d=>le(e,d),onWhatsAppStart:d=>e.handleWhatsAppStart(d),onWhatsAppWait:()=>e.handleWhatsAppWait(),onWhatsAppLogout:()=>e.handleWhatsAppLogout(),onConfigPatch:(d,u)=>yt(e,d,u),onConfigSave:()=>e.handleChannelConfigSave(),onConfigReload:()=>e.handleChannelConfigReload(),onNostrProfileEdit:(d,u)=>e.handleNostrProfileEdit(d,u),onNostrProfileCancel:()=>e.handleNostrProfileCancel(),onNostrProfileFieldChange:(d,u)=>e.handleNostrProfileFieldChange(d,u),onNostrProfileSave:()=>e.handleNostrProfileSave(),onNostrProfileImport:()=>e.handleNostrProfileImport(),onNostrProfileToggleAdvanced:()=>e.handleNostrProfileToggleAdvanced()}):h}

        ${e.tab==="instances"?zf({loading:e.presenceLoading,entries:e.presenceEntries,lastError:e.presenceError,statusMessage:e.presenceStatus,onRefresh:()=>Vi(e)}):h}

        ${e.tab==="sessions"?_h({loading:e.sessionsLoading,result:e.sessionsResult,error:e.sessionsError,activeMinutes:e.sessionsFilterActive,limit:e.sessionsFilterLimit,includeGlobal:e.sessionsIncludeGlobal,includeUnknown:e.sessionsIncludeUnknown,basePath:e.basePath,onFiltersChange:d=>{e.sessionsFilterActive=d.activeMinutes,e.sessionsFilterLimit=d.limit,e.sessionsIncludeGlobal=d.includeGlobal,e.sessionsIncludeUnknown=d.includeUnknown},onRefresh:()=>at(e),onPatch:(d,u)=>Pl(e,d,u),onDelete:d=>Ol(e,d)}):h}

        ${e.tab==="cron"?Of({loading:e.cronLoading,status:e.cronStatus,jobs:e.cronJobs,error:e.cronError,busy:e.cronBusy,form:e.cronForm,channels:e.channelsSnapshot?.channelMeta?.length?e.channelsSnapshot.channelMeta.map(d=>d.id):e.channelsSnapshot?.channelOrder??[],channelLabels:e.channelsSnapshot?.channelLabels??{},channelMeta:e.channelsSnapshot?.channelMeta??[],runsJobId:e.cronRunsJobId,runs:e.cronRuns,onFormChange:d=>e.cronForm={...e.cronForm,...d},onRefresh:()=>e.loadCron(),onAdd:()=>sc(e),onToggle:(d,u)=>rc(e,d,u),onRun:d=>ac(e,d),onRemove:d=>oc(e,d),onLoadRuns:d=>ha(e,d)}):h}

        ${e.tab==="skills"?Fh({loading:e.skillsLoading,report:e.skillsReport,error:e.skillsError,filter:e.skillsFilter,edits:e.skillEdits,messages:e.skillMessages,busyKey:e.skillsBusyKey,onFilterChange:d=>e.skillsFilter=d,onRefresh:()=>Lt(e,{clearMessages:!0}),onToggle:(d,u)=>td(e,d,u),onEdit:(d,u)=>ed(e,d,u),onSaveKey:d=>nd(e,d),onInstall:(d,u,v)=>id(e,d,u,v)}):h}

        ${e.tab==="nodes"?jf({loading:e.nodesLoading,nodes:e.nodes,devicesLoading:e.devicesLoading,devicesError:e.devicesError,devicesList:e.devicesList,configForm:e.configForm??e.configSnapshot?.config,configLoading:e.configLoading,configSaving:e.configSaving,configDirty:e.configFormDirty,configFormMode:e.configFormMode,execApprovalsLoading:e.execApprovalsLoading,execApprovalsSaving:e.execApprovalsSaving,execApprovalsDirty:e.execApprovalsDirty,execApprovalsSnapshot:e.execApprovalsSnapshot,execApprovalsForm:e.execApprovalsForm,execApprovalsSelectedAgent:e.execApprovalsSelectedAgent,execApprovalsTarget:e.execApprovalsTarget,execApprovalsTargetNodeId:e.execApprovalsTargetNodeId,onRefresh:()=>mn(e),onDevicesRefresh:()=>Ee(e),onDeviceApprove:d=>Wc(e,d),onDeviceReject:d=>jc(e,d),onDeviceRotate:(d,u,v)=>qc(e,{deviceId:d,role:u,scopes:v}),onDeviceRevoke:(d,u)=>Vc(e,{deviceId:d,role:u}),onLoadConfig:()=>ye(e),onLoadExecApprovals:()=>{const d=e.execApprovalsTarget==="node"&&e.execApprovalsTargetNodeId?{kind:"node",nodeId:e.execApprovalsTargetNodeId}:{kind:"gateway"};return qi(e,d)},onBindDefault:d=>{d?yt(e,["tools","exec","node"],d):er(e,["tools","exec","node"])},onBindAgent:(d,u)=>{const v=["agents","list",d,"tools","exec","node"];u?yt(e,v,u):er(e,v)},onSaveBindings:()=>di(e),onExecApprovalsTargetChange:(d,u)=>{e.execApprovalsTarget=d,e.execApprovalsTargetNodeId=u,e.execApprovalsSnapshot=null,e.execApprovalsForm=null,e.execApprovalsDirty=!1,e.execApprovalsSelectedAgent=null},onExecApprovalsSelectAgent:d=>{e.execApprovalsSelectedAgent=d},onExecApprovalsPatch:(d,u)=>Xc(e,d,u),onExecApprovalsRemove:d=>Jc(e,d),onSaveExecApprovals:()=>{const d=e.execApprovalsTarget==="node"&&e.execApprovalsTargetNodeId?{kind:"node",nodeId:e.execApprovalsTargetNodeId}:{kind:"gateway"};return Yc(e,d)}}):h}

        ${e.tab==="chat"?Lp({sessionKey:e.sessionKey,onSessionKeyChange:d=>{e.sessionKey=d,e.chatMessage="",e.chatAttachments=[],e.chatStream=null,e.chatStreamStartedAt=null,e.chatRunId=null,e.chatQueue=[],e.resetToolStream(),e.resetChatScroll(),e.applySettings({...e.settings,sessionKey:d,lastActiveSessionKey:d}),e.loadAssistantIdentity(),tt(e),gi(e)},thinkingLevel:e.chatThinkingLevel,showThinking:l,loading:e.chatLoading,sending:e.chatSending,compactionStatus:e.compactionStatus,assistantAvatarUrl:p,messages:e.chatMessages,toolMessages:e.chatToolMessages,stream:e.chatStream,streamStartedAt:e.chatStreamStartedAt,draft:e.chatMessage,queue:e.chatQueue,connected:e.connected,canSend:e.connected,disabledReason:s,error:e.lastError,sessions:e.sessionsResult,focusMode:a,onRefresh:()=>(e.resetToolStream(),Promise.all([tt(e),gi(e)])),onToggleFocusMode:()=>{e.onboarding||e.applySettings({...e.settings,chatFocusMode:!e.settings.chatFocusMode})},onChatScroll:d=>e.handleChatScroll(d),onDraftChange:d=>e.chatMessage=d,attachments:e.chatAttachments,onAttachmentsChange:d=>e.chatAttachments=d,onSend:()=>e.handleSendChat(),canAbort:!!e.chatRunId,onAbort:()=>{e.handleAbortChat()},onQueueRemove:d=>e.removeQueuedMessage(d),onNewSession:()=>e.handleSendChat("/new",{restoreDraft:!0}),sidebarOpen:e.sidebarOpen,sidebarContent:e.sidebarContent,sidebarError:e.sidebarError,splitRatio:e.splitRatio,onOpenSidebar:d=>e.handleOpenSidebar(d),onCloseSidebar:()=>e.handleCloseSidebar(),onSplitRatioChange:d=>e.handleSplitRatioChange(d),assistantName:e.assistantName,assistantAvatar:e.assistantAvatar}):h}

        ${e.tab==="config"?Yp({raw:e.configRaw,originalRaw:e.configRawOriginal,valid:e.configValid,issues:e.configIssues,loading:e.configLoading,saving:e.configSaving,applying:e.configApplying,updating:e.updateRunning,connected:e.connected,schema:e.configSchema,schemaLoading:e.configSchemaLoading,uiHints:e.configUiHints,formMode:e.configFormMode,formValue:e.configForm,originalValue:e.configFormOriginal,searchQuery:e.configSearchQuery,activeSection:e.configActiveSection,activeSubsection:e.configActiveSubsection,onRawChange:d=>{e.configRaw=d},onFormModeChange:d=>e.configFormMode=d,onFormPatch:(d,u)=>yt(e,d,u),onSearchChange:d=>e.configSearchQuery=d,onSectionChange:d=>{e.configActiveSection=d,e.configActiveSubsection=null},onSubsectionChange:d=>e.configActiveSubsection=d,onReload:()=>ye(e),onSave:()=>di(e),onApply:()=>Jl(e),onUpdate:()=>ec(e),onDiscoverModels:d=>e.handleDiscoverModels(d)}):h}

        ${e.tab==="debug"?Ff({loading:e.debugLoading,status:e.debugStatus,health:e.debugHealth,models:e.debugModels,heartbeat:e.debugHeartbeat,eventLog:e.eventLog,callMethod:e.debugCallMethod,callParams:e.debugCallParams,callResult:e.debugCallResult,callError:e.debugCallError,onCallMethodChange:d=>e.debugCallMethod=d,onCallParamsChange:d=>e.debugCallParams=d,onRefresh:()=>gn(e),onCall:()=>uc(e)}):h}

        ${e.tab==="logs"?Wf({loading:e.logsLoading,error:e.logsError,file:e.logsFile,entries:e.logsEntries,filterText:e.logsFilterText,levelFilters:e.logsLevelFilters,autoFollow:e.logsAutoFollow,truncated:e.logsTruncated,onFilterTextChange:d=>e.logsFilterText=d,onLevelToggle:(d,u)=>{e.logsLevelFilters={...e.logsLevelFilters,[d]:u}},onToggleAutoFollow:d=>e.logsAutoFollow=d,onRefresh:()=>Fi(e,{reset:!0}),onExport:(d,u)=>e.exportLogs(d,u),onScroll:d=>e.handleLogsScroll(d)}):h}
      </main>
      ${Ch(e)}
    </div>
  `}const Jh={trace:!0,debug:!0,info:!0,warn:!0,error:!0,fatal:!0},eg={name:"",description:"",agentId:"",enabled:!0,scheduleKind:"every",scheduleAt:"",everyAmount:"30",everyUnit:"minutes",cronExpr:"0 7 * * *",cronTz:"",sessionTarget:"main",wakeMode:"next-heartbeat",payloadKind:"systemEvent",payloadText:"",deliver:!1,channel:"last",to:"",timeoutSeconds:"",postToMainPrefix:""};async function tg(e){if(!(!e.client||!e.connected)&&!e.agentsLoading){e.agentsLoading=!0,e.agentsError=null;try{const t=await e.client.request("agents.list",{});t&&(e.agentsList=t)}catch(t){e.agentsError=String(t)}finally{e.agentsLoading=!1}}}const $o={WEBCHAT_UI:"webchat-ui",CONTROL_UI:"clawdbot-control-ui",WEBCHAT:"webchat",CLI:"cli",GATEWAY_CLIENT:"gateway-client",MACOS_APP:"clawdbot-macos",IOS_APP:"clawdbot-ios",ANDROID_APP:"clawdbot-android",NODE_HOST:"node-host",TEST:"test",FINGERPRINT:"fingerprint",PROBE:"clawdbot-probe"},qr=$o,Ei={WEBCHAT:"webchat",CLI:"cli",UI:"ui",BACKEND:"backend",NODE:"node",PROBE:"probe",TEST:"test"};new Set(Object.values($o));new Set(Object.values(Ei));function ng(e){const t=e.version??(e.nonce?"v2":"v1"),n=e.scopes.join(","),i=e.token??"",s=[t,e.deviceId,e.clientId,e.clientMode,e.role,n,String(e.signedAtMs),i];return t==="v2"&&s.push(e.nonce??""),s.join("|")}const ig=4008;class sg{constructor(t){this.opts=t,this.ws=null,this.pending=new Map,this.closed=!1,this.lastSeq=null,this.connectNonce=null,this.connectSent=!1,this.connectTimer=null,this.backoffMs=800}start(){this.closed=!1,this.connect()}stop(){this.closed=!0,this.ws?.close(),this.ws=null,this.flushPending(new Error("gateway client stopped"))}get connected(){return this.ws?.readyState===WebSocket.OPEN}connect(){this.closed||(this.ws=new WebSocket(this.opts.url),this.ws.onopen=()=>this.queueConnect(),this.ws.onmessage=t=>this.handleMessage(String(t.data??"")),this.ws.onclose=t=>{const n=String(t.reason??"");this.ws=null,this.flushPending(new Error(`gateway closed (${t.code}): ${n}`)),this.opts.onClose?.({code:t.code,reason:n}),this.scheduleReconnect()},this.ws.onerror=()=>{})}scheduleReconnect(){if(this.closed)return;const t=this.backoffMs;this.backoffMs=Math.min(this.backoffMs*1.7,15e3),window.setTimeout(()=>this.connect(),t)}flushPending(t){for(const[,n]of this.pending)n.reject(t);this.pending.clear()}async sendConnect(){if(this.connectSent)return;this.connectSent=!0,this.connectTimer!==null&&(window.clearTimeout(this.connectTimer),this.connectTimer=null);const t=typeof crypto<"u"&&!!crypto.subtle,n=["operator.admin","operator.approvals","operator.pairing"],i="operator";let s=null,r=!1,a=this.opts.token;if(t){s=await Hi();const d=Hc({deviceId:s.deviceId,role:i})?.token;a=d??this.opts.token,r=!!(d&&this.opts.token)}const l=a||this.opts.password?{token:a,password:this.opts.password}:void 0;let c;if(t&&s){const d=Date.now(),u=this.connectNonce??void 0,v=ng({deviceId:s.deviceId,clientId:this.opts.clientName??qr.CONTROL_UI,clientMode:this.opts.mode??Ei.WEBCHAT,role:i,scopes:n,signedAtMs:d,token:a??null,nonce:u}),g=await Uc(s.privateKey,v);c={id:s.deviceId,publicKey:s.publicKey,signature:g,signedAt:d,nonce:u}}const p={minProtocol:3,maxProtocol:3,client:{id:this.opts.clientName??qr.CONTROL_UI,version:this.opts.clientVersion??"dev",platform:this.opts.platform??navigator.platform??"web",mode:this.opts.mode??Ei.WEBCHAT,instanceId:this.opts.instanceId},role:i,scopes:n,device:c,caps:[],auth:l,userAgent:navigator.userAgent,locale:navigator.language};this.request("connect",p).then(d=>{d?.auth?.deviceToken&&s&&Ia({deviceId:s.deviceId,role:d.auth.role??i,token:d.auth.deviceToken,scopes:d.auth.scopes??[]}),this.backoffMs=800,this.opts.onHello?.(d)}).catch(()=>{r&&s&&La({deviceId:s.deviceId,role:i}),this.ws?.close(ig,"connect failed")})}handleMessage(t){let n;try{n=JSON.parse(t)}catch{return}const i=n;if(i.type==="event"){const s=n;if(s.event==="connect.challenge"){const a=s.payload,l=a&&typeof a.nonce=="string"?a.nonce:null;l&&(this.connectNonce=l,this.sendConnect());return}const r=typeof s.seq=="number"?s.seq:null;r!==null&&(this.lastSeq!==null&&r>this.lastSeq+1&&this.opts.onGap?.({expected:this.lastSeq+1,received:r}),this.lastSeq=r);try{this.opts.onEvent?.(s)}catch(a){console.error("[gateway] event handler error:",a)}return}if(i.type==="res"){const s=n,r=this.pending.get(s.id);if(!r)return;this.pending.delete(s.id),s.ok?r.resolve(s.payload):r.reject(new Error(s.error?.message??"request failed"));return}}request(t,n){if(!this.ws||this.ws.readyState!==WebSocket.OPEN)return Promise.reject(new Error("gateway not connected"));const i=Di(),s={type:"req",id:i,method:t,params:n},r=new Promise((a,l)=>{this.pending.set(i,{resolve:c=>a(c),reject:l})});return this.ws.send(JSON.stringify(s)),r}queueConnect(){this.connectNonce=null,this.connectSent=!1,this.connectTimer!==null&&window.clearTimeout(this.connectTimer),this.connectTimer=window.setTimeout(()=>{this.sendConnect()},750)}}function Ci(e){return typeof e=="object"&&e!==null}function rg(e){if(!Ci(e))return null;const t=typeof e.id=="string"?e.id.trim():"",n=e.request;if(!t||!Ci(n))return null;const i=typeof n.command=="string"?n.command.trim():"";if(!i)return null;const s=typeof e.createdAtMs=="number"?e.createdAtMs:0,r=typeof e.expiresAtMs=="number"?e.expiresAtMs:0;return!s||!r?null:{id:t,request:{command:i,cwd:typeof n.cwd=="string"?n.cwd:null,host:typeof n.host=="string"?n.host:null,security:typeof n.security=="string"?n.security:null,ask:typeof n.ask=="string"?n.ask:null,agentId:typeof n.agentId=="string"?n.agentId:null,resolvedPath:typeof n.resolvedPath=="string"?n.resolvedPath:null,sessionKey:typeof n.sessionKey=="string"?n.sessionKey:null},createdAtMs:s,expiresAtMs:r}}function ag(e){if(!Ci(e))return null;const t=typeof e.id=="string"?e.id.trim():"";return t?{id:t,decision:typeof e.decision=="string"?e.decision:null,resolvedBy:typeof e.resolvedBy=="string"?e.resolvedBy:null,ts:typeof e.ts=="number"?e.ts:null}:null}function wo(e){const t=Date.now();return e.filter(n=>n.expiresAtMs>t)}function og(e,t){const n=wo(e).filter(i=>i.id!==t.id);return n.push(t),n}function Vr(e,t){return wo(e).filter(n=>n.id!==t)}async function xo(e,t){if(!e.client||!e.connected)return;const n=e.sessionKey.trim(),i=n?{sessionKey:n}:{};try{const s=await e.client.request("agent.identity.get",i);if(!s)return;const r=si(s);e.assistantName=r.name,e.assistantAvatar=r.avatar,e.assistantAgentId=r.agentId??null}catch{}}function ti(e,t){const n=(e??"").trim(),i=t.mainSessionKey?.trim();if(!i)return n;if(!n)return i;const s=t.mainKey?.trim()||"main",r=t.defaultAgentId?.trim();return n==="main"||n===s||r&&(n===`agent:${r}:main`||n===`agent:${r}:${s}`)?i:n}function lg(e,t){if(!t?.mainSessionKey)return;const n=ti(e.sessionKey,t),i=ti(e.settings.sessionKey,t),s=ti(e.settings.lastActiveSessionKey,t),r=n||i||e.sessionKey,a={...e.settings,sessionKey:i||r,lastActiveSessionKey:s||r},l=a.sessionKey!==e.settings.sessionKey||a.lastActiveSessionKey!==e.settings.lastActiveSessionKey;r!==e.sessionKey&&(e.sessionKey=r),l&&Ae(e,a)}function ko(e){e.lastError=null,e.hello=null,e.connected=!1,e.execApprovalQueue=[],e.execApprovalError=null,e.client?.stop(),e.client=new sg({url:e.settings.gatewayUrl,token:e.settings.token.trim()?e.settings.token:void 0,password:e.password.trim()?e.password:void 0,clientName:"clawdbot-control-ui",mode:"webchat",onHello:t=>{e.connected=!0,e.lastError=null,e.hello=t,ug(e,t),xo(e),tg(e),mn(e,{quiet:!0}),Ee(e,{quiet:!0}),Ji(e)},onClose:({code:t,reason:n})=>{e.connected=!1,t!==1012&&(e.lastError=`disconnected (${t}): ${n||"no reason"}`)},onEvent:t=>cg(e,t),onGap:({expected:t,received:n})=>{e.lastError=`event gap detected (expected seq ${t}, got ${n}); refresh recommended`}}),e.client.start()}function cg(e,t){try{dg(e,t)}catch(n){console.error("[gateway] handleGatewayEvent error:",t.event,n)}}function dg(e,t){if(e.eventLogBuffer=[{ts:Date.now(),event:t.event,payload:t.payload},...e.eventLogBuffer].slice(0,250),e.tab==="debug"&&(e.eventLog=e.eventLogBuffer),t.event==="agent"){if(e.onboarding)return;jl(e,t.payload);return}if(t.event==="chat"){const n=t.payload;n?.sessionKey&&Ra(e,n.sessionKey);const i=Rl(e,n);(i==="final"||i==="error"||i==="aborted")&&(Bi(e),Sd(e)),i==="final"&&tt(e);return}if(t.event==="presence"){const n=t.payload;n?.presence&&Array.isArray(n.presence)&&(e.presenceEntries=n.presence,e.presenceError=null,e.presenceStatus=null);return}if(t.event==="cron"&&e.tab==="cron"&&es(e),(t.event==="device.pair.requested"||t.event==="device.pair.resolved")&&Ee(e,{quiet:!0}),t.event==="exec.approval.requested"){const n=rg(t.payload);if(n){e.execApprovalQueue=og(e.execApprovalQueue,n),e.execApprovalError=null;const i=Math.max(0,n.expiresAtMs-Date.now()+500);window.setTimeout(()=>{e.execApprovalQueue=Vr(e.execApprovalQueue,n.id)},i)}return}if(t.event==="exec.approval.resolved"){const n=ag(t.payload);n&&(e.execApprovalQueue=Vr(e.execApprovalQueue,n.id))}}function ug(e,t){const n=t.snapshot;n?.presence&&Array.isArray(n.presence)&&(e.presenceEntries=n.presence),n?.health&&(e.debugHealth=n.health),n?.sessionDefaults&&lg(e,n.sessionDefaults)}function pg(e){e.basePath=pd(),vd(e,!0),fd(e),hd(e),window.addEventListener("popstate",e.popStateHandler),cd(e),ko(e),od(e),e.tab==="logs"&&Qi(e),e.tab==="debug"&&Yi(e)}function fg(e){Zl(e)}function hg(e){window.removeEventListener("popstate",e.popStateHandler),ld(e),Zi(e),Xi(e),gd(e),e.topbarObserver?.disconnect(),e.topbarObserver=null}function gg(e,t){if(e.tab==="chat"&&(t.has("chatMessages")||t.has("chatToolMessages")||t.has("chatStream")||t.has("chatLoading")||t.has("tab"))){const n=t.has("tab"),i=t.has("chatLoading")&&t.get("chatLoading")===!0&&e.chatLoading===!1;fn(e,n||i||!e.chatHasAutoScrolled)}e.tab==="logs"&&(t.has("logsEntries")||t.has("logsAutoFollow")||t.has("tab"))&&e.logsAutoFollow&&e.logsAtBottom&&da(e,t.has("tab")||t.has("logsAutoFollow"))}function vg(e){return e?e.type==="select"?e.initialValue!==void 0?e.initialValue:e.options?.[0]?.value??null:e.type==="multiselect"?Array.isArray(e.initialValue)?e.initialValue:[]:e.type==="confirm"?typeof e.initialValue=="boolean"?e.initialValue:!1:e.type==="text"?typeof e.initialValue=="string"?e.initialValue:"":e.initialValue??null:null}function Mt(e,t){e.onboardingWizardStep=t,e.onboardingWizardDraft=vg(t)}function mg(e,t){e.onboardingWizardSessionId=t.sessionId,e.onboardingWizardStatus=t.status,e.onboardingWizardError=t.error??null,t.done?(e.onboardingWizardSessionId=null,Mt(e,null)):Mt(e,t.step??null)}function bg(e,t){e.onboardingWizardStatus=t.status,e.onboardingWizardError=t.error??null,t.done?(e.onboardingWizardSessionId=null,Mt(e,null)):Mt(e,t.step??null)}async function yg(e,t={mode:"local"}){if(!(!e.client||!e.connected)){e.onboardingWizardBusy=!0,e.onboardingWizardError=null;try{const n=await e.client.request("wizard.start",t);mg(e,n)}catch(n){e.onboardingWizardError=String(n)}finally{e.onboardingWizardBusy=!1}}}async function $g(e,t){if(!e.client||!e.connected)return;const n=e.onboardingWizardSessionId,i=e.onboardingWizardStep;if(!(!n||!i)){e.onboardingWizardBusy=!0,e.onboardingWizardError=null;try{const s=await e.client.request("wizard.next",{sessionId:n,answer:{stepId:i.id,value:t}});bg(e,s)}catch(s){e.onboardingWizardError=String(s)}finally{e.onboardingWizardBusy=!1}}}async function wg(e){if(!e.client||!e.connected)return;const t=e.onboardingWizardSessionId;if(t){e.onboardingWizardBusy=!0,e.onboardingWizardError=null;try{const n=await e.client.request("wizard.cancel",{sessionId:t});e.onboardingWizardStatus=n.status,e.onboardingWizardError=n.error??null,e.onboardingWizardSessionId=null,Mt(e,null)}catch(n){e.onboardingWizardError=String(n)}finally{e.onboardingWizardBusy=!1}}}async function xg(e,t){await lc(e,t),await le(e,!0)}async function kg(e){await cc(e),await le(e,!0)}async function Ag(e){await dc(e),await le(e,!0)}async function Sg(e){await di(e),await ye(e),await le(e,!0)}async function _g(e){await ye(e),await le(e,!0)}function Tg(e){if(!Array.isArray(e))return{};const t={};for(const n of e){if(typeof n!="string")continue;const[i,...s]=n.split(":");if(!i||s.length===0)continue;const r=i.trim(),a=s.join(":").trim();r&&a&&(t[r]=a)}return t}function Ao(e){return(e.channelsSnapshot?.channelAccounts?.nostr??[])[0]?.accountId??e.nostrProfileAccountId??"default"}function So(e,t=""){return`/api/channels/nostr/${encodeURIComponent(e)}/profile${t}`}function Eg(e,t,n){e.nostrProfileAccountId=t,e.nostrProfileFormState=df(n??void 0)}function Cg(e){e.nostrProfileFormState=null,e.nostrProfileAccountId=null}function Mg(e,t,n){const i=e.nostrProfileFormState;i&&(e.nostrProfileFormState={...i,values:{...i.values,[t]:n},fieldErrors:{...i.fieldErrors,[t]:""}})}function Ig(e){const t=e.nostrProfileFormState;t&&(e.nostrProfileFormState={...t,showAdvanced:!t.showAdvanced})}async function Lg(e){const t=e.nostrProfileFormState;if(!t||t.saving)return;const n=Ao(e);e.nostrProfileFormState={...t,saving:!0,error:null,success:null,fieldErrors:{}};try{const i=await fetch(So(n),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(t.values)}),s=await i.json().catch(()=>null);if(!i.ok||s?.ok===!1||!s){const r=s?.error??`Profile update failed (${i.status})`;e.nostrProfileFormState={...t,saving:!1,error:r,success:null,fieldErrors:Tg(s?.details)};return}if(!s.persisted){e.nostrProfileFormState={...t,saving:!1,error:"Profile publish failed on all relays.",success:null};return}e.nostrProfileFormState={...t,saving:!1,error:null,success:"Profile published to relays.",fieldErrors:{},original:{...t.values}},await le(e,!0)}catch(i){e.nostrProfileFormState={...t,saving:!1,error:`Profile update failed: ${String(i)}`,success:null}}}async function Rg(e){const t=e.nostrProfileFormState;if(!t||t.importing)return;const n=Ao(e);e.nostrProfileFormState={...t,importing:!0,error:null,success:null};try{const i=await fetch(So(n,"/import"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({autoMerge:!0})}),s=await i.json().catch(()=>null);if(!i.ok||s?.ok===!1||!s){const c=s?.error??`Profile import failed (${i.status})`;e.nostrProfileFormState={...t,importing:!1,error:c,success:null};return}const r=s.merged??s.imported??null,a=r?{...t.values,...r}:t.values,l=!!(a.banner||a.website||a.nip05||a.lud16);e.nostrProfileFormState={...t,importing:!1,values:a,error:null,success:s.saved?"Profile imported from relays. Review and publish.":"Profile imported. Review and publish.",showAdvanced:l},s.saved&&await le(e,!0)}catch(i){e.nostrProfileFormState={...t,importing:!1,error:`Profile import failed: ${String(i)}`,success:null}}}var Pg=Object.defineProperty,Og=Object.getOwnPropertyDescriptor,b=(e,t,n,i)=>{for(var s=i>1?void 0:i?Og(t,n):t,r=e.length-1,a;r>=0;r--)(a=e[r])&&(s=(i?a(t,n,s):a(s))||s);return i&&s&&Pg(t,n,s),s};const ni=fl();function Ng(){if(!window.location.search)return!1;const t=new URLSearchParams(window.location.search).get("onboarding");if(!t)return!1;const n=t.trim().toLowerCase();return n==="1"||n==="true"||n==="yes"||n==="on"}let m=class extends Je{constructor(){super(...arguments),this.settings=hl(),this.password="",this.tab="chat",this.onboarding=Ng(),this.onboardingWizardSessionId=null,this.onboardingWizardStep=null,this.onboardingWizardStatus=null,this.onboardingWizardError=null,this.onboardingWizardBusy=!1,this.onboardingWizardDraft=null,this.connected=!1,this.theme=this.settings.theme??"system",this.themeResolved="dark",this.hello=null,this.lastError=null,this.eventLog=[],this.eventLogBuffer=[],this.toolStreamSyncTimer=null,this.sidebarCloseTimer=null,this.assistantName=ni.name,this.assistantAvatar=ni.avatar,this.assistantAgentId=ni.agentId??null,this.sessionKey=this.settings.sessionKey,this.chatLoading=!1,this.chatSending=!1,this.chatMessage="",this.chatMessages=[],this.chatToolMessages=[],this.chatStream=null,this.chatStreamStartedAt=null,this.chatRunId=null,this.compactionStatus=null,this.chatAvatarUrl=null,this.chatThinkingLevel=null,this.chatQueue=[],this.chatAttachments=[],this.sidebarOpen=!1,this.sidebarContent=null,this.sidebarError=null,this.splitRatio=this.settings.splitRatio,this.nodesLoading=!1,this.nodes=[],this.devicesLoading=!1,this.devicesError=null,this.devicesList=null,this.execApprovalsLoading=!1,this.execApprovalsSaving=!1,this.execApprovalsDirty=!1,this.execApprovalsSnapshot=null,this.execApprovalsForm=null,this.execApprovalsSelectedAgent=null,this.execApprovalsTarget="gateway",this.execApprovalsTargetNodeId=null,this.execApprovalQueue=[],this.execApprovalBusy=!1,this.execApprovalError=null,this.configLoading=!1,this.configRaw=`{
}
`,this.configRawOriginal="",this.configValid=null,this.configIssues=[],this.configSaving=!1,this.configApplying=!1,this.updateRunning=!1,this.applySessionKey=this.settings.lastActiveSessionKey,this.configSnapshot=null,this.configSchema=null,this.configSchemaVersion=null,this.configSchemaLoading=!1,this.configUiHints={},this.configForm=null,this.configFormOriginal=null,this.configFormDirty=!1,this.configFormMode="form",this.configSearchQuery="",this.configActiveSection=null,this.configActiveSubsection=null,this.channelsLoading=!1,this.channelsSnapshot=null,this.channelsError=null,this.channelsLastSuccess=null,this.whatsappLoginMessage=null,this.whatsappLoginQrDataUrl=null,this.whatsappLoginConnected=null,this.whatsappBusy=!1,this.nostrProfileFormState=null,this.nostrProfileAccountId=null,this.presenceLoading=!1,this.presenceEntries=[],this.presenceError=null,this.presenceStatus=null,this.agentsLoading=!1,this.agentsList=null,this.agentsError=null,this.sessionsLoading=!1,this.sessionsResult=null,this.sessionsError=null,this.sessionsFilterActive="",this.sessionsFilterLimit="120",this.sessionsIncludeGlobal=!0,this.sessionsIncludeUnknown=!1,this.cronLoading=!1,this.cronJobs=[],this.cronStatus=null,this.cronError=null,this.cronForm={...eg},this.cronRunsJobId=null,this.cronRuns=[],this.cronBusy=!1,this.skillsLoading=!1,this.skillsReport=null,this.skillsError=null,this.skillsFilter="",this.skillEdits={},this.skillsBusyKey=null,this.skillMessages={},this.debugLoading=!1,this.debugStatus=null,this.debugHealth=null,this.debugModels=[],this.debugHeartbeat=null,this.debugCallMethod="",this.debugCallParams="{}",this.debugCallResult=null,this.debugCallError=null,this.logsLoading=!1,this.logsError=null,this.logsFile=null,this.logsEntries=[],this.logsFilterText="",this.logsLevelFilters={...Jh},this.logsAutoFollow=!0,this.logsTruncated=!1,this.logsCursor=null,this.logsLastFetchAt=null,this.logsLimit=500,this.logsMaxBytes=25e4,this.logsAtBottom=!0,this.client=null,this.chatScrollFrame=null,this.chatScrollTimeout=null,this.chatHasAutoScrolled=!1,this.chatUserNearBottom=!0,this.nodesPollInterval=null,this.logsPollInterval=null,this.debugPollInterval=null,this.logsScrollFrame=null,this.toolStreamById=new Map,this.toolStreamOrder=[],this.onboardingWizardAutoStarted=!1,this.basePath="",this.popStateHandler=()=>md(this),this.themeMedia=null,this.themeMediaHandler=null,this.topbarObserver=null}createRenderRoot(){return this}connectedCallback(){super.connectedCallback(),pg(this)}firstUpdated(){fg(this)}disconnectedCallback(){hg(this),super.disconnectedCallback()}updated(e){gg(this,e),this.onboarding&&this.connected&&!this.onboardingWizardAutoStarted&&!this.onboardingWizardSessionId&&(this.onboardingWizardAutoStarted=!0,this.handleOnboardingStart())}connect(){ko(this)}handleChatScroll(e){ql(this,e)}handleLogsScroll(e){Vl(this,e)}exportLogs(e,t){Ql(e,t)}resetToolStream(){Bi(this)}resetChatScroll(){Gl(this)}async loadAssistantIdentity(){await xo(this)}async handleOnboardingStart(){await yg(this,{mode:"local"})}async handleOnboardingNext(){await $g(this,this.onboardingWizardDraft)}async handleOnboardingCancel(){await wg(this)}handleOnboardingDraftChange(e){this.onboardingWizardDraft=e}handleOnboardingExit(){const e=new URL(window.location.href);e.searchParams.delete("onboarding"),window.history.replaceState(null,"",e.toString()),this.onboarding=!1}applySettings(e){Ae(this,e)}setTab(e){dd(this,e)}setTheme(e,t){ud(this,e,t)}async loadOverview(){await Na(this)}async loadCron(){await es(this)}async handleAbortChat(){await Ba(this)}removeQueuedMessage(e){xd(this,e)}async handleSendChat(e,t){await kd(this,e,t)}async handleWhatsAppStart(e){await xg(this,e)}async handleWhatsAppWait(){await kg(this)}async handleWhatsAppLogout(){await Ag(this)}async handleChannelConfigSave(){await Sg(this)}async handleChannelConfigReload(){await _g(this)}handleNostrProfileEdit(e,t){Eg(this,e,t)}handleNostrProfileCancel(){Cg(this)}handleNostrProfileFieldChange(e,t){Mg(this,e,t)}async handleNostrProfileSave(){await Lg(this)}async handleNostrProfileImport(){await Rg(this)}handleNostrProfileToggleAdvanced(){Ig(this)}async handleExecApprovalDecision(e){const t=this.execApprovalQueue[0];if(!(!t||!this.client||this.execApprovalBusy)){this.execApprovalBusy=!0,this.execApprovalError=null;try{await this.client.request("exec.approval.resolve",{id:t.id,decision:e}),this.execApprovalQueue=this.execApprovalQueue.filter(n=>n.id!==t.id)}catch(n){this.execApprovalError=`Exec approval failed: ${String(n)}`}finally{this.execApprovalBusy=!1}}}async handleDiscoverModels(e){if(!this.client)return;(await tc(this,e))?.success}handleOpenSidebar(e){this.sidebarCloseTimer!=null&&(window.clearTimeout(this.sidebarCloseTimer),this.sidebarCloseTimer=null),this.sidebarContent=e,this.sidebarError=null,this.sidebarOpen=!0}handleCloseSidebar(){this.sidebarOpen=!1,this.sidebarCloseTimer!=null&&window.clearTimeout(this.sidebarCloseTimer),this.sidebarCloseTimer=window.setTimeout(()=>{this.sidebarOpen||(this.sidebarContent=null,this.sidebarError=null,this.sidebarCloseTimer=null)},200)}handleSplitRatioChange(e){const t=Math.max(.4,Math.min(.7,e));this.splitRatio=t,this.applySettings({...this.settings,splitRatio:t})}render(){return Xh(this)}};b([y()],m.prototype,"settings",2);b([y()],m.prototype,"password",2);b([y()],m.prototype,"tab",2);b([y()],m.prototype,"onboarding",2);b([y()],m.prototype,"onboardingWizardSessionId",2);b([y()],m.prototype,"onboardingWizardStep",2);b([y()],m.prototype,"onboardingWizardStatus",2);b([y()],m.prototype,"onboardingWizardError",2);b([y()],m.prototype,"onboardingWizardBusy",2);b([y()],m.prototype,"onboardingWizardDraft",2);b([y()],m.prototype,"connected",2);b([y()],m.prototype,"theme",2);b([y()],m.prototype,"themeResolved",2);b([y()],m.prototype,"hello",2);b([y()],m.prototype,"lastError",2);b([y()],m.prototype,"eventLog",2);b([y()],m.prototype,"assistantName",2);b([y()],m.prototype,"assistantAvatar",2);b([y()],m.prototype,"assistantAgentId",2);b([y()],m.prototype,"sessionKey",2);b([y()],m.prototype,"chatLoading",2);b([y()],m.prototype,"chatSending",2);b([y()],m.prototype,"chatMessage",2);b([y()],m.prototype,"chatMessages",2);b([y()],m.prototype,"chatToolMessages",2);b([y()],m.prototype,"chatStream",2);b([y()],m.prototype,"chatStreamStartedAt",2);b([y()],m.prototype,"chatRunId",2);b([y()],m.prototype,"compactionStatus",2);b([y()],m.prototype,"chatAvatarUrl",2);b([y()],m.prototype,"chatThinkingLevel",2);b([y()],m.prototype,"chatQueue",2);b([y()],m.prototype,"chatAttachments",2);b([y()],m.prototype,"sidebarOpen",2);b([y()],m.prototype,"sidebarContent",2);b([y()],m.prototype,"sidebarError",2);b([y()],m.prototype,"splitRatio",2);b([y()],m.prototype,"nodesLoading",2);b([y()],m.prototype,"nodes",2);b([y()],m.prototype,"devicesLoading",2);b([y()],m.prototype,"devicesError",2);b([y()],m.prototype,"devicesList",2);b([y()],m.prototype,"execApprovalsLoading",2);b([y()],m.prototype,"execApprovalsSaving",2);b([y()],m.prototype,"execApprovalsDirty",2);b([y()],m.prototype,"execApprovalsSnapshot",2);b([y()],m.prototype,"execApprovalsForm",2);b([y()],m.prototype,"execApprovalsSelectedAgent",2);b([y()],m.prototype,"execApprovalsTarget",2);b([y()],m.prototype,"execApprovalsTargetNodeId",2);b([y()],m.prototype,"execApprovalQueue",2);b([y()],m.prototype,"execApprovalBusy",2);b([y()],m.prototype,"execApprovalError",2);b([y()],m.prototype,"configLoading",2);b([y()],m.prototype,"configRaw",2);b([y()],m.prototype,"configRawOriginal",2);b([y()],m.prototype,"configValid",2);b([y()],m.prototype,"configIssues",2);b([y()],m.prototype,"configSaving",2);b([y()],m.prototype,"configApplying",2);b([y()],m.prototype,"updateRunning",2);b([y()],m.prototype,"applySessionKey",2);b([y()],m.prototype,"configSnapshot",2);b([y()],m.prototype,"configSchema",2);b([y()],m.prototype,"configSchemaVersion",2);b([y()],m.prototype,"configSchemaLoading",2);b([y()],m.prototype,"configUiHints",2);b([y()],m.prototype,"configForm",2);b([y()],m.prototype,"configFormOriginal",2);b([y()],m.prototype,"configFormDirty",2);b([y()],m.prototype,"configFormMode",2);b([y()],m.prototype,"configSearchQuery",2);b([y()],m.prototype,"configActiveSection",2);b([y()],m.prototype,"configActiveSubsection",2);b([y()],m.prototype,"channelsLoading",2);b([y()],m.prototype,"channelsSnapshot",2);b([y()],m.prototype,"channelsError",2);b([y()],m.prototype,"channelsLastSuccess",2);b([y()],m.prototype,"whatsappLoginMessage",2);b([y()],m.prototype,"whatsappLoginQrDataUrl",2);b([y()],m.prototype,"whatsappLoginConnected",2);b([y()],m.prototype,"whatsappBusy",2);b([y()],m.prototype,"nostrProfileFormState",2);b([y()],m.prototype,"nostrProfileAccountId",2);b([y()],m.prototype,"presenceLoading",2);b([y()],m.prototype,"presenceEntries",2);b([y()],m.prototype,"presenceError",2);b([y()],m.prototype,"presenceStatus",2);b([y()],m.prototype,"agentsLoading",2);b([y()],m.prototype,"agentsList",2);b([y()],m.prototype,"agentsError",2);b([y()],m.prototype,"sessionsLoading",2);b([y()],m.prototype,"sessionsResult",2);b([y()],m.prototype,"sessionsError",2);b([y()],m.prototype,"sessionsFilterActive",2);b([y()],m.prototype,"sessionsFilterLimit",2);b([y()],m.prototype,"sessionsIncludeGlobal",2);b([y()],m.prototype,"sessionsIncludeUnknown",2);b([y()],m.prototype,"cronLoading",2);b([y()],m.prototype,"cronJobs",2);b([y()],m.prototype,"cronStatus",2);b([y()],m.prototype,"cronError",2);b([y()],m.prototype,"cronForm",2);b([y()],m.prototype,"cronRunsJobId",2);b([y()],m.prototype,"cronRuns",2);b([y()],m.prototype,"cronBusy",2);b([y()],m.prototype,"skillsLoading",2);b([y()],m.prototype,"skillsReport",2);b([y()],m.prototype,"skillsError",2);b([y()],m.prototype,"skillsFilter",2);b([y()],m.prototype,"skillEdits",2);b([y()],m.prototype,"skillsBusyKey",2);b([y()],m.prototype,"skillMessages",2);b([y()],m.prototype,"debugLoading",2);b([y()],m.prototype,"debugStatus",2);b([y()],m.prototype,"debugHealth",2);b([y()],m.prototype,"debugModels",2);b([y()],m.prototype,"debugHeartbeat",2);b([y()],m.prototype,"debugCallMethod",2);b([y()],m.prototype,"debugCallParams",2);b([y()],m.prototype,"debugCallResult",2);b([y()],m.prototype,"debugCallError",2);b([y()],m.prototype,"logsLoading",2);b([y()],m.prototype,"logsError",2);b([y()],m.prototype,"logsFile",2);b([y()],m.prototype,"logsEntries",2);b([y()],m.prototype,"logsFilterText",2);b([y()],m.prototype,"logsLevelFilters",2);b([y()],m.prototype,"logsAutoFollow",2);b([y()],m.prototype,"logsTruncated",2);b([y()],m.prototype,"logsCursor",2);b([y()],m.prototype,"logsLastFetchAt",2);b([y()],m.prototype,"logsLimit",2);b([y()],m.prototype,"logsMaxBytes",2);b([y()],m.prototype,"logsAtBottom",2);m=b([ta("clawdbot-app")],m);
//# sourceMappingURL=index-xwQozs7G.js.map
