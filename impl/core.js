// import process from "node:process";

export const coreEnv = {
  '+': () => {
    arguments.reduce((a, b) => a + b, 0);
  },
  print: s => {
    throw new Error("Print is unimplemented, use println");
  },
  println: s => {
    console.log(s);
  },
};
