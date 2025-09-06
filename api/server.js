const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
if (typeof fetch === "undefined") {
  global.fetch = (...a) => import("node-fetch").then(({default:f}) => f(...a));
}

const app = express();
const db = new PrismaClient();
app.use(cors());
app.use(express.json());

//health
app.get("/health", (_req,res)=>res.json({ok:true}));

//ingest MLB for a date
const lastIngest = new Map();
async function ingestDate(dateStr){
  const now = Date.now();
  if (now - (lastIngest.get(dateStr)||0) < 60_000) return; // throttle
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&hydrate=linescore,status,teams`;
  const r = await fetch(url);
  if(!r.ok) throw new Error(`MLB ${r.status}`);
  const j = await r.json();
  const games = j?.dates?.[0]?.games ?? [];
  for (const g of games){
    const home = g.teams?.home?.team ?? {};
    const away = g.teams?.away?.team ?? {};
    const homeRuns = g.teams?.home?.score ?? g.linescore?.teams?.home?.runs ?? null;
    const awayRuns = g.teams?.away?.score ?? g.linescore?.teams?.away?.runs ?? null;
    await db.game.upsert({
      where:{ gameId:String(g.gamePk) },
      update:{
        gameDate:new Date(g.gameDate),
        status:g.status?.abstractGameState ?? "Unknown",
        homeId:home.id ?? 0, homeAbbr:home.abbreviation ?? "", homeName:home.name ?? "", homeRuns,
        awayId:away.id ?? 0, awayAbbr:away.abbreviation ?? "", awayName:away.name ?? "", awayRuns,
      },
      create:{
        gameId:String(g.gamePk),
        gameDate:new Date(g.gameDate),
        status:g.status?.abstractGameState ?? "Unknown",
        homeId:home.id ?? 0, homeAbbr:home.abbreviation ?? "", homeName:home.name ?? "", homeRuns,
        awayId:away.id ?? 0, awayAbbr:away.abbreviation ?? "", awayName:away.name ?? "", awayRuns,
      },
    });
  }
  lastIngest.set(dateStr, now);
}

//GET /games?date=YYYY-MM-DD
app.get("/games", async (req,res)=>{
  try{
    const dateStr = req.query.date;
    if(!dateStr) return res.status(400).json({error:"date=YYYY-MM-DD required"});
    await ingestDate(dateStr);
    const start = new Date(`${dateStr}T00:00:00Z`);
    const end = new Date(start.getTime()+24*60*60*1000);
    const rows = await db.game.findMany({ where:{gameDate:{gte:start,lt:end}}, orderBy:{gameDate:"asc"} });
    res.json({games:rows});
  }catch(e){ console.error(e); res.status(500).json({error:"server_error"}); }
});

//Favorites
app.get("/favorites", async (_req,res)=>{
  const rows = await db.favoriteTeam.findMany({ orderBy:{createdAt:"desc"} });
  res.json({favorites:rows});
});
app.post("/favorites", async (req,res)=>{
  try{
    const {teamId,teamName} = req.body || {};
    if(!teamId || !teamName) return res.status(400).json({error:"teamId and teamName required"});
    const fav = await db.favoriteTeam.upsert({
      where:{teamId:Number(teamId)},
      update:{teamName},
      create:{teamId:Number(teamId), teamName},
    });
    res.json(fav);
  }catch(e){ console.error("POST /favorites", e); res.status(500).json({error:"server_error"}); }
});
app.delete("/favorites/:teamId", async (req,res)=>{
  await db.favoriteTeam.delete({ where:{teamId:Number(req.params.teamId)} }).catch(()=>null);
  res.json({ok:true});
});

// debug: list routes
const routes = (app._router?.stack||[]).filter(r=>r.route)
  .map(r=>`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
console.log("Routes:", routes);

const PORT = process.env.PORT || 5174;
app.listen(PORT, ()=>console.log(`API on http://localhost:${PORT}`));
