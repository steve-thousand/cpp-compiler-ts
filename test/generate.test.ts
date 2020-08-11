import { expect } from 'chai';
import { Token } from '../src/token';
import { lex } from '../src/lexer';
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
                "    movq    $2, %rax\n" +
                "    ret                                    // main - return"
            );
        });
        it('Negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn -5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    movq    $5, %rax\n" +
                "    neg     %rax\n" +
                "    ret                                    // main - return"
            );
        });
        it('Bitwise complement', function () {
            const tokens: Token[] = lex("int main() {\n\treturn ~5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    movq    $5, %rax\n" +
                "    xor     %rax, 0xFFFF\n" +
                "    ret                                    // main - return"
            );
        });
        it('Logical negation', function () {
            const tokens: Token[] = lex("int main() {\n\treturn !5;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    movq    $5, %rax\n" +
                "    cmpq    $0, %rax\n" +
                "    movq    $0, %rax\n" +
                "    sete    %al\n" +
                "    ret                                    // main - return"
            );
        });
        it('Declaration and reference', function () {
            const tokens: Token[] = lex("int main() {\n\tint a = 0; a = a + 1; return 2 * a;\n}");
            const tree: ast.AST = parse(tokens);
            const generated = generate(tree);
            expect(generated).to.equal(
                " .globl _main\n" +
                "_main:\n" +
                "    subq    $8, %rsp                       // allocate `a`, 8 bytes\n" +
                "    movq    $0, %rax\n" +
                "    movq    %rax, 8(%rbp)                  // `a` assignment\n" +
                "    movq    8(%rbp), %rax                  // `a` reference\n" +
                "    pushq   %rax\n" +
                "    movq    $1, %rax\n" +
                "    movq    %rax, %rcx\n" +
                "    popq    %rax\n" +
                "    addq    %rcx, %rax                     // +\n" +
                "    movq    %rax, 8(%rbp)                  // `a` assignment\n" +
                "    movq    $2, %rax\n" +
                "    pushq   %rax\n" +
                "    movq    8(%rbp), %rax                  // `a` reference\n" +
                "    movq    %rax, %rcx\n" +
                "    popq    %rax\n" +
                "    imulq   %rcx, %rax                     // *\n" +
                "    addq    $8, %rsp                       // deallocate 8 bytes\n" +
                "    ret                                    // main - return"
            );
        });
    });
});