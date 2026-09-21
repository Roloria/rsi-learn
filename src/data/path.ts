export interface PathResource {
  type: "paper" | "book" | "blog" | "code" | "lab" | "video";
  title: string;
  source: string;
  url?: string;
}

export interface PathStep {
  id: string;
  title: string;
  desc: string;
  resources: PathResource[];
}

export interface PathStage {
  id: string;
  no: string;
  title: string;
  subtitle: string;
  duration: string;
  goal: string;
  steps: PathStep[];
}

export const LEARNING_PATH: PathStage[] = [
  {
    id: "stage-1",
    no: "01",
    title: "认知奠基",
    subtitle: "Foundations",
    duration: "约 1 周",
    goal: "能用自己的话说清：什么是 RSI、它依赖什么条件、和普通微调有什么区别。",
    steps: [
      {
        id: "s1-1",
        title: "理解智能爆炸的原始论证",
        desc: "从 I.J. Good 1965 年的一段话读起，理解「设计更好的机器」为什么会形成正反馈。",
        resources: [
          { type: "paper", title: "Speculations Concerning the First Ultraintelligent Machine", source: "I.J. Good, 1965", url: "https://www.sciencedirect.com/science/article/pii/S0065245815000328" },
          { type: "book", title: "《超级智能》第 2、4 章", source: "Nick Bostrom", url: "https://www.nickbostrom.com/superintelligence" },
        ],
      },
      {
        id: "s1-2",
        title: "掌握 RSI 核心循环的四步",
        desc: "生成变异 → 评估 → 选择 → 整合。在本站首页的循环图中对照理解每一步的输入输出。",
        resources: [
          { type: "blog", title: "本站 · 核心循环图解", source: "RSI 学习站", url: "#/" },
          { type: "blog", title: "AlphaZero 官方解读", source: "DeepMind Blog", url: "https://deepmind.google/discover/blog/alphazero-shedding-new-light-on-chess-shogi-and-go/" },
        ],
      },
      {
        id: "s1-3",
        title: "破除三个常见误解",
        desc: "① RSI ≠ 模型变大的 scaling；② RSI ≠ 无限自我复制；③ 评估器瓶颈意味着多数领域回路增益为负。",
        resources: [
          { type: "blog", title: "知识库 · 生成-评估差距", source: "RSI 学习站", url: "#/knowledge" },
        ],
      },
    ],
  },
  {
    id: "stage-2",
    no: "02",
    title: "原理深入",
    subtitle: "Principles",
    duration: "约 2 周",
    goal: "理解自举、自我对弈、可证明改进、种群进化四条理论路线，以及各自的前提与失败模式。",
    steps: [
      {
        id: "s2-1",
        title: "自举：STaR 的数学直觉",
        desc: "为什么「用自己生成的正确推理再训练自己」能爬升？过滤环节为什么是隐形瓶颈？",
        resources: [
          { type: "paper", title: "STaR: Bootstrapping Reasoning With Reasoning", source: "Zelikman et al., 2022", url: "https://arxiv.org/abs/2203.14465" },
        ],
      },
      {
        id: "s2-2",
        title: "自我对弈的适用条件",
        desc: "棋类为什么是完美环境（评估零噪声）；把 self-play 搬到开放任务需要补什么。",
        resources: [
          { type: "paper", title: "Mastering the game of Go without human knowledge", source: "Nature, 2017", url: "https://www.nature.com/articles/nature24270" },
        ],
      },
      {
        id: "s2-3",
        title: "可证明改进与哥德尔机",
        desc: "「只执行被证明有效的修改」在理论上如何保证安全，在实践中为何不可计算。",
        resources: [
          { type: "paper", title: "A Survey of Gödel Machines", source: "Schmidhuber", url: "https://arxiv.org/abs/cs/0309048" },
        ],
      },
      {
        id: "s2-4",
        title: "开放式进化与逃出局部最优",
        desc: "POET、新奇性搜索：为什么「发明新环境」比「更努力优化」更能打破停滞。",
        resources: [
          { type: "paper", title: "POET: Paired Open-Ended Trailblazer", source: "arXiv:1901.01753", url: "https://arxiv.org/abs/1901.01753" },
        ],
      },
    ],
  },
  {
    id: "stage-3",
    no: "03",
    title: "工程实践",
    subtitle: "Engineering",
    duration: "约 2–3 周",
    goal: "亲手搭一个最小自改进回路，并让它在真实任务上跑出可度量的提升。",
    steps: [
      {
        id: "s3-1",
        title: "提示层回路：Self-Refine / Reflexion",
        desc: "用 API 或开源模型复现「生成→自我反馈→改写」循环，观察哪些任务有效、哪些空转。",
        resources: [
          { type: "paper", title: "Self-Refine", source: "arXiv:2303.17651", url: "https://arxiv.org/abs/2303.17651" },
          { type: "paper", title: "Reflexion", source: "arXiv:2303.11366", url: "https://arxiv.org/abs/2303.11366" },
          { type: "code", title: "reflexion 仓库（含可运行 Agent）", source: "GitHub", url: "https://github.com/noahshinn/reflexion" },
        ],
      },
      {
        id: "s3-2",
        title: "在本站实验场跑通进化循环",
        desc: "选一个真实目标（你的产品策略/一份课件/一个难题），完整跑 12 轮，记录分数曲线与经验库，体会反思事件如何打破停滞。",
        resources: [
          { type: "lab", title: "实验场 · 发起你的第一个实验", source: "RSI 学习站", url: "#/lab" },
        ],
      },
      {
        id: "s3-3",
        title: "进化搜索：从 prompt 到代码",
        desc: "仿照 AlphaEvolve 的结构（种群+变异+客观评估器），为一个可评分的小问题写一个 100 行的进化优化器。",
        resources: [
          { type: "blog", title: "AlphaEvolve 技术解读", source: "DeepMind Blog", url: "https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/" },
          { type: "code", title: "FunSearch 仓库（同类思想）", source: "GitHub", url: "https://github.com/google-deepmind/funsearch" },
        ],
      },
    ],
  },
  {
    id: "stage-4",
    no: "04",
    title: "前沿研究",
    subtitle: "Frontier",
    duration: "持续",
    goal: "精读 2024–2025 代码级 RSI 与自动科研代表作，建立对「现在到了哪一步」的准确判断。",
    steps: [
      {
        id: "s4-1",
        title: "代码级自我重写：Darwin Gödel Machine",
        desc: "精读其评估协议（SWE-bench 实证）、岛屿模型与谱系存档；对比反事实实验。",
        resources: [
          { type: "paper", title: "Darwin Gödel Machine", source: "arXiv:2505.22954", url: "https://arxiv.org/abs/2505.22954" },
          { type: "code", title: "dgm 仓库", source: "GitHub", url: "https://github.com/SakanaAI/Darwin-Goedel-Machine" },
        ],
      },
      {
        id: "s4-2",
        title: "自动科研闭环：AI Scientist",
        desc: "关注其 reviewer 与 generator 同源带来的验证问题，以及安全事件复盘。",
        resources: [
          { type: "paper", title: "The AI Scientist", source: "arXiv:2408.06292", url: "https://arxiv.org/abs/2408.06292" },
        ],
      },
      {
        id: "s4-3",
        title: "自改进的极限与评估器研究",
        desc: "Weak-to-Strong、Self-Taught Evaluator：监督能力如何跟上生成能力。",
        resources: [
          { type: "paper", title: "Weak-to-Strong Generalization", source: "arXiv:2312.09390", url: "https://arxiv.org/abs/2312.09390" },
          { type: "paper", title: "Self-Taught Evaluator", source: "arXiv:2408.02666", url: "https://arxiv.org/abs/2408.02666" },
        ],
      },
    ],
  },
  {
    id: "stage-5",
    no: "05",
    title: "构建你自己的",
    subtitle: "Build Yours",
    duration: "长期",
    goal: "设计并迭代你自己的自改进 Agent 架构 —— 这也是本站的终极目标（见架构蓝图）。",
    steps: [
      {
        id: "s5-1",
        title: "为你的领域定义「更好」",
        desc: "写下可机读的评估函数，或诚实承认它是弱评估器并设计交叉验证。",
        resources: [
          { type: "blog", title: "架构蓝图 · 评估器设计", source: "RSI 学习站", url: "#/architecture" },
        ],
      },
      {
        id: "s5-2",
        title: "选择改进层级：L0–L3",
        desc: "从提示级回路起步，逐步下沉到工作流、代码、权重。每层的成本与可逆性不同。",
        resources: [
          { type: "blog", title: "架构蓝图 · 四个改进层级", source: "RSI 学习站", url: "#/architecture" },
        ],
      },
      {
        id: "s5-3",
        title: "装上护栏再加速",
        desc: "沙箱、回滚、tripwire、单轮小步、人类否决点——五件套齐了再把回路功率开大。",
        resources: [
          { type: "blog", title: "架构蓝图 · 安全层", source: "RSI 学习站", url: "#/architecture" },
          { type: "lab", title: "实验场 · 把你的架构跑起来", source: "RSI 学习站", url: "#/lab" },
        ],
      },
    ],
  },
];
