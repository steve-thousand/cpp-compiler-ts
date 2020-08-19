import { lex } from './tokenize';
import { parse } from './ast';
import { AssemblyGenerator, AsmStatement } from './asm';
import * as fs from 'fs';

const codeFile = process.argv[2]
const outFile = process.argv[3]

const code = fs.readFileSync(codeFile, 'utf8');
const tokens = lex(code);
const ast = parse(tokens)
const instructions: AsmStatement[] = new AssemblyGenerator().generate(ast);

const generatedCode = [];
for (let instruction of instructions) {
    generatedCode.push(instruction.toAssembly());
}

fs.writeFileSync(outFile, generatedCode.join('\n'));