import { expect } from 'chai';
import { Token } from '../src/token';
import { lex } from '../src/lexer';
import { parse, ast } from '../src/parser';
import { InstructionGenerator } from '../src/generate';
import { Instruction, Opcode, Register, Label, Global, OpBuilder } from '../src/assembly';


describe('generator', function () {
    describe('generate()', function () {
        it('A simple case', function () {
            const tokens: Token[] = lex("int main() {\n\treturn 2;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: Instruction[] = new InstructionGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.MOV).withOperands(2, Register.RAX).build(),
                new OpBuilder(Opcode.RET).withComment("main - return").build()
            ]);
        });
        it('Negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn -5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: Instruction[] = new InstructionGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.MOV).withOperands(5, Register.RAX).build(),
                new OpBuilder(Opcode.NEG).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.RET).withComment("main - return").build()
            ]);
        });
        it('Bitwise complement', function () {
            const tokens: Token[] = lex("int main() {\n\treturn ~5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: Instruction[] = new InstructionGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.MOV).withOperands(5, Register.RAX).build(),
                new OpBuilder(Opcode.XOR).withOperands(Register.RAX, "0xFFFF").build(),
                new OpBuilder(Opcode.RET).withComment("main - return").build()
            ]);
        });
        it('Logical negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn !5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: Instruction[] = new InstructionGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.MOV).withOperands(5, Register.RAX).build(),
                new OpBuilder(Opcode.CMP).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.SETE).withOperands(Register.AL).build(),
                new OpBuilder(Opcode.RET).withComment("main - return").build()
            ]);
        });
        it('Declaration and reference', function () {
            const tokens: Token[] = lex("int main() {\n\tint a = 0; a = a + 1; return 2 * a;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: Instruction[] = new InstructionGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.SUB).withOperands(8, Register.RSP).withComment("allocate `a`, 8 bytes").build(),
                new OpBuilder(Opcode.MOV).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, 8)).withComment("`a` assignment").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, 8), Register.RAX).withComment("`a` reference").build(),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(1, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.RCX).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.ADD).withOperands(Register.RCX, Register.RAX).withComment("+").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, 8)).withComment("`a` assignment").build(),
                new OpBuilder(Opcode.MOV).withOperands(2, Register.RAX).build(),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, 8), Register.RAX).withComment("`a` reference").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.RCX).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.IMUL).withOperands(Register.RCX, Register.RAX).withComment("*").build(),
                new OpBuilder(Opcode.ADD).withOperands(8, Register.RSP).withComment("deallocate 8 bytes").build(),
                new OpBuilder(Opcode.RET).withComment("main - return").build()
            ]);
        });
    });
});