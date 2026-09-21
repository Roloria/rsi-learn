export interface Tactic {
  id: string;
  text: string;
  /** 每个 dim 的亲和度 0..1 */
  aff: Record<string, number>;
}

export interface DimDef {
  key: string;
  label: string;
  desc: string;
}

export interface ExperimentTemplate {
  id: string;
  name: string;
  en: string;
  emoji: string;
  tagline: string;
  objectivePlaceholder: string;
  objectiveExample: string;
  dims: DimDef[];
  seedBullets: string[];
  seedAff: Record<string, number>; // 种子要点的统一低亲和度
  tactics: Tactic[];
  insights: string[];
}

const PRODUCT: ExperimentTemplate = {
  id: "product",
  name: "产品策略改进",
  en: "Product Strategy",
  emoji: "🚀",
  tagline: "让一个产品策略在多目标约束下递归逼近最优解",
  objectivePlaceholder: "描述你的产品与目标，例如：一个面向大学生的笔记工具，希望在 3 个月内提升付费转化",
  objectiveExample: "一个面向大学生的笔记工具，3 个月内提升付费转化",
  dims: [
    { key: "growth", label: "增长性", desc: "预期能带来的增长幅度" },
    { key: "feas", label: "可行性", desc: "当前资源下的落地难度（越容易越高）" },
    { key: "diff", label: "差异化", desc: "相对竞品的独特性与壁垒" },
    { key: "durab", label: "长期价值", desc: "留存、复利与护城河" },
  ],
  seedBullets: ["全功能上线，覆盖所有用户需求", "按月订阅，统一定价"],
  seedAff: { growth: 0.15, feas: 0.2, diff: 0.1, durab: 0.12 },
  tactics: [
    { id: "p1", text: "聚焦单一高频痛点，砍掉所有非核心场景", aff: { feas: 0.85, diff: 0.5 } },
    { id: "p2", text: "建立内容飞轮：用户内容 → 分发 → 新用户 → 更多内容", aff: { growth: 0.85, durab: 0.7 } },
    { id: "p3", text: "免费增值 + 用量阶梯定价，降低进入门槛", aff: { growth: 0.7, feas: 0.65 } },
    { id: "p4", text: "与既有社区 / KOL 共建分发，借势冷启动", aff: { growth: 0.75, feas: 0.55 } },
    { id: "p5", text: "沉淀竞品拿不到的专有数据资产", aff: { diff: 0.9, durab: 0.8 } },
    { id: "p6", text: "7 天可交付的 MVP，先验证付费意愿再扩张", aff: { feas: 0.9 } },
    { id: "p7", text: "会员制 + 高频功能锁定留存", aff: { durab: 0.8, feas: 0.5 } },
    { id: "p8", text: "场景化模板库，让新用户 10 分钟内获得首次成功体验", aff: { growth: 0.65, feas: 0.7 } },
    { id: "p9", text: "深度服务前 100 个种子用户，把 NPS 做成增长引擎", aff: { durab: 0.75, feas: 0.6 } },
    { id: "p10", text: "自动化转介绍：邀请双方都获得真实价值", aff: { growth: 0.8 } },
    { id: "p11", text: "做工作流而非工具：嵌入用户日常例行动作", aff: { durab: 0.85, diff: 0.7 } },
    { id: "p12", text: "年付折扣 + 价格锚定，提升 LTV", aff: { durab: 0.65, feas: 0.55 } },
    { id: "p13", text: "差异化切入：先做竞品『不屑做』的市场", aff: { diff: 0.85, feas: 0.5 } },
    { id: "p14", text: "公开路线图与社区共创，把用户变成传播者", aff: { growth: 0.6, diff: 0.55 } },
    { id: "p15", text: "病毒式传播的分享物料自动生成器", aff: { growth: 0.9, feas: 0.35 } },
    { id: "p16", text: "先在单一垂直人群打透，再做相邻扩张", aff: { diff: 0.6, feas: 0.7, durab: 0.5 } },
  ],
  insights: [
    "当前策略组合疑似陷入『功能堆叠』局部最优——放弃小幅修补，一次性引入全新方向的大变异",
    "观察到增长动作相互稀释：跳出当前盆地，尝试与既有组合正交的全新打法",
    "反思：评分连续停滞说明现有搜索半径内无更优解，扩大变异幅度，允许暂时变差以穿过山谷",
  ],
};

