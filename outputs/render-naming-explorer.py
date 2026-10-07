"""Render the canonical voting-name catalog into local, network-free views."""
import argparse
import html
import json
import re
from pathlib import Path

DIRECTORY = Path(__file__).resolve().parent
STYLE = '\n:root{color-scheme:light dark;--bg:Canvas;--text:CanvasText;--link:LinkText;--line:color-mix(in srgb,CanvasText 20%,Canvas);--muted:color-mix(in srgb,CanvasText 70%,Canvas)}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 system-ui,sans-serif}main{max-width:1140px;margin:auto;padding:32px 24px 64px}h1{font-size:26px;line-height:1.25;margin:0 0 12px}h2{font-size:20px;line-height:1.3;margin:0 0 8px}p{margin:8px 0}a{color:var(--link)}.lead{font-size:18px;max-width:850px}.muted,.category-note,.domain{color:var(--muted);font-size:13px}.decision{border-block:1px solid var(--line);padding:18px 0;margin:24px 0}.shortlist{display:flex;flex-wrap:wrap;gap:10px 24px;padding:0;list-style:none}.filters{display:flex;flex-wrap:wrap;align-items:end;gap:16px;margin:28px 0}.filters label{display:grid;gap:6px;font-size:13px}input[type=search],select{font:inherit;padding:8px;min-width:180px;border:1px solid var(--line);border-radius:4px;background:var(--bg);color:var(--text)}input[type=checkbox]{accent-color:var(--link)}.filters .toggle{display:block}section{padding:24px 0;border-top:1px solid var(--line)}.names{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:16px 28px;padding:0;list-style:none}.names li{padding:14px 0;border-bottom:1px solid var(--line)}.name-line{display:flex;gap:12px;justify-content:space-between;align-items:center}.name-line strong{font-size:17px}.recommended{font-size:11px;color:var(--link)}.collision{font-size:13px;font-weight:600}table{border-collapse:collapse;max-width:650px;width:100%;font-size:14px}th,td{text-align:left;padding:8px 12px 8px 0;border-bottom:1px solid var(--line)}footer{padding:24px 0;border-top:1px solid var(--line)}[hidden]{display:none!important}@media(max-width:650px){main{padding:22px 16px}.names{grid-template-columns:1fr}}@media print{.filters,input[type=checkbox]{display:none}body{font-size:10pt}main{padding:0}.names{grid-template-columns:1fr 1fr}section,li{break-inside:avoid}a{color:var(--text)}}\n\nh3{font-size:17px;line-height:1.35;margin:0 0 8px}.brand-family{padding:30px 0}.brand-family>h2{font-size:22px}.brand-family>section{border:0;padding:18px 0}.name-row{break-inside:avoid}details>summary{cursor:pointer;font-weight:600}\n'
STYLE = STYLE.replace(r"\n", "\n")
STATUS_LABELS = {
    "no_registry_record": ".org: no registry record",
    "registered": ".org: registered",
    "unknown": ".org: unknown",
    "not_checked": ".org: not checked",
}

def escape(value):
    return html.escape(str(value), quote=True)

