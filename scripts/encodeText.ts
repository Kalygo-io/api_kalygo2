import { encoding_for_model } from "@dqbd/tiktoken";

const enc = encoding_for_model("gpt-3.5-turbo");
console.log(enc.encode("Hello World"));
console.log(enc.decode(enc.encode("Hello World")));
console.log(enc.decode_single_token_bytes(enc.encode("Hello World")[0]));
console.log(enc.decode_single_token_bytes(enc.encode("Hello World")[1]));
