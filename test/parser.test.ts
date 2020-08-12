import { expect } from 'chai';
import { lex } from '../src/lexer';
import { parse, ast } from '../src/parser';
import { BinOp, CondExp } from '../src/ast';


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

        it('Return binary modulo', function () {
            const tokens = lex("int main() {\n\treturn 2 % 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.MODULO,
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

        it('Mixing binary math with parentheses', function () {
            const tokens = lex("int main() {\n\treturn (2 + 3) * 4;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.MULTIPLICATION,
                                new ast.BinOp(
                                    ast.BinaryOperator.ADDITION,
                                    new ast.Constant(2),
                                    new ast.Constant(3)
                                ),
                                new ast.Constant(4),
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Mixing binary math with parentheses again', function () {
            const tokens = lex("int main() {\n\treturn (5 + 4) / 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.DIVISION,
                                new ast.BinOp(
                                    ast.BinaryOperator.ADDITION,
                                    new ast.Constant(5),
                                    new ast.Constant(4)
                                ),
                                new ast.Constant(3),
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

        it('Return Bitwise AND', function () {
            const tokens = lex("int main() {\n\treturn 2 & 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.BITWISE_AND,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return Bitwise OR', function () {
            const tokens = lex("int main() {\n\treturn 2 | 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.BITWISE_OR,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return Bitwise XOR', function () {
            const tokens = lex("int main() {\n\treturn 2 ^ 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.BITWISE_XOR,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return Bitwise Shift Left', function () {
            const tokens = lex("int main() {\n\treturn 2 << 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.BITWISE_SHIFT_LEFT,
                                new ast.Constant(2),
                                new ast.Constant(3)
                            )
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Return Bitwise Shift Right', function () {
            const tokens = lex("int main() {\n\treturn 2 >> 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new ast.BinOp(
                                ast.BinaryOperator.BITWISE_SHIFT_RIGHT,
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

        it('Declaration and reference', function () {
            const tokens = lex("int main() {\n\tint a = 0; return a;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Declaration("a", new ast.Constant(0)),
                        new ast.Return(new ast.VarReference("a"))
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Declaration, assignment and reference', function () {
            const tokens = lex("int main() {\n\tint a = 0; a = a + 1; return a;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Declaration("a", new ast.Constant(0)),
                        new ast.ExpStatement(new ast.Assignment("a", new ast.BinOp(
                            ast.BinaryOperator.ADDITION,
                            new ast.VarReference("a"),
                            new ast.Constant(1)
                        ))),
                        new ast.Return(new ast.VarReference("a"))
                    ]
                    )
                )
            )).to.eql(tree);
        });

        //this comes out to be exactly the same as the previous, which maybe is fine?
        it('Compound assignment', function () {
            const tokens = lex("int main() {\n\tint a = 2; a += 3; return a;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Declaration("a", new ast.Constant(2)),
                        new ast.ExpStatement(new ast.Assignment("a", new ast.BinOp(
                            ast.BinaryOperator.ADDITION,
                            new ast.VarReference("a"),
                            new ast.Constant(3)
                        ))),
                        new ast.Return(new ast.VarReference("a"))
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('If', function () {
            const tokens = lex("int main() {\n\tif(1){ a = 2; } return a;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Conditional(
                            new ast.Constant(1),
                            new ast.ExpStatement(new ast.Assignment("a", new ast.Constant(2)))
                        ),
                        new ast.Return(new ast.VarReference("a"))
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Else', function () {
            const tokens = lex("int main() {\n\tif(1){ a = 2; } else { a = 3; } return a;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Conditional(
                            new ast.Constant(1),
                            new ast.ExpStatement(new ast.Assignment("a", new ast.Constant(2))),
                            new ast.ExpStatement(new ast.Assignment("a", new ast.Constant(3)))
                        ),
                        new ast.Return(new ast.VarReference("a"))
                    ]
                    )
                )
            )).to.eql(tree);
        });

        it('Ternary', function () {
            const tokens = lex("int main() {\n\treturn 1 ? 2 : 3;\n}");
            const tree = parse(tokens);
            expect(new ast.AST(
                new ast.Program(
                    new ast.Func(
                        "main", [
                        new ast.Return(
                            new CondExp(new ast.Constant(1), new ast.Constant(2), new ast.Constant(3))
                        )
                    ]
                    )
                )
            )).to.eql(tree);
        });
    });
});