def validate(data):
    rows = data["candidates"]
    ids = {row["id"] for row in rows}
    categories = {category["id"]: category for category in data["categories"]}
    families = {family["id"]: family for family in data["brandFamilies"]}
    if len(ids) != len(rows) or len(categories) != len(data["categories"]):
        raise ValueError("Duplicate candidate or category ID")
    for category in categories.values():
        if category["familyId"] not in families or category["id"] not in families[category["familyId"]]["categoryIds"]:
            raise ValueError("Invalid brand-family mapping")
    for row in rows:
        if row["categoryId"] not in categories or row["familyId"] != categories[row["categoryId"]]["familyId"]:
            raise ValueError("Invalid candidate category or family")
        if row["esState"] != "unverified" or row["registrarAvailability"] != "unverified":
            raise ValueError("No .es or registrar quote was verified in this exploration")
        if row["round"] != "earlier" and row["orgState"] == "no_registry_record":
            if row.get("httpStatus") != 404 or row.get("registryErrorCode") != 404:
                raise ValueError("No-record result lacks registry error confirmation")
    if not set(data["recommendedIds"]).issubset(ids):
        raise ValueError("Unknown recommended name")
    current = {row["id"]: row for row in rows}
    for snapshot in ["electoral-app-naming-explorer.v1.json", "electoral-app-naming-explorer.v2.json", "electoral-app-naming-explorer.v3.json"]:
        earlier = json.loads((DIRECTORY / snapshot).read_text())
        for previous in earlier["candidates"]:
            if previous["id"] not in current:
                raise ValueError("An earlier proposal was lost")
            for key in ["brand", "meaning", "categoryId", "esDomain", "orgDomain"]:
                if previous[key] != current[previous["id"]][key]:
                    raise ValueError("An earlier proposal was silently rewritten")
    for proposal_round in data["rounds"]:
        if sum(row["round"] == proposal_round["id"] for row in rows) != proposal_round["count"]:
            raise ValueError("Proposal-round count differs from the canonical metadata")
    if data["leadingCandidateId"] not in ids:
        raise ValueError("Unknown leading candidate")
    if data["currentRoundCount"] != sum(row["round"] == data["currentRound"] for row in rows):
        raise ValueError("Current-round count differs from the catalog")
    states = ["no_registry_record", "registered", "unknown", "not_checked"]
    current_rows = [row for row in rows if row["round"] == data["currentRound"]]
    if data["currentRoundDomainSummary"] != {state: sum(row["orgState"] == state for row in current_rows) for state in states}:
        raise ValueError("Current-round registry summary differs from the individual results")

FILTER_SCRIPT = r"""
const controls={
 search:document.getElementById("search"),
 round:document.getElementById("round"),
 family:document.getElementById("family"),
 category:document.getElementById("category"),
 availability:document.getElementById("availability"),
 favorites:document.getElementById("favorites-only")
};
const normalize=value=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function applyFilters(){
 let count=0;
 const query=normalize(controls.search.value);
 for(const row of document.querySelectorAll(".name-row")){
  const matchesQuery=normalize(row.dataset.name+" "+row.textContent).includes(query);
  const matchesRound=controls.round.value==="all"||(controls.round.value==="focus"?row.dataset.focus==="true":row.dataset.round===controls.round.value);
  const matchesFamily=controls.family.value==="all"||row.dataset.family===controls.family.value;
  const matchesCategory=controls.category.value==="all"||row.dataset.category===controls.category.value;
  const matchesAvailability=controls.availability.value==="all"||(row.dataset.state==="no_registry_record"&&row.dataset.conflict!=="true");
  const matchesFavorite=!controls.favorites.checked||row.querySelector(".favorite").checked;
  row.hidden=!(matchesQuery&&matchesRound&&matchesFamily&&matchesCategory&&matchesAvailability&&matchesFavorite);
  if(!row.hidden)count++;
 }
 for(const group of document.querySelectorAll("[data-group]")){
  group.hidden=![...group.querySelectorAll(".name-row")].some(row=>!row.hidden);
 }
 for(const family of document.querySelectorAll("[data-family-section]")){
  family.hidden=![...family.querySelectorAll(".name-row")].some(row=>!row.hidden);
 }
 document.getElementById("count").textContent=count+" of "+document.querySelectorAll(".name-row").length+" ideas shown";
}
controls.search.addEventListener("input",applyFilters);
for(const key of ["round","family","category","availability"])controls[key].addEventListener("change",applyFilters);
controls.favorites.addEventListener("change",()=>{
 if(controls.favorites.checked){controls.round.value="all";controls.family.value="all";controls.category.value="all";}
 applyFilters();
});
for(const checkbox of document.querySelectorAll(".favorite"))checkbox.addEventListener("change",applyFilters);
applyFilters();
"""

