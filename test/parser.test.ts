import { assert, expect } from 'chai';
import { lex } from '../src/lexer';
import { parse, ast } from '../src/parser';
import { Constant, UnOp } from '../src/ast';


describe('parser', function () {
    describe('parser()', function () {
        it('A simple case', function () {
            const tokens = lex("int main() {\n\treturn 2;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new Constant(2)
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return unary negation', function () {
            const tokens = lex("int main() {\n\treturn -5;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.UnOp(
                                ast.UnaryOperator.NEGATION,
                                new ast.Constant(5)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return unary bitwise complement', function () {
            const tokens = lex("int main() {\n\treturn ~12;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.UnOp(
                                ast.UnaryOperator.BITWISE_COMPLEMENT,
                                new ast.Constant(12)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return unary logical negation', function () {
            const tokens = lex("int main() {\n\treturn !1;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.UnOp(
                                ast.UnaryOperator.LOGICAL_NEGATION,
                                new ast.Constant(1)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });
    });
});