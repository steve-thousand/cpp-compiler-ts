import { expect } from 'chai';
import { lex } from '../src/lexer';
import { parse, ast } from '../src/parser';


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
                            new ast.Constant(2)
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

        it('Return binary addition', function () {
            const tokens = lex("int main() {\n\treturn 2+3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.ADDITION,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return binary subtraction', function () {
            const tokens = lex("int main() {\n\treturn 2-3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.SUBTRACTION,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return binary multiplication', function () {
            const tokens = lex("int main() {\n\treturn 2*3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.MULTIPLICATION,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return binary division', function () {
            const tokens = lex("int main() {\n\treturn 2/3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.DIVISION,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Mixing binary math', function () {
            const tokens = lex("int main() {\n\treturn 2 + 3 * 4;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.ADDITION,
                                new ast.Constant(2),
                                new ast.BinOp(
                                    ast.BinaryOperator.MULTIPLICATION,
                                    new ast.Constant(3),
                                    new ast.Constant(4)
                                )
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return AND', function () {
            const tokens = lex("int main() {\n\treturn 2 && 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.AND,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return OR', function () {
            const tokens = lex("int main() {\n\treturn 2 || 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.OR,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return equal', function () {
            const tokens = lex("int main() {\n\treturn 2 == 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.EQUAL,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return not equal', function () {
            const tokens = lex("int main() {\n\treturn 2 != 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.NOT_EQUAL,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return greater than', function () {
            const tokens = lex("int main() {\n\treturn 2 > 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.GREATER_THAN,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return greater than or equal', function () {
            const tokens = lex("int main() {\n\treturn 2 >= 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.GREATER_THAN_OR_EQUAL,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return less than', function () {
            const tokens = lex("int main() {\n\treturn 2 < 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.LESS_THAN,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return less than or equal', function () {
            const tokens = lex("int main() {\n\treturn 2 <= 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.LESS_THAN_OR_EQUAL,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });
    });
});