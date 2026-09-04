import { useMemo, useState, type ReactNode } from 'react';

type Role = 'trainee' | 'trainer' | 'admin';
type Stage =
  | 'landing' | 'login' | 'dashboard' | 'courses' | 'teachers'
  | 'pretest' | 'result' | 'booking' | 'teacherBooking'
  | 'lecture' | 'posttest' | 'final' | 'trainer' | 'admin';

type Question = { id: number; topic: string; q: string; options: string[]; answer: number };
type Course = { id: string; title: string; level: string; duration: string; description: string; topics: string[]; questions: Question[] };
type Trainer = { id: string; name: string; title: string; expertise: string[]; bio: string; slots: string[] };

const q = (id: number, topic: string, question: string, options: string[], answer: number): Question => ({ id, topic, q: question, options, answer });

const courses: Course[] = [
  {
    id: 'python', title: 'Python Fundamentals', level: 'Beginner', duration: '6 weeks',
    description: 'Build strong Python fundamentals and identify exactly which topics need improvement.',
    topics: ['Variables & Data Types', 'Loops', 'Functions', 'Lists & Dictionaries', 'OOP'],
    questions: [
      q(1,'Variables & Data Types','Which data type stores text in Python?',['int','str','float','bool'],1),
      q(2,'Variables & Data Types','What is the value of type(10)?',['str','float','int','list'],2),
      q(3,'Variables & Data Types','Which symbol starts a comment in Python?',['//','#','/*','--'],1),
      q(4,'Loops','Which keyword starts a for loop?',['loop','for','repeat','iterate'],1),
      q(5,'Loops','What does range(3) produce?',['1,2,3','0,1,2','0,1,2,3','3 only'],1),
      q(6,'Loops','Which statement skips to the next loop iteration?',['break','pass','continue','skip'],2),
      q(7,'Functions','Which keyword defines a function?',['func','def','function','define'],1),
      q(8,'Functions','How do you return a value from a function?',['send','return','yieldonly','give'],1),
      q(9,'Functions','A parameter is best described as:',['A function input','A loop','A data type','A module'],0),
      q(10,'Lists & Dictionaries','Which is a Python list?',['{1,2,3}','[1,2,3]','(1,2,3)','<1,2,3>'],1),
      q(11,'Lists & Dictionaries','Which method adds an item to a list?',['push()','append()','add()','insertEnd()'],1),
      q(12,'Lists & Dictionaries','A dictionary stores data as:',['indexes only','key-value pairs','rows','characters'],1),
      q(13,'OOP','Which keyword creates a class?',['object','class','struct','new'],1),
      q(14,'OOP','A method is generally a:',['Variable','Function inside a class','Module','Loop'],1),
      q(15,'OOP','Which method is commonly used as a Python constructor?',['__start__','__newclass__','__init__','constructor'],2),
    ],
  },
  {
    id: 'sql', title: 'SQL Fundamentals', level: 'Beginner', duration: '5 weeks',
    description: 'Learn querying, joins and aggregation with topic-wise assessment.',
    topics: ['SELECT & WHERE', 'JOINs', 'GROUP BY & Aggregation', 'Subqueries', 'Database Basics'],
    questions: [
      q(1,'SELECT & WHERE','Which command retrieves data?',['GET','SELECT','FETCHONLY','READ'],1),
      q(2,'SELECT & WHERE','Which clause filters rows?',['ORDER BY','WHERE','GROUP BY','HAVING'],1),
      q(3,'SELECT & WHERE','Which wildcard means any number of characters?',['_','%','*','?'],1),
      q(4,'JOINs','Which join returns matching rows from both tables?',['INNER JOIN','FULL JOIN','CROSS JOIN','SELF JOIN'],0),
      q(5,'JOINs','Which join keeps all rows from the left table?',['RIGHT JOIN','LEFT JOIN','INNER JOIN','CROSS JOIN'],1),
      q(6,'JOINs','A JOIN usually connects tables using a:',['Primary/foreign key relationship','CSS class','Loop','File'],0),
      q(7,'GROUP BY & Aggregation','Which function counts rows?',['SUM','COUNT','TOTALROWS','NUMBER'],1),
      q(8,'GROUP BY & Aggregation','Which clause groups rows?',['GROUP BY','GROUP','COLLECT','ORDER'],0),
      q(9,'GROUP BY & Aggregation','Which function calculates an average?',['MEAN','AVG','AVERAGEOF','MID'],1),
      q(10,'Subqueries','A query inside another query is a:',['Nested loop','Subquery','Join','Trigger'],1),
      q(11,'Subqueries','Which operator can test whether a subquery returns values?',['IN','HAS','WITHIN','MATCHES'],0),
      q(12,'Subqueries','A correlated subquery can reference the:',['Outer query','CSS','Server OS','Index only'],0),
      q(13,'Database Basics','A primary key should be:',['Duplicate','Unique for each row','Always text','Optional in every row'],1),
      q(14,'Database Basics','Which command creates a table?',['MAKE TABLE','CREATE TABLE','NEW TABLE','BUILD'],1),
      q(15,'Database Basics','Which command changes existing rows?',['UPDATE','ALTERROW','CHANGE','MODIFYROW'],0),
    ],
  },
  {
    id: 'cloud', title: 'Cloud Computing Basics', level: 'Intermediate', duration: '6 weeks',
    description: 'Understand cloud concepts, AWS basics, security and cost management.',
    topics: ['Cloud Concepts', 'AWS Core Services', 'Networking', 'Security', 'Cost Management'],
    questions: [
      q(1,'Cloud Concepts','Which model provides virtualized infrastructure?',['SaaS','PaaS','IaaS','DaaS'],2),
      q(2,'Cloud Concepts','Cloud elasticity means resources can:',['Never change','Scale with demand','Only decrease','Only run locally'],1),
      q(3,'Cloud Concepts','Which is a benefit of cloud computing?',['On-demand resources','No internet ever needed','No security controls','Fixed capacity only'],0),
      q(4,'AWS Core Services','Which AWS service is object storage?',['EC2','S3','RDS','VPC'],1),
      q(5,'AWS Core Services','EC2 mainly provides:',['Virtual servers','DNS only','Object storage','Email'],0),
      q(6,'AWS Core Services','RDS is mainly for:',['Managed databases','Containers only','Images','Networking cables'],0),
      q(7,'Networking','A VPC is a:',['Virtual network','Database','File','CPU'],0),
      q(8,'Networking','Which service translates domain names to IP addresses?',['Route 53','S3','IAM','Lambda'],0),
      q(9,'Networking','A subnet is a smaller network inside a:',['VPC','Bucket','Database row','CPU'],0),
      q(10,'Security','IAM controls:',['Identity and access','Weather','Storage temperature','Billing only'],0),
      q(11,'Security','Least privilege means users get:',['Maximum access','Only required access','No access','Admin always'],1),
      q(12,'Security','MFA adds:',['A second verification factor','More storage','A new subnet','A backup database'],0),
      q(13,'Cost Management','Which helps track AWS spending?',['Cost Explorer','EC2 Console only','S3 Browser','IAM'],0),
      q(14,'Cost Management','Reserved/committed pricing can help when usage is:',['Predictable','Random only','Zero','Offline'],0),
      q(15,'Cost Management','A good cost practice is to:',['Delete unused resources','Create unlimited servers','Disable monitoring','Ignore budgets'],0),
    ],
  },
];

