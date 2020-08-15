import { lex } from './lexer';
import { parse } from './parser';
import { InstructionGenerator } from './generate';
import * as fs from 'fs';
import { Instruction } from './assembly';

const codeFile = process.argv[2]
const outFile = process.argv[3]

const code = fs.readFileSync(codeFile, 'utf8');
const tokens = lex(code);
const ast = parse(tokens)
const instructions: Instruction[] = new InstructionGenerator().generate(ast);

const generatedCode = [];
for (let instruction of instructions) {
    generatedCode.push(instruction.toAssembly());
}

fs.writeFileSync(outFile, generatedCode.join('\n'));