const COURSE: ExperimentTemplate = {
  id: "course",
  name: "课件优化",
  en: "Courseware",
  emoji: "📚",
  tagline: "让一份课件在清晰、吸引、记忆与落地四个维度上迭代进化",
  objectivePlaceholder: "描述你的课件与受众，例如：给零基础学员的《Python 入门》第 1 章，目标是让他们真的学得会",
  objectiveExample: "给零基础学员的《Python 入门》第 1 章，目标是让他们真的学得会",
  dims: [
    { key: "clarity", label: "清晰度", desc: "概念是否讲得干净利落" },
    { key: "engage", label: "吸引力", desc: "学员是否愿意持续听下去" },
    { key: "retain", label: "记得住", desc: "一周后还能想起多少" },
    { key: "apply", label: "可落地", desc: "学完能不能立刻用起来" },
  ],
  seedBullets: ["按知识点顺序完整罗列全部内容", "章节末尾附练习题"],
  seedAff: { clarity: 0.2, engage: 0.1, retain: 0.15, apply: 0.12 },
  tactics: [
    { id: "c1", text: "每节课只讲一个核心概念，其余移入附录", aff: { clarity: 0.9, engage: 0.4 } },
    { id: "c2", text: "真实案例开场：先制造认知冲突再给答案", aff: { engage: 0.9 } },
    { id: "c3", text: "每个概念后加 30 秒自测，即时反馈", aff: { retain: 0.85, apply: 0.5 } },
    { id: "c4", text: "抽象原理转成可视类比 + 示意图", aff: { clarity: 0.8, engage: 0.5 } },
    { id: "c5", text: "间隔重复：核心知识在第 2、7、15 天重现", aff: { retain: 0.95 } },
    { id: "c6", text: "学完立刻做一个最小作品（实操练习）", aff: { apply: 0.95 } },
    { id: "c7", text: "用故事线串联章节，而非知识点罗列", aff: { engage: 0.8, retain: 0.4 } },
    { id: "c8", text: "课前预习清单 + 课后清单，降低认知负荷", aff: { clarity: 0.7, apply: 0.4 } },
    { id: "c9", text: "常见错误集锦：展示三个典型错误及修正", aff: { clarity: 0.65, apply: 0.6 } },
    { id: "c10", text: "分层标注基础/进阶，不同水平各取所需", aff: { clarity: 0.6, feas: 0.3, engage: 0.4 } as Record<string, number> },
    { id: "c11", text: "学员互相批改作业——教是最好的学", aff: { retain: 0.7, apply: 0.7 } },
    { id: "c12", text: "每章结尾一张思维导图回顾全局", aff: { clarity: 0.6, retain: 0.6 } },
    { id: "c13", text: "难度曲线平滑：相邻任务挑战提升 ≤ 10%", aff: { clarity: 0.55, engage: 0.5, apply: 0.4 } },
    { id: "c14", text: "学习小组 + 社区打卡，同伴压力维持动力", aff: { engage: 0.75, retain: 0.5 } },
    { id: "c15", text: "讲师出镜 + 实时弹幕互动直播答疑", aff: { engage: 0.85 } },
    { id: "c16", text: "把练习封装为游戏化关卡与即时奖励", aff: { engage: 0.9, apply: 0.5 } },
  ],
  insights: [
    "课件结构在『全面覆盖』的局部最优里徘徊——丢弃补丁式修改，重组整体叙事骨架",
    "反思：学员注意力是第一约束，接受内容量暂时下降，换取吸引力的阶跃提升",
    "检测到知识点密度过高导致记忆过载：大变异方向是激进的减法而非加法",
  ],
};