const trainers: Trainer[] = [
  { id:'t1', name:'Dr. Priya Sharma', title:'Senior Python & OOP Trainer', expertise:['Variables & Data Types','Loops','Functions','Lists & Dictionaries','OOP'], bio:'8+ years teaching Python, programming fundamentals and OOP.', slots:['Today • 6:00 PM - 7:00 PM','Tomorrow • 5:00 PM - 6:00 PM','Saturday • 11:00 AM - 12:00 PM'] },
  { id:'t2', name:'Prof. Amit Patel', title:'SQL & Database Trainer', expertise:['SELECT & WHERE','JOINs','GROUP BY & Aggregation','Subqueries','Database Basics'], bio:'Database specialist focused on practical SQL and interview skills.', slots:['Today • 7:00 PM - 8:00 PM','Friday • 5:30 PM - 6:30 PM','Sunday • 11:00 AM - 12:00 PM'] },
  { id:'t3', name:'Dr. Rajesh Verma', title:'Cloud & AWS Trainer', expertise:['Cloud Concepts','AWS Core Services','Networking','Security','Cost Management'], bio:'Cloud practitioner helping learners build production-ready AWS skills.', slots:['Tomorrow • 6:00 PM - 7:00 PM','Saturday • 4:00 PM - 5:00 PM','Sunday • 10:00 AM - 11:00 AM'] },
];

