"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {recipes,Recipe,Ingredient} from "./data";
import {Home,Search,ShoppingBasket,UserRound,Sparkles,Clock3,MapPin,Truck,Plus,Check,Download,Upload,Flame,ChevronLeft,X,Minus,ScanLine,Play,ChefHat} from "lucide-react";

type CartItem=Ingredient&{id:string;recipe:string;done:boolean};
type UserData={name:string;xp:number;streak:number;cart:CartItem[];address:string;favorites:string[]};
const initial:UserData={name:"Awa",xp:340,streak:4,cart:[],address:"Cocody, Abidjan",favorites:[]};
const money=(n:number)=>new Intl.NumberFormat("fr-FR").format(n)+" F";

export default function Page(){
 const [tab,setTab]=useState("home"),[user,setUser]=useState<UserData>(initial),[selected,setSelected]=useState<Recipe|null>(null),[delivery,setDelivery]=useState(false),[query,setQuery]=useState(""),[toast,setToast]=useState(""),fileRef=useRef<HTMLInputElement>(null);
 useEffect(()=>{try{const x=localStorage.getItem("eazy1000-user");if(x)setUser(JSON.parse(x))}catch{}},[]);
 useEffect(()=>{localStorage.setItem("eazy1000-user",JSON.stringify(user))},[user]);
 const filtered=useMemo(()=>recipes.filter(r=>(r.name+r.origin+r.tag).toLowerCase().includes(query.toLowerCase())),[query]);
 const add=(ing:Ingredient,r:Recipe)=>{setUser(u=>({...u,xp:u.xp+5,cart:[...u.cart,{...ing,id:r.id+"-"+ing.name,recipe:r.name,done:false}]}));flash("+5 XP · Ajouté à ta liste")};
 const addAll=(r:Recipe)=>{setUser(u=>({...u,xp:u.xp+20,cart:[...u.cart,...r.ingredients.filter(i=>!u.cart.some(c=>c.id===r.id+"-"+i.name)).map(i=>({...i,id:r.id+"-"+i.name,recipe:r.name,done:false}))]}));flash("+20 XP · Recette ajoutée !")};
 const flash=(s:string)=>{setToast(s);setTimeout(()=>setToast(""),1800)};
 const exportData=()=>{const b=new Blob([JSON.stringify(user,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="eazy1000-"+Date.now()+".json";a.click();URL.revokeObjectURL(a.href)};
 const importData=(f?:File)=>{if(!f)return;const rd=new FileReader();rd.onload=()=>{try{setUser(JSON.parse(String(rd.result)));flash("Sauvegarde restaurée ✓")}catch{flash("Fichier invalide")}};rd.readAsText(f)};
 const openRecipe=(r:Recipe)=>{setSelected(r);setDelivery(false)};
 return <main>
  {toast&&<div className="toast">{toast}</div>}
  <header><div className="brand"><span>E</span>azy <b>1000</b></div><button className="avatar" onClick={()=>setTab("profile")}>{user.name[0]}</button></header>
  <section className="screen">
   {tab==="home"&&<><div className="hello"><p>Salut {user.name} 👋</p><h1>On mange quoi<br/>de bon aujourd’hui ?</h1></div>
    <div className="search"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Un plat, un ingrédient, une envie…"/></div>
    <div className="quick">
     <button><span>📱</span><b>Vu sur les réseaux</b><small>Colle un lien TikTok, IG, YouTube</small></button>
     <button><span>🧺</span><b>Je fais quoi avec ça ?</b><small>Dis-nous ce que tu as déjà</small></button>
     <button><span>😋</span><b>J’ai envie de…</b><small>Écris ton envie, on s’occupe du reste</small></button>
    </div>
    <div className="sectionTitle"><div><small>POUR TOI</small><h2>Des idées qui changent</h2></div><button onClick={()=>setTab("discover")}>Tout voir</button></div>
    <div className="cards">{filtered.slice(0,4).map(r=><RecipeCard key={r.id} r={r} open={()=>openRecipe(r)}/>)}</div>
    <div className="localBanner"><div><span>🌍 SAVEURS D’ICI</span><h2>Le local, sans routine.</h2><p>Classiques ivoiriens, recettes ouest-africaines et versions revisitées faciles à cuisiner.</p><button onClick={()=>setTab("discover")}>Explorer les plats locaux →</button></div><div className="bigEmoji">🍲</div></div>
   </>}
   {tab==="discover"&&<><div className="hello compact"><p><Sparkles size={16}/> Inspiration</p><h1>Trouve ton prochain plat</h1></div><div className="search"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Chercher parmi les idées…"/></div>
    <div className="chips"><button>✨ Pour moi</button><button>🇨🇮 Local</button><button>⚡ Rapide</button><button>💸 Petit budget</button></div>
    <div className="grid">{filtered.map(r=><RecipeCard key={r.id} r={r} open={()=>openRecipe(r)}/>)}</div></>}
   {tab==="cart"&&<Shopping user={user} setUser={setUser} flash={flash}/>}
   {tab==="profile"&&<Profile user={user} exportData={exportData} fileRef={fileRef} importData={importData}/>}
  </section>
  <nav>{[["home",Home,"Accueil"],["discover",Search,"Découvrir"],["cart",ShoppingBasket,"Courses"],["profile",UserRound,"Moi"]].map(([id,I,label]:any)=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><I size={21}/><span>{label}</span>{id==="cart"&&user.cart.filter(x=>!x.done).length>0&&<i>{user.cart.filter(x=>!x.done).length}</i>}</button>)}</nav>
  {selected&&<div className="overlay"><div className="sheet"><button className="close" onClick={()=>setSelected(null)}><X/></button><div className="heroFood"><span>{selected.emoji}</span><em>{selected.local?"🌍 LOCAL / REVISITÉ":"✨ INSPIRATION"}</em></div><div className="recipeBody"><small>{selected.origin}</small><h1>{selected.name}</h1><div className="meta"><span><Clock3/> {selected.time} min</span><span><ChefHat/> Facile</span><span>≈ {money(selected.price)}</span></div>
   <div className="ingredientHead"><h2>Ce qu’il te faut</h2><button onClick={()=>addAll(selected)}>+ Tout ajouter</button></div>
   {selected.ingredients.map(i=><div className="ingredient" key={i.name}><span className="ingEmoji">{i.emoji}</span><div><b>{i.name}</b><small>{i.qty} · ≈ {money(i.price)}</small></div><button title="Ajouter aux courses" onClick={()=>add(i,selected)}><Plus/></button><button className="deliverMini" title="Faire livrer" onClick={()=>setDelivery(true)}><Truck/></button></div>)}
   <div className="choice"><button className="primary" onClick={()=>addAll(selected)}><ShoppingBasket/> Ajouter à ma liste</button><button className="partner" onClick={()=>setDelivery(true)}><Truck/> Faire livrer</button></div>
  </div></div></div>}
  {delivery&&selected&&<div className="overlay top"><div className="sheet delivery"><button className="back" onClick={()=>setDelivery(false)}><ChevronLeft/> Retour</button><div className="partnerLogo">allo<span>market</span></div><p className="eyebrow">PARTENAIRE DISTRIBUTEUR</p><h1>Tout pour « {selected.name} »<br/>livré chez toi.</h1><div className="address"><MapPin/><div><small>ADRESSE DE LIVRAISON</small><input value={user.address} onChange={e=>setUser({...user,address:e.target.value})}/></div></div><div className="orderBox">{selected.ingredients.map(i=><div key={i.name}><span>{i.emoji} {i.name} <small>{i.qty}</small></span><b>{money(i.price)}</b></div>)}<hr/><div><span>Sous-total estimé</span><b>{money(selected.price)}</b></div><div><span>Livraison <small>à la charge du client</small></span><b>1 500 F</b></div><div className="total"><span>Total simulé</span><b>{money(selected.price+1500)}</b></div></div><button className="pay" onClick={()=>flash("Simulation : commande transmise à Allo Market ✓")}>Commander chez Allo Market <Truck/></button><p className="fine">Prototype · prix et disponibilité seront synchronisés avec le partenaire.</p></div></div>}
 </main>
}
function RecipeCard({r,open}:{r:Recipe;open:()=>void}){return <button className="recipeCard" onClick={open}><div className="food"><span>{r.emoji}</span>{r.local&&<i>LOCAL</i>}</div><div className="cardText"><small>{r.origin}</small><b>{r.name}</b><div><span><Clock3 size={14}/>{r.time} min</span><strong>{money(r.price)}</strong></div></div></button>}
function Shopping({user,setUser,flash}:{user:UserData;setUser:any;flash:any}){const done=user.cart.filter(x=>x.done).length,total=user.cart.length,pct=total?Math.round(done/total*100):0;const toggle=(id:string)=>{setUser((u:UserData)=>({...u,xp:u.xp+10,cart:u.cart.map(x=>x.id===id?{...x,done:!x.done}:x)}));flash("+10 XP · Bien joué !")};return <><div className="hello compact"><p>🛒 MA LISTE</p><h1>Mission courses</h1></div><div className="xpCard"><div><span>🔥 Série de {user.streak} jours</span><b>{user.xp} XP</b></div><div className="bar"><i style={{width:pct+"%"}}/></div><small>{done}/{total} articles trouvés · {pct}% terminé</small></div>{!total?<div className="empty"><span>🧺</span><h2>Ta liste est encore légère</h2><p>Choisis une recette et ajoute ce qu’il te manque. Chaque article coché te rapporte des XP.</p></div>:<div className="list">{user.cart.map(x=><button key={x.id} className={x.done?"done":""} onClick={()=>toggle(x.id)}><span className="check">{x.done?<Check/>:null}</span><span className="ingEmoji">{x.emoji}</span><div><b>{x.name}</b><small>{x.qty} · {x.recipe}</small></div><strong>{money(x.price)}</strong></button>)}</div>}<div className="mission"><Flame/><div><b>Défi anti-gaspi</b><small>Termine ta liste pour gagner le badge « Panier malin » + 100 XP.</small></div></div></>}
function Profile({user,exportData,fileRef,importData}:{user:UserData;exportData:any;fileRef:any;importData:any}){return <><div className="profileHero"><div className="avatar large">{user.name[0]}</div><h1>{user.name}</h1><p>Exploratrice gourmande · Niveau 4</p><div><b>{user.xp}<small> XP</small></b><b>{user.streak}<small> jours de série</small></b></div></div><h2 className="subhead">Mes données</h2><div className="dataCard"><ScanLine/><div><b>Sauvegarde portable</b><p>Tes préférences, ta liste et ta progression restent à toi. Exporte-les en JSON et restaure-les sur un autre appareil.</p></div><button onClick={exportData}><Download/> Télécharger</button><button onClick={()=>fileRef.current?.click()}><Upload/> Importer</button><input ref={fileRef} hidden type="file" accept=".json,application/json" onChange={(e:any)=>importData(e.target.files?.[0])}/></div><div className="settings"><span><MapPin/> Adresse préférée <b>{user.address}</b></span><span><Truck/> Livraison partenaire <b>Allo Market</b></span></div></>}
