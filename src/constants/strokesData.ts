// 定义笔画数据
export const strokes = [
  { name: "横", icon: "一", desc: "从左到右画一条直线" },
  { name: "竖", icon: "丨", desc: "从上到下画一条直线" },
  { name: "撇", icon: "丿", desc: "从右上向左下画斜线" },
  { name: "捺", icon: "㇏", desc: "从左上向右下画斜线" },
  { name: "点", icon: "丶", desc: "轻点用力按下" },
  { name: "折", icon: "⺄", desc: "转折改变方向" }
];

export type StrokeType = typeof strokes[number]['name'];
export type StrokePoint = {x: number, y: number, time: number};
export type StrokeSegment = StrokePoint[]; 