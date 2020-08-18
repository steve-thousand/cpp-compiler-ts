import { expect } from 'chai';
import { Token } from '../src/token';
import { lex } from '../src/lexer';
import { parse, ast } from '../src/parser';
import { AssemblyGenerator } from '../src/generate';
import { AsmStatement, Opcode, Register, Label, Global, OpBuilder } from '../src/assembly';


describe('generator', function () {
    describe('generate()', function () {
        it('A simple case', function () {
            const tokens: Token[] = lex("int main() {\n\treturn 2;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: AsmStatement[] = new AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(2, Register.RAX).build(),
                new OpBuilder(Opcode.JMP).withOperands("_main_return").build(),
                new Label("_main_return"),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build()
            ]);
        });
        it('Negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn -5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: AsmStatement[] = new AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(5, Register.RAX).build(),
                new OpBuilder(Opcode.NEG).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.JMP).withOperands("_main_return").build(),
                new Label("_main_return"),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build()
            ]);
        });
        it('Bitwise complement', function () {
            const tokens: Token[] = lex("int main() {\n\treturn ~5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: AsmStatement[] = new AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(5, Register.RAX).build(),
                new OpBuilder(Opcode.XOR).withOperands(Register.RAX, "0xFFFF").build(),
                new OpBuilder(Opcode.JMP).withOperands("_main_return").build(),
                new Label("_main_return"),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build()
            ]);
        });
        it('Logical negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn !5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: AsmStatement[] = new AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(5, Register.RAX).build(),
                new OpBuilder(Opcode.CMP).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.SETE).withOperands(Register.AL).build(),
                new OpBuilder(Opcode.JMP).withOperands("_main_return").build(),
                new Label("_main_return"),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build()
            ]);
        });
        it('Declaration and reference', function () {
            const tokens: Token[] = lex("int main() {\n\tint a = 0; a = a + 1; return 2 * a;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: AsmStatement[] = new AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),
                new OpBuilder(Opcode.SUB).withOperands(8, Register.RSP).withComment("allocate `a`, 8 bytes").build(),
                new OpBuilder(Opcode.MOV).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, -8)).withComment("`a` assignment").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, -8), Register.RAX).withComment("`a` reference").build(),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(1, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.RCX).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.ADD).withOperands(Register.RCX, Register.RAX).withComment("+").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, -8)).withComment("`a` assignment").build(),
                new OpBuilder(Opcode.MOV).withOperands(2, Register.RAX).build(),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, -8), Register.RAX).withComment("`a` reference").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.RCX).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.IMUL).withOperands(Register.RCX, Register.RAX).withComment("*").build(),
                new OpBuilder(Opcode.JMP).withOperands("_main_return").build(),
                new Label("_main_return"),
                new OpBuilder(Opcode.ADD).withOperands(8, Register.RSP).withComment("deallocate 8 bytes").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build()
            ]);
        });
        it('Compound statements', function () {
            const tokens: Token[] = lex("int main() {\n\tint a = 0; {a = 1; int b = 2;} return a;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: AsmStatement[] = new AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),
                new OpBuilder(Opcode.SUB).withOperands(8, Register.RSP).withComment("allocate `a`, 8 bytes").build(),
                new OpBuilder(Opcode.MOV).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, -8)).withComment("`a` assignment").build(),
                new OpBuilder(Opcode.MOV).withOperands(1, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, -8)).withComment("`a` assignment").build(),
                new OpBuilder(Opcode.SUB).withOperands(8, Register.RSP).withComment("allocate `b`, 8 bytes").build(),
                new OpBuilder(Opcode.MOV).withOperands(2, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, -16)).withComment("`b` assignment").build(),
                new OpBuilder(Opcode.ADD).withOperands(8, Register.RSP).withComment("deallocate 8 bytes").build(), //deallocating bytes from compound statement
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, -8), Register.RAX).withComment("`a` reference").build(),
                new OpBuilder(Opcode.JMP).withOperands("_main_return").build(),
                new Label("_main_return"),
                new OpBuilder(Opcode.ADD).withOperands(8, Register.RSP).withComment("deallocate 8 bytes").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build()
            ]);
        });
        it('Do loop', function () {
            const tokens: Token[] = lex("int main() {\n\tint a = 0; do { a += 3; } while(a < 10); return a;\n}");
            const tree: ast.AST = parse(tokens);
            const generated: AsmStatement[] = new AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),
                new OpBuilder(Opcode.SUB).withOperands(8, Register.RSP).withComment("allocate `a`, 8 bytes").build(),
                new OpBuilder(Opcode.MOV).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, -8)).withComment("`a` assignment").build(),

                //do
                new Label("_loop_1"),

                // a += 3
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, -8), Register.RAX).withComment("`a` reference").build(),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(3, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.RCX).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.ADD).withOperands(Register.RCX, Register.RAX).withComment("+").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.offset(Register.RBP, -8)).withComment("`a` assignment").build(),

                // while (a < 10);
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, -8), Register.RAX).withComment("`a` reference").build(),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(10, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.RCX).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.CMP).withOperands(Register.RCX, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.SETL).withOperands(Register.AL).withComment("<").build(),
                new OpBuilder(Opcode.CMP).withOperands(0, Register.RAX).build(),
                new OpBuilder(Opcode.JE).withOperands("_end_loop_1").build(),
                new OpBuilder(Opcode.JMP).withOperands("_loop_1").build(),
                new Label("_end_loop_1"),
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, -8), Register.RAX).withComment("`a` reference").build(),

                new OpBuilder(Opcode.JMP).withOperands("_main_return").build(),
                new Label("_main_return"),
                new OpBuilder(Opcode.ADD).withOperands(8, Register.RSP).withComment("deallocate 8 bytes").build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build()
            ]);
        });
        it('Functions', function () {
            const tokens: Token[] = lex("int foo(int a) { return a * 2; } int main() { return foo(4); }");
            const tree: ast.AST = parse(tokens);
            const generated: AsmStatement[] = new AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new Global("_foo"),
                new Label("_foo"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),

                // a * 2
                new OpBuilder(Opcode.MOV).withOperands(Register.offset(Register.RBP, 16), Register.RAX).withComment("`a` reference").build(),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(2, Register.RAX).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RAX, Register.RCX).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.IMUL).withOperands(Register.RCX, Register.RAX).withComment("*").build(),

                //return from _foo
                new OpBuilder(Opcode.JMP).withOperands("_foo_return").build(),
                new Label("_foo_return"),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build(),

                new Global("_main"),
                new Label("_main"),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.MOV).withOperands(Register.RSP, Register.RBP).build(),

                // foo(4);
                new OpBuilder(Opcode.MOV).withOperands(4, Register.RAX).build(),
                new OpBuilder(Opcode.PUSH).withOperands(Register.RAX).build(),
                new OpBuilder(Opcode.CALL).withOperands("_foo").build(),
                new OpBuilder(Opcode.ADD).withOperands(8, Register.RSP).build(),

                new OpBuilder(Opcode.JMP).withOperands("_main_return").build(),
                new Label("_main_return"),
                new OpBuilder(Opcode.MOV).withOperands(Register.RBP, Register.RSP).build(),
                new OpBuilder(Opcode.POP).withOperands(Register.RBP).build(),
                new OpBuilder(Opcode.RET).build(),
            ]);
        });
    });
});