function Button({ children, onClick, secondary=false, disabled=false }: { children: ReactNode; onClick?: () => void; secondary?: boolean; disabled?: boolean }) {
  return <button disabled={disabled} onClick={onClick} className={`px-5 py-2.5 rounded-lg font-medium transition ${secondary ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' : 'bg-[#1F5F95] text-white hover:bg-[#174b77]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{children}</button>;
}
function Card({ children, className='' }: { children: ReactNode; className?: string }) { return <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>{children}</div>; }

function Header({ onHome, role }: { onHome: () => void; role: Role }) {
  return <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
    <button onClick={onHome} className="text-xl font-bold text-[#1F5F95]">SkillSphere</button>
    <div className="flex items-center gap-4">
      <span className="hidden md:block text-sm text-gray-500">Skill-based Learning & Assessment</span>
      {role === 'trainee' && <span className="text-xs bg-blue-50 text-[#1F5F95] px-3 py-1 rounded-full">Trainee</span>}
    </div>
  </header>;
}

export default function App() {
  const [stage, setStage] = useState<Stage>('landing');
  const [role, setRole] = useState<Role>('trainee');
  const [course, setCourse] = useState<Course | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [index, setIndex] = useState(0);
  const [weakTopics, setWeakTopics] = useState<{topic:string;score:number;total:number}[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [directTopic, setDirectTopic] = useState('');
  const [postAnswers, setPostAnswers] = useState<number[]>([]);
  const [preScore, setPreScore] = useState(0);
  const [postScore, setPostScore] = useState(0);

  const trainerForCourse = useMemo(() => course ? trainers.find(t => t.expertise.some(e => course.topics.includes(e))) : null, [course]);

  const topicStats = (qs: Question[], ans: number[]) => {
    if (!course) return [];
    return course.topics.map(topic => {
      const list = qs.filter(x => x.topic === topic);
      const correct = list.filter(x => {
        const pos = qs.indexOf(x);
        return ans[pos] === x.answer;
      }).length;
      return { topic, score: list.length ? Math.round(correct / list.length * 100) : 0, total: list.length };
    });
  };

  const startCourse = (c: Course) => {
    setCourse(c); setAnswers([]); setIndex(0); setWeakTopics([]); setPreScore(0); setPostScore(0); setStage('pretest');
  };

  const submitPre = () => {
    if (!course) return;
    const score = Math.round(answers.filter((a,i) => a === course.questions[i].answer).length / course.questions.length * 100);
    const stats = topicStats(course.questions, answers);
    setPreScore(score);
    setWeakTopics(stats.filter(s => s.score < 70).sort((a,b) => a.score - b.score));
    setStage('result');
  };

  const submitPost = () => {
    if (!course) return;
    const score = Math.round(postAnswers.filter((a,i) => a === course.questions[i].answer).length / course.questions.length * 100);
    setPostScore(score); setStage('final');
  };

  const resetToDashboard = () => {
    setCourse(null); setAnswers([]); setPostAnswers([]); setWeakTopics([]); setSelectedTrainer(null); setSelectedSlot(''); setDirectTopic(''); setStage('dashboard');
  };

  const quiz = (post = false) => {
    if (!course) return null;
    const qs = course.questions;
    const current = qs[index];
    const arr = post ? postAnswers : answers;
    const setArr = post ? setPostAnswers : setAnswers;
    const choose = (n: number) => setArr(prev => { const next = [...prev]; next[index] = n; return next; });
    return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={resetToDashboard}/><main className="max-w-3xl mx-auto p-6">
      <div className="mb-5"><p className="text-sm text-[#1F5F95] font-semibold">{post ? 'POST-TEST' : 'DIAGNOSTIC TEST'}</p><h1 className="text-2xl font-bold mt-1">{course.title}</h1><p className="text-gray-500 mt-1">Question {index + 1} of {qs.length} • Topic: {current.topic}</p></div>
      <div className="h-2 bg-gray-200 rounded-full mb-6"><div className="h-2 bg-[#1F5F95] rounded-full" style={{width:`${((index+1)/qs.length)*100}%`}} /></div>
      <Card className="p-7"><h2 className="text-xl font-bold">{current.q}</h2><div className="space-y-3 mt-6">{current.options.map((op,i)=><button key={op} onClick={()=>choose(i)} className={`w-full text-left p-4 border rounded-lg transition ${arr[index]===i?'border-[#1F5F95] bg-blue-50':'border-gray-200 hover:border-gray-400'}`}><span className="font-semibold mr-3">{String.fromCharCode(65+i)}.</span>{op}</button>)}</div>
        <div className="flex justify-between mt-7"><Button secondary disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}>← Previous</Button><Button disabled={arr[index]===undefined} onClick={()=>index===qs.length-1 ? (post ? submitPost() : submitPre()) : setIndex(i=>i+1)}>{index===qs.length-1 ? (post?'Finish Post-Test':'Submit Test') : 'Next →'}</Button></div>
      </Card></main></div>;
  };

  if (stage === 'landing') return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={()=>setStage('landing')}/><div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center px-6 py-20"><div><span className="text-sm font-semibold text-[#1F5F95]">COMPETENCY-BASED LEARNING</span><h1 className="text-5xl font-bold text-gray-900 mt-3 leading-tight">Learn what you need,<br/>not what you already know.</h1><p className="text-gray-600 text-lg mt-5">Choose a course, find your skill gaps, learn from a trainer, or directly book a lecture without taking a test.</p><div className="mt-7 flex gap-3"><Button onClick={()=>setStage('login')}>Get Started →</Button><Button secondary onClick={()=>setStage('dashboard')}>View Demo</Button></div></div><Card className="p-7"><h3 className="text-xl font-bold">How SkillSphere works</h3><div className="mt-6 space-y-5">{[['01','Choose Course','Take a topic-wise diagnostic test.'],['02','Find Your Gap','Wrong answers reveal weak topics.'],['03','Book Trainer','See the best trainer and available slots.'],['04','Direct Lecture','Or choose Teachers and book directly — no test required.'],['05','Post-Test','Measure improvement after the lecture.']].map(x=><div className="flex gap-4" key={x[0]}><span className="font-bold text-[#1F5F95]">{x[0]}</span><div><b>{x[1]}</b><p className="text-sm text-gray-500">{x[2]}</p></div></div>)}</div></Card></div></div>;

  if (stage === 'login') return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={()=>setStage('landing')}/><div className="max-w-md mx-auto py-20 px-5"><Card className="p-8"><h1 className="text-2xl font-bold">Login to SkillSphere</h1><p className="text-gray-500 mt-2">Prototype login — choose how you want to enter.</p><div className="mt-6 space-y-3">{(['trainee','trainer','admin'] as Role[]).map(r=><button key={r} onClick={()=>{setRole(r);setStage(r==='trainee'?'dashboard':r==='trainer'?'trainer':'admin')}} className="w-full text-left p-4 border rounded-lg hover:border-[#1F5F95] hover:bg-blue-50"><b className="capitalize">{r}</b><p className="text-sm text-gray-500">Continue as {r}</p></button>)}</div></Card></div></div>;

  if (stage === 'dashboard') return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={()=>setStage('landing')}/><main className="max-w-6xl mx-auto p-6"><div className="mb-8"><p className="text-sm text-[#1F5F95] font-semibold">TRAINEE DASHBOARD</p><h1 className="text-3xl font-bold mt-1">What do you want to do today?</h1><p className="text-gray-500 mt-2">You have two ways to learn on SkillSphere.</p></div><div className="grid md:grid-cols-2 gap-6"><Card className="p-8 hover:shadow-md transition"><div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">📚</div><h2 className="text-2xl font-bold mt-5">Courses</h2><p className="text-gray-500 mt-2">Take a 15-question diagnostic test, discover weak topics, get a recommended trainer and measure your improvement.</p><div className="mt-6"><Button onClick={()=>setStage('courses')}>Explore Courses →</Button></div></Card><Card className="p-8 hover:shadow-md transition"><div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">👨‍🏫</div><h2 className="text-2xl font-bold mt-5">Teachers</h2><p className="text-gray-500 mt-2">Already know what you want to learn? Choose a teacher, select your topic and book a lecture directly.</p><div className="mt-6"><Button onClick={()=>setStage('teachers')}>Find a Teacher →</Button></div><p className="text-xs text-green-700 mt-3">✓ No test required</p></Card></div></main></div>;

  if (stage === 'courses') return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={resetToDashboard}/><main className="max-w-6xl mx-auto p-6"><div className="flex items-center justify-between mb-7"><div><p className="text-[#1F5F95] font-semibold text-sm">COURSES</p><h1 className="text-3xl font-bold">Choose a course</h1><p className="text-gray-500">Your diagnostic test identifies topic-level skill gaps.</p></div><Button secondary onClick={()=>setStage('dashboard')}>← Dashboard</Button></div><div className="grid md:grid-cols-3 gap-5">{courses.map(c=><Card key={c.id} className="p-6 flex flex-col"><span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded w-fit">{c.level}</span><h2 className="text-xl font-bold mt-4">{c.title}</h2><p className="text-gray-500 text-sm mt-2 flex-1">{c.description}</p><div className="text-sm text-gray-500 mt-5">15 MCQs • {c.duration}</div><Button onClick={()=>startCourse(c)}>Start Diagnostic Test</Button></Card>)}</div></main></div>;

  if (stage === 'teachers') return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={resetToDashboard}/><main className="max-w-6xl mx-auto p-6"><div className="flex items-center justify-between mb-7"><div><p className="text-green-700 font-semibold text-sm">DIRECT LECTURE</p><h1 className="text-3xl font-bold">Find a Teacher</h1><p className="text-gray-500">No diagnostic test is required. Pick a teacher and book a slot directly.</p></div><Button secondary onClick={()=>setStage('dashboard')}>← Dashboard</Button></div><div className="grid md:grid-cols-3 gap-5">{trainers.map(t=><Card key={t.id} className="p-6 flex flex-col"><div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-[#1F5F95]">{t.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><h2 className="text-xl font-bold mt-4">{t.name}</h2><p className="text-[#1F5F95] text-sm font-medium mt-1">{t.title}</p><p className="text-gray-500 text-sm mt-3 flex-1">{t.bio}</p><div className="mt-4"><p className="text-xs font-semibold text-gray-500 mb-2">EXPERTISE</p><div className="flex flex-wrap gap-2">{t.expertise.map(e=><span key={e} className="text-xs bg-gray-100 px-2 py-1 rounded">{e}</span>)}</div></div><div className="mt-5"><Button onClick={()=>{setSelectedTrainer(t);setDirectTopic(t.expertise[0]);setSelectedSlot('');setStage('teacherBooking')}}>View Teacher & Slots →</Button></div></Card>)}</div></main></div>;

  if (stage === 'pretest') return quiz(false);
  if (stage === 'posttest') return quiz(true);

  if (stage === 'result' && course) return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={resetToDashboard}/><main className="max-w-5xl mx-auto p-6"><Card className="p-7"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Diagnostic result</p><h1 className="text-3xl font-bold">Your {course.title} skill gaps</h1></div><div className="text-center"><div className="text-4xl font-bold text-[#1F5F95]">{preScore}%</div><span className="text-sm text-gray-500">Overall score</span></div></div><div className="mt-7 grid md:grid-cols-2 gap-4">{course.topics.map(t=>{const s=topicStats(course.questions,answers).find(x=>x.topic===t)!;return <div className="border rounded-lg p-4" key={t}><div className="flex justify-between"><b>{t}</b><span className={s.score<70?'text-red-600':'text-green-600'}>{s.score}%</span></div><div className="h-2 bg-gray-200 rounded mt-3"><div className={`h-2 rounded ${s.score<70?'bg-red-500':'bg-green-500'}`} style={{width:`${s.score}%`}} /></div>{s.score<70&&<p className="text-sm text-red-600 mt-2">Needs improvement</p>}</div>})}</div></Card><Card className="p-7 mt-5"><h2 className="text-xl font-bold">Recommended trainer</h2><p className="text-gray-500 mt-1">Based on the topics where you made mistakes.</p>{weakTopics.length===0?<div className="mt-5 p-4 bg-green-50 text-green-700 rounded-lg">Excellent! No major topic gap was detected. You can still book a trainer for advanced practice.</div>:<div className="mt-5"><div className="flex flex-wrap gap-2 mb-5">{weakTopics.map(w=><span key={w.topic} className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm">{w.topic} • {w.score}%</span>)}</div>{trainerForCourse&&<div className="border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h3 className="text-lg font-bold">{trainerForCourse.name}</h3><p className="text-[#1F5F95]">{trainerForCourse.title}</p><p className="text-sm text-gray-500 mt-2">{trainerForCourse.bio}</p><div className="flex flex-wrap gap-2 mt-3">{trainerForCourse.expertise.filter(e=>weakTopics.some(w=>w.topic===e)).map(e=><span key={e} className="text-xs bg-blue-50 text-[#1F5F95] px-2 py-1 rounded">{e}</span>)}</div></div><Button onClick={()=>{setSelectedTrainer(trainerForCourse);setSelectedSlot('');setStage('booking')}}>View Slots →</Button></div>}</div>}<div className="mt-5"><Button secondary onClick={()=>setStage('teachers')}>Need another teacher? Book directly →</Button></div></Card></main></div>;

  if (stage === 'booking' && selectedTrainer && course) return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={resetToDashboard}/><main className="max-w-3xl mx-auto p-6"><Button secondary onClick={()=>setStage('result')}>← Back</Button><Card className="p-7 mt-5"><p className="text-sm text-gray-500">RECOMMENDED TRAINER</p><h1 className="text-3xl font-bold mt-1">{selectedTrainer.name}</h1><p className="text-[#1F5F95] font-medium">{selectedTrainer.title}</p><p className="text-gray-600 mt-3">{selectedTrainer.bio}</p><h2 className="text-xl font-bold mt-7">Select lecture slot</h2><div className="space-y-3 mt-4">{selectedTrainer.slots.map(slot=><button key={slot} onClick={()=>setSelectedSlot(slot)} className={`w-full text-left p-4 border rounded-lg ${selectedSlot===slot?'border-[#1F5F95] bg-blue-50':''}`}><span className="font-medium">{slot}</span><span className="block text-sm text-green-600 mt-1">Available</span></button>)}</div><div className="mt-6"><Button disabled={!selectedSlot} onClick={()=>setStage('lecture')}>Book Lecture</Button></div></Card></main></div>;

  if (stage === 'teacherBooking' && selectedTrainer) return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={resetToDashboard}/><main className="max-w-3xl mx-auto p-6"><Button secondary onClick={()=>setStage('teachers')}>← Teachers</Button><Card className="p-7 mt-5"><div className="flex items-start gap-4"><div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-[#1F5F95]">{selectedTrainer.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><p className="text-sm text-green-700 font-semibold">DIRECT TEACHER BOOKING</p><h1 className="text-3xl font-bold mt-1">{selectedTrainer.name}</h1><p className="text-[#1F5F95] font-medium">{selectedTrainer.title}</p></div></div><p className="text-gray-600 mt-4">{selectedTrainer.bio}</p><div className="mt-7"><h2 className="text-xl font-bold">Choose topic</h2><p className="text-sm text-gray-500 mt-1">Select what you want to learn in this lecture.</p><div className="flex flex-wrap gap-2 mt-4">{selectedTrainer.expertise.map(topic=><button key={topic} onClick={()=>setDirectTopic(topic)} className={`px-3 py-2 rounded-lg border text-sm ${directTopic===topic?'border-[#1F5F95] bg-blue-50 text-[#1F5F95]':'bg-white hover:border-gray-400'}`}>{topic}</button>)}</div></div><div className="mt-7"><h2 className="text-xl font-bold">Available lecture slots</h2><div className="space-y-3 mt-4">{selectedTrainer.slots.map(slot=><button key={slot} onClick={()=>setSelectedSlot(slot)} className={`w-full text-left p-4 border rounded-lg ${selectedSlot===slot?'border-[#1F5F95] bg-blue-50':''}`}><span className="font-medium">{slot}</span><span className="block text-sm text-green-600 mt-1">Available</span></button>)}</div></div><div className="mt-7 flex items-center gap-4"><Button disabled={!directTopic || !selectedSlot} onClick={()=>setStage('lecture')}>Book Lecture Directly</Button><span className="text-xs text-green-700">✓ No test required</span></div></Card></main></div>;

  if (stage === 'lecture' && selectedTrainer) return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={resetToDashboard}/><main className="max-w-3xl mx-auto p-6"><Card className="p-8"><span className="text-sm text-green-700 font-semibold">LECTURE BOOKED ✓</span><h1 className="text-3xl font-bold mt-2">Focused Lecture</h1><div className="mt-6 p-5 bg-blue-50 rounded-lg"><p className="font-semibold">Topic</p><p>{course ? (weakTopics.map(w=>w.topic).join(', ') || course.title) : directTopic}</p><p className="font-semibold mt-4">Trainer</p><p>{selectedTrainer.name} • {selectedTrainer.title}</p><p className="font-semibold mt-4">Time</p><p>{selectedSlot}</p></div><h2 className="text-xl font-bold mt-7">Lecture checklist</h2><div className="mt-4 space-y-3 text-gray-700"><p>✓ Join the trainer session at the booked time.</p><p>✓ Ask questions about your selected topic.</p><p>✓ Complete the focused lecture.</p>{course && <p>✓ Take the post-test to measure improvement.</p>}</div>{course ? <div className="mt-7"><Button onClick={()=>{setPostAnswers([]);setIndex(0);setStage('posttest')}}>Lecture Completed — Take Post-Test</Button></div> : <div className="mt-7"><Button onClick={resetToDashboard}>Back to Dashboard</Button></div>}</Card></main></div>;

  if (stage === 'final' && course) return <div className="min-h-screen bg-[#F5F7FA]"><Header role={role} onHome={resetToDashboard}/><main className="max-w-5xl mx-auto p-6"><Card className="p-8"><div className="text-center"><div className="inline-flex px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">Learning cycle completed</div><h1 className="text-3xl font-bold mt-4">Great work! 🎯</h1><p className="text-gray-500 mt-2">You completed the lecture and post-test for {course.title}.</p></div><div className="grid md:grid-cols-3 gap-4 mt-8"><div className="p-5 bg-gray-50 rounded-lg text-center"><p className="text-sm text-gray-500">Before lecture</p><b className="text-3xl">{preScore}%</b></div><div className="p-5 bg-blue-50 rounded-lg text-center"><p className="text-sm text-gray-500">After lecture</p><b className="text-3xl text-[#1F5F95]">{postScore}%</b></div><div className="p-5 bg-green-50 rounded-lg text-center"><p className="text-sm text-gray-500">Improvement</p><b className="text-3xl text-green-700">{postScore-preScore >= 0 ? postScore-preScore : 0}%</b></div></div><h2 className="text-xl font-bold mt-8">Topic-wise improvement</h2><div className="mt-4 space-y-3">{course.topics.map(t=>{const before=topicStats(course.questions,answers).find(x=>x.topic===t)?.score||0;const after=topicStats(course.questions,postAnswers).find(x=>x.topic===t)?.score||0;return <div key={t} className="border rounded-lg p-4 flex justify-between"><span>{t}</span><span><b>{before}%</b> → <b className="text-green-700">{after}%</b></span></div>})}</div><div className="mt-7 flex gap-3"><Button onClick={()=>setStage('courses')}>Choose Another Course</Button><Button secondary onClick={resetToDashboard}>Back to Dashboard</Button></div></Card></main></div>;

  if (stage === 'trainer') return <div className="min-h-screen bg-[#F5F7FA]"><Header role="trainer" onHome={()=>setStage('landing')}/><main className="max-w-5xl mx-auto p-6"><h1 className="text-3xl font-bold">Trainer Dashboard</h1><p className="text-gray-500 mt-1">Manage expertise and available lecture slots.</p><div className="grid md:grid-cols-3 gap-5 mt-6">{trainers.map(t=><Card key={t.id} className="p-5"><h2 className="font-bold text-lg">{t.name}</h2><p className="text-[#1F5F95] text-sm">{t.title}</p><div className="flex flex-wrap gap-2 mt-4">{t.expertise.map(e=><span key={e} className="text-xs bg-gray-100 px-2 py-1 rounded">{e}</span>)}</div><p className="font-semibold mt-5">Available slots</p>{t.slots.map(s=><p key={s} className="text-sm text-green-700 mt-1">• {s}</p>)}</Card>)}</div></main></div>;

  return <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center"><Card className="p-8"><p>Admin dashboard can be connected to the backend later.</p><div className="mt-4"><Button onClick={()=>setStage('landing')}>Back</Button></div></Card></div>;
}
