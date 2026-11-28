"""Optional developer tool (needs Python + Playwright + Chromium).
Runs the ORIGINAL prototype in a browser, seeds its localStorage with several scenarios, freezes
the clock and records what the prototype's own functions return. Output: tests/fixtures/prototype-golden.json
Usage: python scripts/generate-golden.py reference/roadmap-galaxy.prototype.html tests/fixtures/prototype-golden.json
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright

PROTO = pathlib.Path(sys.argv[1]).resolve()
OUT = pathlib.Path(sys.argv[2])
NOW = "2026-11-25T10:00:00Z"
TODAY = "2026-11-25"
FREEZE = ("(()=>{const D=Date,f=new D('%s').getTime();"
          "class FD extends D{constructor(...a){super(...(a.length?a:[f]))}static now(){return f}}"
          "window.Date=FD})()") % NOW
INTERESTS = ["ai", "web", "sec", "hw", "civil", "design", "data"]
D0, D1, D2, D3 = "2026-11-25", "2026-11-24", "2026-11-23", "2026-11-22"

QUERY = """(interests)=>{
 const out={};const x=xp(),rk=rank(x);
 out.xp=x;out.rankName=rk.n;out.xpToNext=rk.next?rk.next[1]-x:null;
 out.wprog=wprog();out.streak=streak();
 out.focusHours=S.focus.reduce((a,f)=>a+f.s,0)/3600;
 out.roadmaps=R.map(r=>({id:r[0],pct:pct(r),done:doneN(r),next:nextIdx(r)}));
 out.build=Object.fromEntries(I.map(i=>[i[0],build(i)]));
 out.byInterest={};
 for(const k of interests){S.prefs.interest=k;
   out.byInterest[k]={rec:recRoadmaps().map(r=>r[0]),ranked:ranked().map(i=>i[0]),
     scores:Object.fromEntries(I.map(i=>[i[0],ideaScore(i)]))}}
 return out}"""

def run():
    with sync_playwright() as p:
        b = p.chromium.launch()
        def page_for(state):
            ctx = b.new_context(timezone_id="UTC", locale="en-US")
            ctx.add_init_script(FREEZE)
            if state is not None:
                ctx.add_init_script("localStorage.setItem('rg1',%s)" % json.dumps(json.dumps(state)))
            pg = ctx.new_page(); pg.route("**/fonts.g*/**", lambda r: r.abort())
            pg.goto(PROTO.as_uri()); pg.wait_for_timeout(200); return pg

        base = page_for(None)
        cat = base.evaluate("""()=>({roadmapIds:R.map(r=>r[0]),
          topicIds:R.flatMap(r=>r[7].map((_,i)=>tid(r,i))),
          topicCounts:Object.fromEntries(R.map(r=>[r[0],r[7].length])),
          ideaIds:I.map(i=>i[0])})""")
        counts = cat["topicCounts"]
        def first(rid, n): return [f"{rid}-{i+1}" for i in range(n)]
        def done(spec): return [t for rid, n in spec.items() for t in first(rid, n)]

        mixed = {"python":10,"dsa":6,"dbms":3,"frontend":4,"backend":2,"ml":5,"genai":1,"cyber":7,"devops":3,"iot":2,"control":1,"bim":4,"uiux":10}
        scen = {
          "empty":      dict(done=[], log={}, focus=[]),
          "starter":    dict(done=done({"python":2}), log={"python-1":D0,"python-2":D0}, focus=[]),
          "mixed":      dict(done=done(mixed), log={"python-1":D0,"python-2":D1,"python-3":D2,"dsa-1":D1}, focus=[{"d":D0,"s":3600,"r":"python"},{"d":D1,"s":1800,"r":"dsa"}]),
          "gap_streak": dict(done=done({"python":3}), log={"python-1":D1,"python-2":D3}, focus=[]),
          "stale":      dict(done=done({"dsa":4}), log={"dsa-1":D2}, focus=[]),
          "focus_only": dict(done=[], log={}, focus=[{"d":D0,"s":1500,"r":"dsa"},{"d":D1,"s":600,"r":"dsa"}]),
          "all_done":   dict(done=done(counts), log={}, focus=[]),
        }
        result = {"frozenNow": NOW, "today": TODAY, "timeZone": "UTC", "interests": INTERESTS,
                  "catalogue": {k: cat[k] for k in ("roadmapIds","topicIds","ideaIds")}, "scenarios": {}}
        for name, sc in scen.items():
            state = {"done": {t: 1 for t in sc["done"]}, "log": sc["log"], "focus": sc["focus"],
                     "bm": [], "plans": [], "viewed": [], "last": None, "prefs": {"branch": "CSE / IT", "interest": "ai"}}
            pg = page_for(state)
            result["scenarios"][name] = {"input": sc, "prototype": pg.evaluate(QUERY, INTERESTS)}
            pg.context.close()
        b.close()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, indent=1) + "\n")
    s = result["scenarios"]
    print("scenarios:", list(s), "| mixed xp/streak/wprog:", s["mixed"]["prototype"]["xp"], s["mixed"]["prototype"]["streak"], s["mixed"]["prototype"]["wprog"])
run()
