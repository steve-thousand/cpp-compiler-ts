import { assert, expect } from 'chai';
import { lex, Token } from '../src/lexer';
import { parse, ast } from '../src/parser';
import { generate } from '../src/generate';


describe('generator', function () {
    describe('generate()', function () {
        it('A simple case', function () {
            const tokens: Token[] = lex("int main() {\n\treturn 2;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    push    %ebp\n" +
                "    movl    %esp, %ebp\n" +
                "    movl    $2, %eax\n" +
                "    movl    %ebp, %esp\n" +
                "    pop     %ebp\n" +
                "    ret     "
            );
        });
        it('Negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn -5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    push    %ebp\n" +
                "    movl    %esp, %ebp\n" +
                "    movl    $5, %eax\n" +
                "    neg     %eax\n" +
                "    movl    %ebp, %esp\n" +
                "    pop     %ebp\n" +
                "    ret     "
            );
        });
        it('Bitwise complement', function () {
            const tokens: Token[] = lex("int main() {\n\treturn ~5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    push    %ebp\n" +
                "    movl    %esp, %ebp\n" +
                "    movl    $5, %eax\n" +
                "    xor     %eax, 0xFFFF\n" +
                "    movl    %ebp, %esp\n" +
                "    pop     %ebp\n" +
                "    ret     "
            );
        });
        it('Logical negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn !5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    push    %ebp\n" +
                "    movl    %esp, %ebp\n" +
                "    movl    $5, %eax\n" +
                "    cmpl    $0, %eax\n" +
                "    movl    $0, %eax\n" +
                "    sete    %al\n" +
                "    movl    %ebp, %esp\n" +
                "    pop     %ebp\n" +
                "    ret     "
            );
        });
        it('Declaration and reference', function () {
            const tokens: Token[] = lex("int main() {\n\tint a = 0; a = a + 1; return 2 * a;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    push    %ebp\n" +
                "    movl    %esp, %ebp\n" +
                "    movl    $0, %eax\n" +
                "    push    %rax ; a\n" + //a
                "    movl    %esp - 4, %eax\n" + //a = 0
                "    push    %rax\n" +
                "    movl    $1, %eax\n" +
                "    movl    %eax, %ecx\n" +
                "    pop     %rax\n" +
                "    addl    %ecx, %eax\n" + //a + 1
                "    movl    %eax, %esp - 4\n" + //a = a + 1
                "    movl    $2, %eax\n" +
                "    push    %rax\n" +
                "    movl    %esp - 4, %eax\n" + //a
                "    movl    %eax, %ecx\n" +
                "    pop     %rax\n" + //2
                "    imul    %ecx, %eax\n" + //2 * a
                "    movl    %ebp, %esp\n" +
                "    pop     %ebp\n" +
                "    ret     "
            );
        });
    });
});