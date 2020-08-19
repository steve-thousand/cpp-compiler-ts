import { expect } from 'chai';
import * as tokenize from '../../src/tokenize';
import * as ast from '../../src/ast';
import * as asm from '../../src/asm';


describe('generator', function () {
    describe('generate()', function () {
        it('A simple case', function () {
            const tokens: tokenize.Token[] = tokenize.lex("int main() {\n\treturn 2;\n}");
            const tree: ast.AST = ast.parse(tokens);
            const generated: asm.AsmStatement[] = new asm.AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new asm.Global("_main"),
                new asm.Label("_main"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(2, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_main_return")).build(),
                new asm.Label("_main_return"),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build()
            ]);
        });
        it('Negation', function () {
            const tokens: tokenize.Token[] = tokenize.lex("int main() {\n\treturn -5;\n}");
            const tree: ast.AST = ast.parse(tokens);
            const generated: asm.AsmStatement[] = new asm.AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new asm.Global("_main"),
                new asm.Label("_main"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(5, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.NEG).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_main_return")).build(),
                new asm.Label("_main_return"),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build()
            ]);
        });
        it('Bitwise complement', function () {
            const tokens: tokenize.Token[] = tokenize.lex("int main() {\n\treturn ~5;\n}");
            const tree: ast.AST = ast.parse(tokens);
            const generated: asm.AsmStatement[] = new asm.AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new asm.Global("_main"),
                new asm.Label("_main"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(5, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.XOR).withOperands(asm.Register.RAX, 0xFFFF).build(),
                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_main_return")).build(),
                new asm.Label("_main_return"),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build()
            ]);
        });
        it('Logical negation', function () {
            const tokens: tokenize.Token[] = tokenize.lex("int main() {\n\treturn !5;\n}");
            const tree: ast.AST = ast.parse(tokens);
            const generated: asm.AsmStatement[] = new asm.AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new asm.Global("_main"),
                new asm.Label("_main"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(5, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.CMP).withOperands(0, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(0, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.SETE).withOperands(asm.Register.AL).build(),
                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_main_return")).build(),
                new asm.Label("_main_return"),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build()
            ]);
        });
        it('Declaration and reference', function () {
            const tokens: tokenize.Token[] = tokenize.lex("int main() {\n\tint a = 0; a = a + 1; return 2 * a;\n}");
            const tree: ast.AST = ast.parse(tokens);
            const generated: asm.AsmStatement[] = new asm.AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new asm.Global("_main"),
                new asm.Label("_main"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.SUB).withOperands(8, asm.Register.RSP).withComment("allocate `a`, 8 bytes").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(0, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, -8)).withComment("`a` assignment").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.offset(asm.Register.RBP, -8), asm.Register.RAX).withComment("`a` reference").build(),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(1, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.RCX).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.ADD).withOperands(asm.Register.RCX, asm.Register.RAX).withComment("+").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, -8)).withComment("`a` assignment").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(2, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.offset(asm.Register.RBP, -8), asm.Register.RAX).withComment("`a` reference").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.RCX).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.IMUL).withOperands(asm.Register.RCX, asm.Register.RAX).withComment("*").build(),
                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_main_return")).build(),
                new asm.Label("_main_return"),
                new asm.OpBuilder(asm.Opcode.ADD).withOperands(8, asm.Register.RSP).withComment("deallocate 8 bytes").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build()
            ]);
        });
        it('Compound statements', function () {
            const tokens: tokenize.Token[] = tokenize.lex("int main() {\n\tint a = 0; {a = 1; int b = 2;} return a;\n}");
            const tree: ast.AST = ast.parse(tokens);
            const generated: asm.AsmStatement[] = new asm.AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new asm.Global("_main"),
                new asm.Label("_main"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.SUB).withOperands(8, asm.Register.RSP).withComment("allocate `a`, 8 bytes").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(0, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, -8)).withComment("`a` assignment").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(1, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, -8)).withComment("`a` assignment").build(),
                new asm.OpBuilder(asm.Opcode.SUB).withOperands(8, asm.Register.RSP).withComment("allocate `b`, 8 bytes").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(2, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, -16)).withComment("`b` assignment").build(),
                new asm.OpBuilder(asm.Opcode.ADD).withOperands(8, asm.Register.RSP).withComment("deallocate 8 bytes").build(), //deallocating bytes from compound statement
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.offset(asm.Register.RBP, -8), asm.Register.RAX).withComment("`a` reference").build(),
                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_main_return")).build(),
                new asm.Label("_main_return"),
                new asm.OpBuilder(asm.Opcode.ADD).withOperands(8, asm.Register.RSP).withComment("deallocate 8 bytes").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build()
            ]);
        });
        it('Do loop', function () {
            const tokens: tokenize.Token[] = tokenize.lex("int main() {\n\tint a = 0; do { a += 3; } while(a < 10); return a;\n}");
            const tree: ast.AST = ast.parse(tokens);
            const generated: asm.AsmStatement[] = new asm.AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new asm.Global("_main"),
                new asm.Label("_main"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.SUB).withOperands(8, asm.Register.RSP).withComment("allocate `a`, 8 bytes").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(0, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, -8)).withComment("`a` assignment").build(),

                //do
                new asm.Label("_loop_1"),

                // a += 3
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.offset(asm.Register.RBP, -8), asm.Register.RAX).withComment("`a` reference").build(),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(3, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.RCX).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.ADD).withOperands(asm.Register.RCX, asm.Register.RAX).withComment("+").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.offset(asm.Register.RBP, -8)).withComment("`a` assignment").build(),

                // while (a < 10);
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.offset(asm.Register.RBP, -8), asm.Register.RAX).withComment("`a` reference").build(),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(10, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.RCX).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.CMP).withOperands(asm.Register.RCX, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(0, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.SETL).withOperands(asm.Register.AL).withComment("<").build(),
                new asm.OpBuilder(asm.Opcode.CMP).withOperands(0, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.JE).withOperands(new asm.Label("_end_loop_1")).build(),
                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_loop_1")).build(),
                new asm.Label("_end_loop_1"),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.offset(asm.Register.RBP, -8), asm.Register.RAX).withComment("`a` reference").build(),

                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_main_return")).build(),
                new asm.Label("_main_return"),
                new asm.OpBuilder(asm.Opcode.ADD).withOperands(8, asm.Register.RSP).withComment("deallocate 8 bytes").build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build()
            ]);
        });
        it('Functions', function () {
            const tokens: tokenize.Token[] = tokenize.lex("int foo(int a) { return a * 2; } int main() { return foo(4); }");
            const tree: ast.AST = ast.parse(tokens);
            const generated: asm.AsmStatement[] = new asm.AssemblyGenerator().generate(tree);
            expect(generated).to.eql([
                new asm.Global("_foo"),
                new asm.Label("_foo"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),

                // a * 2
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.offset(asm.Register.RBP, 16), asm.Register.RAX).withComment("`a` reference").build(),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(2, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RAX, asm.Register.RCX).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.IMUL).withOperands(asm.Register.RCX, asm.Register.RAX).withComment("*").build(),

                //return from _foo
                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_foo_return")).build(),
                new asm.Label("_foo_return"),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build(),

                new asm.Global("_main"),
                new asm.Label("_main"),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RSP, asm.Register.RBP).build(),

                // foo(4);
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(4, asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.PUSH).withOperands(asm.Register.RAX).build(),
                new asm.OpBuilder(asm.Opcode.CALL).withOperands(new asm.Label("_foo")).build(),
                new asm.OpBuilder(asm.Opcode.ADD).withOperands(8, asm.Register.RSP).build(),

                new asm.OpBuilder(asm.Opcode.JMP).withOperands(new asm.Label("_main_return")).build(),
                new asm.Label("_main_return"),
                new asm.OpBuilder(asm.Opcode.MOV).withOperands(asm.Register.RBP, asm.Register.RSP).build(),
                new asm.OpBuilder(asm.Opcode.POP).withOperands(asm.Register.RBP).build(),
                new asm.OpBuilder(asm.Opcode.RET).build(),
            ]);
        });
    });
});