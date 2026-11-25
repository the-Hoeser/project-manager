import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadProjects, saveProjects } from './storage'
import { Activity, ArrowUpRight, BookOpen, Check, ChevronDown, Circle, Clock3, Github, LayoutDashboard, ListChecks, Plus, Search, Settings2, Sparkles, Target, X } from 'lucide-react'
import { parseMarkdownPlan, progressFromPhases, parseLogbook } from './progress'

type Project = {
  id: string; name: string; description: string; repo: string; branch: string; color: string;
  plan: string; log: string; updated: string; tracked: boolean
}
const initialProjects: Project[] = [
  { id:'hacktony', name:'HackTony', description:'Hackathon build · product prototype', repo:'hacktony', branch:'main', color:'coral', updated:'2 hours ago', tracked:true,
    plan:'# Foundation\n- [x] Initialize repo\n- [x] Create app shell\n- [x] Design initial flow\n# Product experience\n- [x] Landing experience\n- [x] Core navigation\n- [x] Responsive layout\n- [x] Form flows\n# Integrations\n- [x] GitHub connection flow\n- [x] Base data layer\n- [ ] External integrations\n- [ ] Error states\n# Polish & release\n- [ ] Accessibility pass\n- [ ] Final testing\n- [ ] Deploy',
    log:'- Added repository connection flow\n- Refined main dashboard interaction\n- Started integration wiring' },
  { id:'uncertainty', name:'LLM Uncertainty Research', description:'Experimental research · model calibration', repo:'llm-uncertainty-lab', branch:'main', color:'violet', updated:'Yesterday', tracked:true,
    plan:'# Research foundation\n- [x] Define research question\n- [x] Create experiment framework\n- [ ] Establish baseline\n# Experiment design\n- [x] Select initial model\n- [ ] Design uncertainty prompts\n- [ ] Create evaluation set\n- [ ] Run first experiment\n# Analysis\n- [ ] Calculate metrics\n- [ ] Analyze failure cases\n- [ ] Write results\n# Publication\n- [ ] Draft report\n- [ ] Review findings',
    log:'- Research question narrowed to self-recognition of uncertainty\n- Created experiment scaffold\n- Provider setup documented' },
  { id:'repopulse', name:'RepoPulse', description:'Project progress dashboard · no AI', repo:'project-manager', branch:'main', color:'cyan', updated:'Just now', tracked:true,
    plan:'# Product definition\n- [x] Define scope and non-AI principle\n- [x] Choose progress source of truth\n# Experience\n- [x] Set cinematic light visual direction\n- [ ] Build dashboard UI\n- [ ] Create project detail view\n- [ ] Add repository picker\n# GitHub integration\n- [ ] Implement OAuth safely\n- [ ] Read repository files\n- [ ] Sync commit activity\n# Progress engine\n- [ ] Parse Markdown checklists\n- [ ] Parse phase hierarchy\n- [ ] Connect plan file selection\n# Release\n- [ ] Persistence\n- [ ] Tests\n- [ ] Deploy',
    log:'- Started repository scaffold\n- Designed progress engine approach\n- Created initial dashboard shell' },
  { id:'waterplant', name:'Soft-PLC Water Plant', description:'OpenPLC simulation · SCADA HMI', repo:'soft-plc-water-plant', branch:'main', color:'amber', updated:'3 days ago', tracked:true,
    plan:'# PLC logic\n- [x] Define process states\n- [x] Configure tank level inputs\n- [x] Implement pump logic\n- [x] Add valve control\n# SCADA\n- [x] Create HMI layout\n- [x] Add status indicators\n- [x] Connect Modbus mapping\n- [x] Build bridge script\n# Validation\n- [x] Test PLC runtime\n- [ ] Test full HMI loop\n- [ ] Document deployment\n- [ ] Final demo',
    log:'- Added HMI bridge prototype\n- Connected Modbus TCP mapping\n- Process testing remains' },
  { id:'familytree', name:'Family Heritage', description:'Family stories · albums · genealogy', repo:'family-heritage', branch:'main', color:'pink', updated:'Last week', tracked:false,
    plan:'# Concept\n- [x] Define audience\n- [x] Album-first product wedge\n# Prototype\n- [ ] Create family profile\n- [ ] Upload albums\n- [ ] Story timeline\n- [ ] Invite relatives\n# Validation\n- [ ] Interview families\n- [ ] Prototype test',
    log:'- Concept notes drafted\n- Album-first wedge selected' },
]
const totalStats = (projects: Project[]) => {
  const tracked = projects.filter(p => p.tracked)
  const summaries = tracked.map(p => progressFromPhases(parseMarkdownPlan(p.plan)))
  const total = summaries.reduce((a, s) => a + s.total, 0)
  const done = summaries.reduce((a, s) => a + s.done, 0)
  return { active: tracked.length, done, total, average: total ? Math.round(done / total * 100) : 0 }
}
function App() {
  const [projects, setProjects] = useState(() => loadProjects(initialProjects))
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'overview'|'repos'|'activity'>('overview')
  const [selected, setSelected] = useState<Project | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [notice, setNotice] = useState('Demo data · Connect GitHub to replace these sample repositories')
  const stats = useMemo(() => totalStats(projects), [projects])
  useEffect(() => { saveProjects(projects) }, [projects])
  const visible = projects.filter(p => p.tracked && (p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase())))
  const toggleTrack = (id: string) => setProjects(prev => prev.map(p => p.id === id ? { ...p, tracked: !p.tracked } : p))
  const setTask = (projectId: string, phaseIndex: number, taskIndex: number, checked: boolean) => {
    const rebuildPlan = (plan: string) => {
      const phases = parseMarkdownPlan(plan)
      if (!phases[phaseIndex]?.tasks[taskIndex]) return plan
      phases[phaseIndex].tasks[taskIndex].done = checked
      return phases.map(ph => '# ' + ph.title + '\n' + ph.tasks.map(t => '- [' + (t.done ? 'x' : ' ') + '] ' + t.title).join('\n')).join('\n')
    }
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, plan: rebuildPlan(p.plan) } : p))
    setSelected(prev => prev?.id === projectId ? { ...prev, plan: rebuildPlan(prev.plan) } : prev)
  }
  const openProject = (project: Project) => setSelected(project)
  return <div className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={20}/></div><span>repo<span className="brand-accent">pulse</span></span></div>
      <div className="workspace"><div className="workspace-avatar">RP</div><div><strong>Personal workspace</strong><small>Project studio</small></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        <button className={view==='overview'?'nav-item active':'nav-item'} onClick={()=>{setView('overview');setSelected(null)}}><LayoutDashboard size={18}/> Overview</button>
        <button className={view==='repos'?'nav-item active':'nav-item'} onClick={()=>{setView('repos');setSelected(null)}}><Github size={18}/> Repositories <span className="nav-count">{projects.length}</span></button>
        <button className={view==='activity'?'nav-item active':'nav-item'} onClick={()=>{setView('activity');setSelected(null)}}><Activity size={18}/> Activity</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="github-status"><div className="status-dot"/><div><strong>GitHub connection</strong><small>Demo mode · not connected</small></div></div>
        <button className="nav-item settings" onClick={()=>setNotice('GitHub OAuth is the next integration milestone. This prototype currently uses local sample data.')}><Settings2 size={18}/> Settings</button>
        <div className="sidebar-foot">A little more clarity,<br/>every day.</div>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <div className="breadcrumb"><span>Workspace</span><span className="crumb-sep">/</span><strong>{selected ? selected.name : view==='overview'?'Overview':view==='repos'?'Repositories':'Activity'}</strong></div>
        <div className="top-actions"><div className="search-box"><Search size={16}/><input placeholder="Search projects..." value={query} onChange={e=>setQuery(e.target.value)}/><kbd>⌘ K</kbd></div><button className="avatar">RP</button></div>
      </header>
      {selected ? <ProjectDetail project={selected} onClose={()=>setSelected(null)} onTask={setTask}/> : view==='overview' ? <Overview projects={visible} stats={stats} onOpen={openProject} onAdd={()=>setShowPicker(true)} query={query}/> : view==='repos' ? <RepoView projects={projects} onToggle={toggleTrack} onOpen={openProject} query={query}/> : <ActivityView projects={projects.filter(p=>p.tracked)}/>}
      <div className="notice"><Sparkles size={14}/>{notice}</div>
    </main>
    {showPicker && <RepoPicker projects={projects} onToggle={toggleTrack} onClose={()=>setShowPicker(false)}/>}
  </div>
}
function Progress({percent,color='coral',large=false}:{percent:number;color?:string;large?:boolean}) {
  return <div className={large?'progress-track large':'progress-track'}><div className={'progress-fill '+color} style={{width:percent+'%'}}/></div>
}
function Overview({projects,stats,onOpen,onAdd,query}:{projects:Project[];stats:ReturnType<typeof totalStats>;onOpen:(p:Project)=>void;onAdd:()=>void;query:string}) {
  return <div className="page">
    <div className="page-heading"><div><div className="eyebrow">YOUR PROJECTS, IN MOTION</div><h1>A clearer view of<br/><em>what you're building.</em></h1><p className="heading-sub">Small steps. Real progress. All in one place.</p></div><button className="primary-btn" onClick={onAdd}><Plus size={17}/> Add project</button></div>
    <div className="stats-grid">
      <Stat label="Active projects" value={String(stats.active).padStart(2,'0')} icon={<Target size={17}/>} tint="pink"/>
      <Stat label="Tasks completed" value={stats.done+'/'+stats.total} icon={<Check size={17}/>} tint="violet"/>
      <Stat label="Overall progress" value={stats.average+'%'} icon={<Sparkles size={17}/>} tint="cyan"/>
    </div>
    <div className="section-heading"><div><h2>In your orbit</h2><p>Your active projects, at a glance.</p></div><button className="text-btn" onClick={onAdd}>Manage projects <ArrowUpRight size={15}/></button></div>
    <div className="project-grid">{projects.map((p,i)=><ProjectCard key={p.id} project={p} onOpen={onOpen} index={i}/>)}{!projects.length&&<div className="empty">No projects match “{query}”.</div>}</div>
    <div className="bottom-note"><span className="sparkle">✦</span><span>Progress is pulled from your plan, not guessed.</span></div>
  </div>
}
function Stat({label,value,icon,tint}:{label:string;value:string;icon:ReactNode;tint:string}) {
  return <div className="stat-card"><div className={'stat-icon '+tint}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>
}
function ProjectCard({project,onOpen,index}:{project:Project;onOpen:(p:Project)=>void;index:number}) {
  const phases=parseMarkdownPlan(project.plan),progress=progressFromPhases(phases)
  return <button className={'project-card '+project.color} style={{animationDelay:index*70+'ms'}} onClick={()=>onOpen(project)}>
    <div className="card-top"><div className="project-symbol"><Circle size={12}/></div><span className="card-status"><span/>Tracking</span><ArrowUpRight size={17} className="card-arrow"/></div>
    <div className="project-name">{project.name}</div><div className="project-desc">{project.description}</div>
    <div className="progress-wrap"><div className="progress-meta"><strong>{progress.percent}%</strong><span>{progress.done} of {progress.total} tasks</span></div><Progress percent={progress.percent} color={project.color}/></div>
    <div className="card-bottom"><div className="repo-name"><Github size={14}/>{project.repo}</div><div className="updated"><Clock3 size={13}/>{project.updated}</div></div>
  </button>
}
function ProjectDetail({project,onClose,onTask}:{project:Project;onClose:()=>void;onTask:(projectId:string,phaseIndex:number,taskIndex:number,checked:boolean)=>void}) {
  const phases=parseMarkdownPlan(project.plan), progress=progressFromPhases(phases), log=parseLogbook(project.log)
  return <div className="page detail-page">
    <button className="back-link" onClick={onClose}>← Back to overview</button>
    <div className="detail-hero"><div className={'detail-orb '+project.color}><div className="orb-inner"/></div><div className="detail-title"><div className="eyebrow">PROJECT DETAIL</div><h1>{project.name}</h1><p>{project.description}</p><div className="detail-links"><span><Github size={14}/>{project.repo}</span><span>·</span><span>{project.branch}</span><span>·</span><span>Updated {project.updated}</span></div></div></div>
    <div className="detail-progress"><div><div className="eyebrow">PROJECT COMPLETION</div><div className="big-percent">{progress.percent}<span>%</span></div><div className="progress-caption">{progress.done} of {progress.total} checklist items completed</div></div><div className="detail-progress-bar"><Progress percent={progress.percent} color={project.color} large/></div></div>
    <div className="detail-columns"><div className="phase-column"><div className="section-heading"><div><h2>Plan & milestones</h2><p>Check off tasks as they ship.</p></div><span className="phase-count">{phases.length} phases</span></div>
      {phases.map((phase,pi)=><div className="phase-card" key={phase.title}><div className="phase-header"><h3>{phase.title}</h3><span>{phase.tasks.filter(t=>t.done).length}/{phase.tasks.length}</span></div><div className="phase-progress"><Progress percent={Math.round(phase.tasks.filter(t=>t.done).length/phase.tasks.length*100)} color={project.color}/></div>{phase.tasks.map((task,ti)=><label className="task-row" key={task.title}><input type="checkbox" checked={task.done} onChange={e=>onTask(project.id,pi,ti,e.target.checked)}/><span className="task-check"><Check size={12}/></span><span className={task.done?'task-title done':'task-title'}>{task.title}</span></label>)}</div>)}
    </div><div className="activity-column"><div className="section-heading"><div><h2>Recent notes</h2><p>From your project logbook.</p></div></div><div className="log-card"><div className="log-title"><BookOpen size={16}/> Development log</div>{log.length?log.map((entry,i)=><div className="log-entry" key={i}><span className="log-dot"/><p>{entry}</p></div>):<p className="muted">No log entries found.</p>}<div className="log-foot">Sample log · replace when GitHub sync is connected</div></div><div className="source-card"><div className="source-icon"><ListChecks size={18}/></div><div><strong>Progress source</strong><p>Markdown checklists · deterministic calculation</p></div></div></div></div>
  </div>
}
function RepoView({projects,onToggle,onOpen,query}:{projects:Project[];onToggle:(id:string)=>void;onOpen:(p:Project)=>void;query:string}) {
  const filtered=projects.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())||p.repo.toLowerCase().includes(query.toLowerCase()))
  return <div className="page"><div className="page-heading compact"><div><div className="eyebrow">REPOSITORY LIBRARY</div><h1>Choose your <em>focus.</em></h1><p className="heading-sub">Track the repos you're actively working on.</p></div></div><div className="repo-list">{filtered.map(p=>{const pr=progressFromPhases(parseMarkdownPlan(p.plan));return <div className="repo-row" key={p.id}><div className={'repo-badge '+p.color}><Github size={18}/></div><div className="repo-main"><strong>{p.repo}</strong><small>{p.description}</small></div><div className="repo-progress-mini"><Progress percent={pr.percent} color={p.color}/><span>{pr.percent}%</span></div><button className={p.tracked?'track-btn tracked':'track-btn'} onClick={()=>onToggle(p.id)}>{p.tracked?<><Check size={14}/> Tracking</>:<><Plus size={14}/> Track</>}</button><button className="icon-btn" onClick={()=>onOpen(p)} title="Project details"><ArrowUpRight size={17}/></button></div>})}{!filtered.length&&<div className="empty">No repositories found.</div>}</div></div>
}
function ActivityView({projects}:{projects:Project[]}) {
  const items=projects.flatMap(p=>parseLogbook(p.log).map((entry,i)=>({project:p.name,entry,stamp:p.updated,key:p.id+'-'+i,color:p.color})))
  return <div className="page"><div className="page-heading compact"><div><div className="eyebrow">DEVELOPMENT TIMELINE</div><h1>Recent <em>momentum.</em></h1><p className="heading-sub">Activity notes across tracked projects.</p></div></div><div className="timeline">{items.map(item=><div className="timeline-item" key={item.key}><div className={'timeline-marker '+item.color}/><div className="timeline-content"><div className="timeline-meta"><strong>{item.project}</strong><span>{item.stamp}</span></div><p>{item.entry}</p></div></div>)}</div></div>
}
function RepoPicker({projects,onToggle,onClose}:{projects:Project[];onToggle:(id:string)=>void;onClose:()=>void}) {
  const [q,setQ]=useState('')
  const filtered=projects.filter(p=>p.repo.toLowerCase().includes(q.toLowerCase())||p.name.toLowerCase().includes(q.toLowerCase()))
  return <div className="modal-backdrop" onClick={onClose}><div className="picker-modal" onClick={e=>e.stopPropagation()}><div className="picker-head"><div><div className="eyebrow">REPOSITORY SELECTOR</div><h2>Make room for focus.</h2></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div><div className="search-box modal-search"><Search size={16}/><input autoFocus placeholder="Find a repository..." value={q} onChange={e=>setQ(e.target.value)}/></div><div className="picker-list">{filtered.map(p=><div className="picker-row" key={p.id}><div className={'repo-badge '+p.color}><Github size={16}/></div><div className="repo-main"><strong>{p.repo}</strong><small>{p.name}</small></div><button className={p.tracked?'track-btn tracked':'track-btn'} onClick={()=>onToggle(p.id)}>{p.tracked?<><Check size={14}/> Tracking</>:<><Plus size={14}/> Track</>}</button></div>)}</div><div className="picker-footer"><span>{projects.filter(p=>p.tracked).length} repositories tracked</span><button className="primary-btn" onClick={onClose}>Done</button></div></div></div>
}
export default App