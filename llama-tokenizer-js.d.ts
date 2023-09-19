declare module "llama-tokenizer-js" {
  function encode(
    prompt: string,
    add_bos_token: boolean = true,
    add_preceding_space: boolean = true,
    log_performance: boolean = false
  ): Number[];
}