def render_html(data):
    total = len(data["candidates"])
    new_count = data["currentRoundCount"]
    previous = total - new_count
    current = data["currentRoundDomainSummary"]
    leading = next(row for row in data["candidates"] if row["id"] == data["leadingCandidateId"])
    header = (
        "<header><h1>Irreverent voting names and forum humor</h1>"
        "<p class=\"lead\"><strong>Selected project name: " + escape(leading["brand"]) + "</strong><br>"
        + escape(leading["esDomain"]) + " · availability unverified.</p>"
        "<p>Explore blunt, absurd and forum-style voting names for the 29 November 2026 election.</p>"
        "<p class=\"muted\">" + str(total) + " preserved ideas · " + str(new_count) + " new focused names · "
        + str(previous) + " previous proposals · " + str(len(data["brandFamilies"])) + " brand families · "
        + str(len(data["categories"])) + " styles.</p></header>"
    )
    brief = (
        "<aside class=\"decision\"><h2>The current naming brief</h2><p>" + escape(data["currentBrief"]) + "</p>"
        "<p class=\"muted\">Most new names are original meme-style proposals. Documented memes and idioms are identified separately.</p>"
        "<p class=\"muted\">Latest API batch: " + str(current["no_registry_record"]) + " of " + str(new_count)
        + " new .org names returned no registry record; " + str(current["registered"]) + " were registered; "
        + str(current["unknown"] + current["not_checked"]) + " remain unresolved. Every .es name and exact registrar quote remains unverified. "
        "A registry no-record result is not a purchase guarantee. Checks: " + escape(data["checkedAt"]) + ".</p></aside>"
    )
    recommendations = [row for row in data["candidates"] if row.get("recommendedVoting")]
    shortlist = "<aside><h2>Selected project name</h2><ul class=\"shortlist\">" + "".join(
        "<li><a href=\"#" + "family-" + escape(row["familyId"]) + "\">" + escape(row["brand"]) + "</a></li>"
        for row in recommendations
    ) + "</ul></aside>"
    options = lambda items: "".join("<option value=\"" + escape(item["id"]) + "\">" + escape(item["title"]) + "</option>" for item in items)
    round_options = '<option value="focus">Current focus: irreverent forum humor</option>' + options(data["rounds"]) + '<option value="all">All preserved proposals</option>'
    controls = (
        "<form class=\"filters\" onsubmit=\"return false\">"
        "<label>Search names or meanings<input id=\"search\" type=\"search\" placeholder=\"For example: votar, papeleta, PDF\"></label>"
        "<label>Proposal round<select id=\"round\">" + round_options + "</select></label>"
        "<label>Brand family<select id=\"family\"><option value=\"all\">All brand families</option>" + options(data["brandFamilies"]) + "</select></label>"
        "<label>Naming style<select id=\"category\"><option value=\"all\">All styles</option>" + options(data["categories"]) + "</select></label>"
        "<label>Domain evidence<select id=\"availability\"><option value=\"all\">All domain states</option><option value=\"promising\">No .org record; no recorded brand collision</option></select></label>"
        "<label class=\"toggle\"><input id=\"favorites-only\" type=\"checkbox\"> Favorites only</label></form>"
        "<p id=\"count\" class=\"muted\" aria-live=\"polite\"></p>"
    )
    content = []
    for family in data["brandFamilies"]:
        sections = []
        for category in data["categories"]:
            if category["familyId"] != family["id"]:
                continue
            entries = []
            for row in data["candidates"]:
                if row["categoryId"] != category["id"]:
                    continue
                attributes = {
                    "data-name": row["brand"].lower(),
                    "data-category": row["categoryId"],
                    "data-family": row["familyId"],
                    "data-round": row["round"],
                    "data-focus": str(row["inActiveFocus"]).lower(),
                    "data-state": row["orgState"],
                    "data-conflict": str(row["brandCheckState"].startswith("existing_")).lower(),
                    "data-id": row["id"],
                }
                attribute_text = " ".join(key + "=\"" + escape(value) + "\"" for key, value in attributes.items())
                badge = "<span class=\"recommended\">Voting shortlist</span>" if row.get("recommendedVoting") else "<span class=\"muted\">Earlier idea</span>" if row["round"] == "earlier" else ""
                note = ""
                if row.get("brandNote"):
                    note = "<p class=\"collision\">" + escape(row["brandNote"]) + (
                        " <a href=\"" + escape(row["brandEvidenceUrl"]) + "\" rel=\"noreferrer\">Existing service</a>"
                        if row.get("brandEvidenceUrl") else ""
                    ) + "</p>"
                entries.append(
                    "<li class=\"name-row\" " + attribute_text + "><div class=\"name-line\"><label><input class=\"favorite\" type=\"checkbox\" value=\""
                    + escape(row["id"]) + "\"> <strong>" + escape(row["brand"]) + "</strong></label>" + badge + "</div><p>"
                    + escape(row["meaning"]) + "</p><p class=\"domain\">" + escape(row["esDomain"]) + " · .es unverified<br>"
                    + escape(row["orgDomain"]) + " · <a href=\"" + escape(row["registryUrl"]) + "\" rel=\"noreferrer\">"
                    + escape(STATUS_LABELS[row["orgState"]]) + "</a></p>" + note + "</li>"
                )
            sections.append(
                "<section data-group=\"" + escape(category["id"]) + "\" id=\"" + "style-" + escape(category["id"]) + "\"><h3>"
                + escape(category["title"]) + "</h3><p class=\"category-note\">" + escape(category["note"])
                + "</p><ul class=\"names\">" + "".join(entries) + "</ul></section>"
            )
        content.append(
            "<section class=\"brand-family\" data-family-section=\"" + escape(family["id"]) + "\" id=\"" + "family-" + escape(family["id"])
            + "\"><h2>" + escape(family["title"]) + "</h2><p>" + escape(family["positioning"])
            + "</p><p class=\"muted\">Voice: " + escape(family["voice"]) + "</p>" + "".join(sections) + "</section>"
        )
    references = "<details><summary>Documented meme references and expressions excluded from the neutral brand</summary><ul>" + "".join(
        "<li><strong>" + escape(item["expression"]) + "</strong><p>" + escape(item["use"]) + "</p><a href=\""
        + escape(item["sourceUrl"]) + "\" rel=\"noreferrer\">Reference</a></li>" for item in data["memeReferences"]
    ) + "</ul></details>"
    footer = (
        "<footer><p>Favorites in this standalone HTML stay in memory. No data is submitted and no automatic network requests or analytics are used.</p>"
        "<p>A favorite does not choose the project name, approve publication or register a domain.</p><p>"
        + escape(data["brandReviewScope"]) + "</p>"
        "<p><a href=\"electoral-app-naming-explorer.json\">Canonical name catalog and API evidence</a> · "
        "<a href=\"electoral-app-naming-explorer.v1.json\">Preserved first categorized exploration</a></p>"
        + references + "</footer>"
    )
    return (
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
        "<meta name=\"referrer\" content=\"no-referrer\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; script-src &#39;unsafe-inline&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;\">"
        "<title>Voting brand naming explorer</title><style>" + STYLE + "</style></head><body><main>" + header + brief + shortlist + controls
        + "".join(content) + footer + "</main><script>" + FILTER_SCRIPT + "</script></body></html>"
    )

