interface inputParam {
  input: string,
  output: string,
  cwd?: string,
  basePrefix?: string,
  autoscope?: boolean,
  navPage?: boolean,
  navTitle?: string,
  navFooter?:string
}
export declare function run(param: inputParam): void;