const PROBLEM: ExperimentTemplate = {
  id: "problem",
  name: "难题求解",
  en: "Hard Problem",
  emoji: "🧩",
  tagline: "对一个困难问题递归生成、评估并收敛解题策略",
  objectivePlaceholder: "描述你想解决的问题，例如：如何把团队周报的编写时间从 3 小时压缩到 30 分钟且信息不丢失",
  objectiveExample: "把团队周报编写时间从 3 小时压缩到 30 分钟且信息不丢失",
  dims: [
    { key: "depth", label: "洞察深度", desc: "是否触及问题的本质结构" },
    { key: "rigor", label: "严谨性", desc: "推理与证据链是否可靠" },
    { key: "creative", label: "创造性", desc: "是否跳出常规思路" },
    { key: "action", label: "可执行", desc: "明天早上能否开始做" },
  ],
  seedBullets: ["收集更多信息，全面分析后再行动", "参考行业内通行的解决方案"],
  seedAff: { depth: 0.18, rigor: 0.25, creative: 0.1, action: 0.15 },
  tactics: [
    { id: "h1", text: "把问题重新表述三遍——换个定义，问题可能直接消失", aff: { depth: 0.9, creative: 0.7 } },
    { id: "h2", text: "识别问题所属的已知难题类别，检索既有解法族", aff: { rigor: 0.8, action: 0.5 } },
    { id: "h3", text: "先证明简单方法为什么会失败——失败原因往往指向解法", aff: { depth: 0.85, rigor: 0.7 } },
    { id: "h4", text: "分解为可独立验证的子问题，逐个击破", aff: { rigor: 0.7, action: 0.75 } },
    { id: "h5", text: "寻找问题中的不变量与守恒量", aff: { depth: 0.9 } },
    { id: "h6", text: "从极端与边界情况倒推解的结构", aff: { depth: 0.8, creative: 0.6 } },
    { id: "h7", text: "构造对偶问题或反向问题", aff: { creative: 0.85, depth: 0.6 } },
    { id: "h8", text: "先解降低一档难度的简化版，再逐步推广", aff: { action: 0.8, rigor: 0.6 } },
    { id: "h9", text: "用量化模型替代定性争论", aff: { rigor: 0.9 } },
    { id: "h10", text: "跨领域同构：别的学科如何解决同构问题", aff: { creative: 0.9, depth: 0.5 } },
    { id: "h11", text: "设计最小实验区分竞争性假设", aff: { rigor: 0.8, action: 0.7 } },
    { id: "h12", text: "列出全部假设，逐一攻击最脆弱的一个", aff: { depth: 0.75, rigor: 0.6 } },
    { id: "h13", text: "先构造可证明可行的特例（充分条件优先）", aff: { rigor: 0.7, action: 0.6 } },
    { id: "h14", text: "设定 48 小时止损线与明确的换路标准", aff: { action: 0.9 } },
    { id: "h15", text: "邀请领域外的人用小白视角拷问方案", aff: { creative: 0.75, rigor: 0.4 } },
    { id: "h16", text: "把约束条件反转为设计资源（限制即方向）", aff: { creative: 0.85, action: 0.5 } },
  ],
  insights: [
    "分析框架反复套用却无进展——放弃『更全面的分析』，转向一个激进的新假设",
    "反思：可能问题本身是错位的——对上游一步的问题发起攻击，而非在原地深挖",
    "检测到过度规划倾向：搜索已收敛到纸面推演，注入偏向快速实验的大变异",
  ],
};

export const TEMPLATES: ExperimentTemplate[] = [PRODUCT, COURSE, PROBLEM];

export const getTemplate = (id: string) =>
  TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

export const MAX_ROUNDS = 15;
export const MAX_BULLETS = 7;
