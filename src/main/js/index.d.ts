interface inputParam {
  input: string,
  output: string,
  cwd?: string,
  basePrefix?: string,
  autoscope?: boolean
}
export declare function run(param: inputParam): void;

