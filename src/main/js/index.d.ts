interface Options {
  input: string,
  output: string,
  cwd?: string,
  basePrefix?: string,
  autoscope?: boolean,
  navPage?: boolean,
  navTitle?: string,
  navFooter?:string
  temp?: string
}
export declare function run(options: Options): void;