CANVAS = r'''import { useHostTheme, useCanvasState, Stack, Row, Grid, H1, H2, H3, Text, TextInput, Select, Checkbox, CollapsibleSection } from "cursor/canvas";
interface Candidate { inActiveFocus:boolean; id:string; brand:string; categoryId:string; familyId:string; meaning:string; recommendedVoting:boolean; esDomain:string; orgDomain:string; orgState:string; registryUrl:string; brandCheckState:string; brandNote?:string; brandEvidenceUrl?:string; round:string; [key:string]:unknown; }
interface NamingData { leadingCandidateId:string; currentRound:string; currentRoundCount:number; rounds:{id:string; title:string; count:number}[]; defaultView:{round:string; availability:string}; checkedAt:string; currentBrief:string; brandReviewScope:string; categories:{id:string; title:string; note:string; familyId:string}[]; brandFamilies:{id:string; title:string; positioning:string; voice:string; categoryIds:string[]}[]; candidates:Candidate[]; currentRoundDomainSummary:Record<string,number>; memeReferences:{id:string; expression:string; kind:string; use:string; sourceUrl:string}[]; [key:string]:unknown; }
const data: NamingData = __DATA__;
const labels:Record<string,string>={no_registry_record:".org: no registry record",registered:".org: registered",unknown:".org: unknown",not_checked:".org: not checked"};
const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export default function ElectoralAppNamingExplorer(){
 const theme=useHostTheme();
 const [query,setQuery]=useCanvasState("nameQuery","");
 const [round,setRound]=useCanvasState("nameRound_v4",data.defaultView.round);
 const [family,setFamily]=useCanvasState("nameFamily_v4","all");
 const [category,setCategory]=useCanvasState("nameCategory_v4","all");
 const [availability,setAvailability]=useCanvasState("nameAvailability_v4","all");
 const [favoritesOnly,setFavoritesOnly]=useCanvasState("nameFavoritesOnly",false);
 const [favorites,setFavorites]=useCanvasState<string[]>("nameFavorites",[]);
 const visible=data.candidates.filter(row=>
  normalize(row.brand+" "+row.meaning).includes(normalize(query)) &&
  (round==="all" || (round==="focus" ? row.inActiveFocus : row.round===round)) && (family==="all" || row.familyId===family) &&
  (category==="all" || row.categoryId===category) &&
  (availability==="all" || (row.orgState==="no_registry_record" && !row.brandCheckState.startsWith("existing_"))) &&
  (!favoritesOnly || favorites.includes(row.id)));
 const leading=data.candidates.find(row=>row.id===data.leadingCandidateId)!;
 const setFavorite=(id:string,checked:boolean)=>setFavorites(current=>checked?[...new Set([...current,id])]:current.filter(value=>value!==id));
 const toggleFavorites=(value:boolean)=>{setFavoritesOnly(value);if(value){setRound("all");setFamily("all");setCategory("all");}};
 return <Stack gap={24} style={{padding:24,maxWidth:1140,margin:"0 auto",color:theme.text.primary}}>
  <header><H1>Irreverent voting names and forum humor</H1>
   <H2>Selected project name: {leading.brand}</H2><Text>{leading.esDomain} · availability unverified.</Text>
   <Text>Explore blunt, absurd and forum-style voting names for the 29 November 2026 election.</Text>
   <p style={{fontSize:12,color:theme.text.secondary}}>{data.candidates.length} preserved ideas · {data.currentRoundCount} new focused names · {data.candidates.length-data.currentRoundCount} previous proposals · {data.brandFamilies.length} brand families · {data.categories.length} styles.</p>
  </header>
  <section style={{padding:"18px 0",borderTop:"1px solid "+theme.stroke.primary,borderBottom:"1px solid "+theme.stroke.primary}}>
   <H2>The current naming brief</H2><Text>{data.currentBrief}</Text>
   <p style={{fontSize:13,color:theme.text.secondary}}>Prefer jokes about preparing a vote and going to the polls. Most new names are original meme-style adaptations; documented memes and idioms are identified separately.</p>
   <p style={{fontSize:13,color:theme.text.secondary}}>Latest API batch: {data.currentRoundDomainSummary.no_registry_record} of {data.currentRoundCount} new .org names returned no registry record; {data.currentRoundDomainSummary.registered} were registered; {data.currentRoundDomainSummary.unknown+data.currentRoundDomainSummary.not_checked} remain unresolved. All .es availability and exact registrar prices remain unverified. No registry record is not a purchase guarantee.</p>
   <p style={{fontSize:12,color:theme.text.secondary}}>Registry checks: {data.checkedAt} · .es remains the preferred main domain.</p>
  </section>
  <aside><H2>Selected project name</H2><Row wrap gap={18}>{data.candidates.filter(row=>row.recommendedVoting).map(row=><a key={row.id} href={"#family-"+row.familyId} style={{color:theme.text.link}}>{row.brand}</a>)}</Row></aside>
  <Row wrap align="end" gap={16}>
   <label style={{minWidth:220,flex:1}}>Search names or meanings<TextInput value={query} onChange={setQuery} placeholder="For example: votar, papeleta, PDF"/></label>
   <label style={{minWidth:210}}>Proposal round<Select value={round} onChange={setRound} options={[{value:"focus",label:"Current focus: irreverent forum humor"},...data.rounds.map(item=>({value:item.id,label:item.title})),{value:"all",label:"All preserved proposals"}]}/></label>
   <label style={{minWidth:210}}>Brand family<Select value={family} onChange={setFamily} options={[{value:"all",label:"All brand families"},...data.brandFamilies.map(item=>({value:item.id,label:item.title}))]}/></label>
   <label style={{minWidth:210}}>Naming style<Select value={category} onChange={setCategory} options={[{value:"all",label:"All styles"},...data.categories.map(item=>({value:item.id,label:item.title}))]}/></label>
   <label style={{minWidth:210}}>Domain evidence<Select value={availability} onChange={setAvailability} options={[{value:"all",label:"All domain states"},{value:"promising",label:"No .org record; no recorded brand collision"}]}/></label>
   <Checkbox checked={favoritesOnly} onChange={toggleFavorites} label="Favorites only"/>
  </Row>
  <p aria-live="polite" style={{fontSize:13,color:theme.text.secondary}}>{visible.length} of {data.candidates.length} ideas shown · {favorites.length} favorites</p>
  {data.brandFamilies.map(group=>{
   const familyRows=visible.filter(row=>row.familyId===group.id);if(!familyRows.length)return null;
   return <section key={group.id} id={"family-"+group.id} style={{paddingTop:22,borderTop:"1px solid "+theme.stroke.primary}}>
    <H2>{group.title}</H2><Text>{group.positioning}</Text><p style={{fontSize:13,color:theme.text.secondary}}>Voice: {group.voice}</p>
    {data.categories.filter(item=>item.familyId===group.id).map(style=>{
     const rows=familyRows.filter(row=>row.categoryId===style.id);if(!rows.length)return null;
     return <section key={style.id} id={"style-"+style.id} style={{padding:"18px 0"}}>
      <H3>{style.title}</H3><p style={{fontSize:13,color:theme.text.secondary}}>{style.note}</p>
      <Grid columns="repeat(auto-fit, minmax(min(100%, 320px), 1fr))" gap={24}>
       {rows.map(row=><article key={row.id} style={{padding:"12px 0",borderBottom:"1px solid "+theme.stroke.tertiary}}>
        <Row justify="space-between" align="center"><Checkbox checked={favorites.includes(row.id)} onChange={checked=>setFavorite(row.id,checked)} label={<strong style={{fontSize:17}}>{row.brand}</strong>}/>
         {row.recommendedVoting?<span style={{fontSize:11,color:theme.text.link}}>Voting shortlist</span>:row.round==="earlier"?<span style={{fontSize:11,color:theme.text.secondary}}>Earlier idea</span>:null}
        </Row>
        <p style={{fontSize:14}}>{row.meaning}</p>
        <p style={{fontSize:12,color:theme.text.secondary}}>{row.esDomain} · .es unverified<br/>{row.orgDomain} · <a href={row.registryUrl} rel="noreferrer" style={{color:theme.text.link}}>{labels[row.orgState]}</a></p>
        {row.brandNote && <p style={{fontSize:12,fontWeight:600}}>{row.brandNote} {row.brandEvidenceUrl && <a href={row.brandEvidenceUrl} rel="noreferrer" style={{color:theme.text.link}}>Existing service</a>}</p>}
       </article>)}
      </Grid>
     </section>;
    })}
   </section>;
  })}
  <CollapsibleSection title="Documented meme references and expressions excluded from the neutral brand">
   <Stack gap={18}>{data.memeReferences.map(item=><article key={item.id}><strong>{item.expression}</strong><p style={{fontSize:13}}>{item.use}</p><a href={item.sourceUrl} rel="noreferrer" style={{color:theme.text.link,fontSize:12}}>Reference</a></article>)}</Stack>
  </CollapsibleSection>
  <footer style={{paddingTop:24,borderTop:"1px solid "+theme.stroke.primary}}>
   <Text>Favorites stay in the local canvas state. No automatic network requests, forms or analytics are used. A favorite does not choose the project name or register a domain.</Text>
   <p style={{fontSize:12,color:theme.text.secondary}}>{data.brandReviewScope}</p>
  </footer>
 </Stack>;
}
'''

def render_canvas(data):
    return CANVAS.replace("__DATA__", json.dumps(data, ensure_ascii=False, indent=2))

def main():
    parser = argparse.ArgumentParser(description="Render and check the canonical naming exploration.")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--canvas", type=Path)
    args = parser.parse_args()
    data = json.loads((DIRECTORY / "electoral-app-naming-explorer.json").read_text())
    validate(data)
    targets = [(DIRECTORY / "electoral-app-naming-explorer.html", render_html(data))]
    if args.canvas:
        targets.append((args.canvas, render_canvas(data)))
    for path, expected in targets:
        if args.check:
            if path.read_text() != expected:
                raise ValueError("Generated naming view differs from the catalog: " + str(path))
        else:
            path.write_text(expected)
    print("Naming catalog, prior-proposal preservation, brand families and generated views are consistent.")
    print("Registry evidence does not establish .es availability, trademark clearance or political neutrality.")

if __name__ == "__main__":
    main()
