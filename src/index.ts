import { lex } from './lexer';
import { parse } from './parser';
import { generate } from './generate';
import * as fs from 'fs';

const codeFile = process.argv[2]
const outFile = process.argv[3]

const code = fs.readFileSync(codeFile, 'utf8');
const tokens = lex(code);
const ast = parse(tokens)
const compiledCode = generate(ast);
fs.writeFileSync(outFile, compiledCode);